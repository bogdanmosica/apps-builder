import { and, desc, eq, gte, lte } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import {
  properties,
  propertyEvaluations,
  propertyQualityScores,
} from "@/lib/db/schema";
import {
  calculateAndSaveQualityScore,
  savePropertyEvaluation,
} from "@/lib/evaluation/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const propertyType = searchParams.get("propertyType");
    const listingType = searchParams.get("listingType");
    const city = searchParams.get("city");
    const county = searchParams.get("county");

    // Build query - start with base query for active properties
    const whereConditions = [eq(properties.status, "active")];

    if (propertyType)
      whereConditions.push(eq(properties.propertyType, propertyType));
    if (listingType)
      whereConditions.push(eq(properties.listingType, listingType));
    if (city) whereConditions.push(eq(properties.city, city));
    if (county) whereConditions.push(eq(properties.county, county));

    const allProperties = await db
      .select()
      .from(properties)
      .where(and(...whereConditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(properties.createdAt));

    return NextResponse.json(allProperties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (
      !body.title ||
      !body.propertyType ||
      !body.listingType ||
      !body.address ||
      !body.city ||
      !body.county ||
      !body.price
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create the property first
    const newProperty = await db
      .insert(properties)
      .values({
        userId: session.user.id,
        title: body.title,
        description: body.description || null,
        propertyType: body.propertyType,
        listingType: body.listingType,
        address: body.address,
        city: body.city,
        county: body.county,
        postalCode: body.postalCode || null,
        price: body.price,
        currency: body.currency || "EUR",
        area: body.area || null,
        rooms: body.rooms || null,
        bedrooms: body.bedrooms || null,
        bathrooms: body.bathrooms || null,
        floor: body.floor || null,
        totalFloors: body.totalFloors || null,
        yearBuilt: body.yearBuilt || null,
        features: body.features || null,
        amenities: body.amenities || null,
        status: "active",
        views: 0,
        featured: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const property = newProperty[0];

    // If evaluation answers were provided, save them and calculate quality score
    if (
      body.evaluationAnswers &&
      Object.keys(body.evaluationAnswers).length > 0
    ) {
      try {
        // Save individual evaluation answers
        const evaluationData = Object.entries(body.evaluationAnswers).map(
          ([questionId, answerChoiceId]) => ({
            questionId: parseInt(questionId),
            answerChoiceId: answerChoiceId as number,
          }),
        );

        await savePropertyEvaluation(
          property.id,
          evaluationData,
          session.user.id,
        );

        // Calculate and save quality score
        await calculateAndSaveQualityScore(property.id);
      } catch (evaluationError) {
        console.error("Error saving evaluation data:", evaluationError);
        // Property was created successfully, but evaluation failed
        // We'll still return the property but log the error
      }
    }

    return NextResponse.json({
      ...property,
      propertyId: property.id,
      message: "Property created successfully with quality evaluation",
    });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 },
    );
  }
}
