import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = parseInt(params.id);
    
    const property = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.status, "active")
      ))
      .limit(1);

    if (property.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment view count
    await db
      .update(properties)
      .set({ views: property[0].views + 1 })
      .where(eq(properties.id, propertyId));

    return NextResponse.json({
      ...property[0],
      views: property[0].views + 1
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyId = parseInt(params.id);
    const body = await request.json();

    // Check if property exists and belongs to user
    const existingProperty = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.userId, session.user.id)
      ))
      .limit(1);

    if (existingProperty.length === 0) {
      return NextResponse.json(
        { error: "Property not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update property
    const updatedProperty = await db
      .update(properties)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(properties.id, propertyId))
      .returning();

    return NextResponse.json(updatedProperty[0]);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyId = parseInt(params.id);

    // Check if property exists and belongs to user
    const existingProperty = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.userId, session.user.id)
      ))
      .limit(1);

    if (existingProperty.length === 0) {
      return NextResponse.json(
        { error: "Property not found or unauthorized" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to inactive
    await db
      .update(properties)
      .set({ 
        status: "inactive",
        updatedAt: new Date()
      })
      .where(eq(properties.id, propertyId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
