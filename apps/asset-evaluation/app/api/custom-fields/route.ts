import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { customFields } from "@/lib/db/schema";

// GET /api/custom-fields?propertyTypeId=X
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyTypeId = searchParams.get("propertyTypeId");

    if (!propertyTypeId) {
      return NextResponse.json(
        { error: "Property type ID is required" },
        { status: 400 },
      );
    }

    const propertyTypeIdNum = parseInt(propertyTypeId, 10);
    if (isNaN(propertyTypeIdNum)) {
      return NextResponse.json(
        { error: "Invalid property type ID" },
        { status: 400 },
      );
    }

    console.log(
      `🔍 Fetching all custom fields for property type ${propertyTypeIdNum}...`,
    );

    // Fetch all custom fields for the specified property type, ordered by category and sort order
    const fields = await db
      .select()
      .from(customFields)
      .where(eq(customFields.propertyTypeId, propertyTypeIdNum))
      .orderBy(customFields.category, customFields.sortOrder, customFields.id);

    console.log(
      `✅ Found ${fields.length} total fields for property type ${propertyTypeIdNum}`,
    );

    // Group fields by category for better organization
    const fieldsByCategory = fields.reduce(
      (acc: Record<string, typeof fields>, field: (typeof fields)[0]) => {
        const category = field.category || "general";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(field);
        return acc;
      },
      {} as Record<string, typeof fields>,
    );

    console.log(
      `📊 Fields grouped into ${Object.keys(fieldsByCategory).length} categories:`,
      Object.keys(fieldsByCategory)
        .map((cat) => `${cat} (${fieldsByCategory[cat].length})`)
        .join(", "),
    );

    return NextResponse.json({
      success: true,
      customFields: fields, // Keep legacy format for compatibility
      data: {
        fields,
        fieldsByCategory,
        totalFields: fields.length,
        categories: Object.keys(fieldsByCategory),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching custom fields:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch custom fields",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
