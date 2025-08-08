import { and, eq, ne, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import {
  evaluationSessions,
  propertyTypes,
  questionCategories,
} from "@/lib/db/schema";

const updatePropertyTypeSchema = z.object({
  name_ro: z.string().min(1, "Romanian name is required"),
  name_en: z.string().nullable(),
});

// GET /api/admin/property-types/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();

    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
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

    // Parse query parameters to determine what to include
    const url = new URL(request.url);
    const includeParam = url.searchParams.get("include");
    const includes = includeParam ? includeParam.split(",") : [];

    // Build the query with optional includes
    const shouldIncludeCategories = includes.includes("categories");
    const shouldIncludeQuestions = includes.includes("questions");
    const shouldIncludeAnswers = includes.includes("answers");

    let propertyType;

    if (shouldIncludeCategories) {
      propertyType = await db.query.propertyTypes.findFirst({
        where: eq(propertyTypes.id, id),
        with: {
          questionCategories: shouldIncludeQuestions
            ? {
                with: {
                  questions: shouldIncludeAnswers
                    ? {
                        with: {
                          answers: true,
                        },
                      }
                    : true,
                },
              }
            : true,
        },
      });
    } else {
      propertyType = await db.query.propertyTypes.findFirst({
        where: eq(propertyTypes.id, id),
      });
    }

    if (!propertyType) {
      return NextResponse.json(
        { success: false, error: "Property type not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: propertyType,
    });
  } catch (error) {
    console.error("Error fetching property type:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/property-types/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();

    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
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
    const validation = updatePropertyTypeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { name_ro, name_en } = validation.data;

    // Check if property type exists
    const existing = await db.query.propertyTypes.findFirst({
      where: eq(propertyTypes.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Property type not found" },
        { status: 404 },
      );
    }

    const [updatedPropertyType] = await db
      .update(propertyTypes)
      .set({
        name_ro,
        name_en,
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
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/property-types/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();

    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
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
    const existing = await db.query.propertyTypes.findFirst({
      where: eq(propertyTypes.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Property type not found" },
        { status: 404 },
      );
    }

    // Check if property type is used by question categories
    const categoriesUsingType = await db.query.questionCategories.findFirst({
      where: eq(questionCategories.propertyTypeId, id),
    });

    if (categoriesUsingType) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete property type. It is being used by question categories.",
        },
        { status: 409 },
      );
    }

    // Check if property type is used by evaluation sessions
    const evaluationsUsingType = await db.query.evaluationSessions.findFirst({
      where: eq(evaluationSessions.propertyTypeId, id),
    });

    if (evaluationsUsingType) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete property type. It has been used in evaluations.",
        },
        { status: 409 },
      );
    }

    await db.delete(propertyTypes).where(eq(propertyTypes.id, id));

    return NextResponse.json({
      success: true,
      message: "Property type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property type:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
