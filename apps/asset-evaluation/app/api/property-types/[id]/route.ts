import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { propertyTypes } from "@/lib/db/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid property type ID" },
        { status: 400 },
      );
    }

    const propertyType = await db
      .select()
      .from(propertyTypes)
      .where(eq(propertyTypes.id, id))
      .limit(1);

    if (propertyType.length === 0) {
      return NextResponse.json(
        { success: false, error: "Property type not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: propertyType[0],
    });
  } catch (error) {
    console.error("Error fetching property type:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch property type" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();

    // Only admin/owner users can update property types
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid property type ID" },
        { status: 400 },
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

    // Check if property type exists
    const existingPropertyType = await db
      .select()
      .from(propertyTypes)
      .where(eq(propertyTypes.id, id))
      .limit(1);

    if (existingPropertyType.length === 0) {
      return NextResponse.json(
        { success: false, error: "Property type not found" },
        { status: 404 },
      );
    }

    // Check if another property type with the same name already exists
    const duplicateCheck = await db
      .select()
      .from(propertyTypes)
      .where(eq(propertyTypes.name_ro, body.name_ro))
      .limit(1);

    if (duplicateCheck.length > 0 && duplicateCheck[0].id !== id) {
      return NextResponse.json(
        {
          success: false,
          error: "Another property type with this name already exists",
        },
        { status: 400 },
      );
    }

    // Update property type
    const [updatedPropertyType] = await db
      .update(propertyTypes)
      .set({
        name_ro: body.name_ro.trim(),
        name_en: body.name_en ? body.name_en.trim() : null,
        updatedAt: new Date(),
      })
      .where(eq(propertyTypes.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedPropertyType,
    });
  } catch (error) {
    console.error("Error updating property type:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update property type" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();

    // Only admin/owner users can delete property types
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid property type ID" },
        { status: 400 },
      );
    }

    // Check if property type exists
    const existingPropertyType = await db
      .select()
      .from(propertyTypes)
      .where(eq(propertyTypes.id, id))
      .limit(1);

    if (existingPropertyType.length === 0) {
      return NextResponse.json(
        { success: false, error: "Property type not found" },
        { status: 404 },
      );
    }

    // TODO: Check if there are any evaluations using this property type
    // and possibly prevent deletion if it's in use

    // Delete property type
    await db.delete(propertyTypes).where(eq(propertyTypes.id, id));

    return NextResponse.json({
      success: true,
      message: "Property type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property type:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete property type" },
      { status: 500 },
    );
  }
}
