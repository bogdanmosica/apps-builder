import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { propertyTypes } from "@/lib/db/schema";

export async function GET() {
  try {
    console.log("🔍 Fetching property types...");

    const types = await db
      .select()
      .from(propertyTypes)
      .orderBy(asc(propertyTypes.name_ro));

    console.log("✅ Retrieved property types:", types.length);

    return NextResponse.json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error("❌ Error fetching property types:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch property types",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    // Only admin/owner users can create property types
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate request body
    if (!body.name_ro || typeof body.name_ro !== "string") {
      return NextResponse.json(
        { success: false, error: "Name (Romanian) is required" },
        { status: 400 },
      );
    }

    // Check if property type with the same name already exists
    const existingPropertyType = await db
      .select()
      .from(propertyTypes)
      .where(eq(propertyTypes.name_ro, body.name_ro))
      .limit(1);

    if (existingPropertyType.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A property type with this name already exists",
        },
        { status: 400 },
      );
    }

    // Create property type
    const [newPropertyType] = await db
      .insert(propertyTypes)
      .values({
        name_ro: body.name_ro.trim(),
        name_en: body.name_en ? body.name_en.trim() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newPropertyType,
    });
  } catch (error) {
    console.error("Error creating property type:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create property type" },
      { status: 500 },
    );
  }
}
