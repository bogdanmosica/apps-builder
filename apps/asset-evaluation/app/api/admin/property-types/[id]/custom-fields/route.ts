import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { customFields, propertyTypes } from "@/lib/db/schema";

// Validation schemas
const customFieldSchema = z.object({
  label_ro: z.string().min(1, "Romanian label is required"),
  label_en: z.string().optional(),
  fieldType: z.enum([
    "text",
    "number",
    "select",
    "textarea",
    "date",
    "boolean",
  ]),
  isRequired: z.boolean().default(false),
  placeholder_ro: z.string().optional(),
  placeholder_en: z.string().optional(),
  helpText_ro: z.string().optional(),
  helpText_en: z.string().optional(),
  selectOptions: z
    .array(
      z.object({
        value: z.string(),
        label_ro: z.string(),
        label_en: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  validation: z.record(z.any()).optional().default({}),
  sortOrder: z.number().optional().default(0),
});

// GET /api/admin/property-types/[id]/custom-fields
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;
    const propertyTypeId = parseInt(params.id);
    if (isNaN(propertyTypeId)) {
      return NextResponse.json(
        { error: "Invalid property type ID" },
        { status: 400 },
      );
    }

    // Verify property type exists
    const propertyType = await db.query.propertyTypes.findFirst({
      where: eq(propertyTypes.id, propertyTypeId),
    });

    if (!propertyType) {
      return NextResponse.json(
        { error: "Property type not found" },
        { status: 404 },
      );
    }

    // Get custom fields for this property type
    const fields = await db.query.customFields.findMany({
      where: eq(customFields.propertyTypeId, propertyTypeId),
      orderBy: [asc(customFields.sortOrder), asc(customFields.createdAt)],
    });

    return NextResponse.json({
      success: true,
      data: fields,
    });
  } catch (error) {
    console.error("Error fetching custom fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom fields" },
      { status: 500 },
    );
  }
}

// POST /api/admin/property-types/[id]/custom-fields
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;
    const propertyTypeId = parseInt(params.id);
    if (isNaN(propertyTypeId)) {
      return NextResponse.json(
        { error: "Invalid property type ID" },
        { status: 400 },
      );
    }

    // Verify property type exists
    const propertyType = await db.query.propertyTypes.findFirst({
      where: eq(propertyTypes.id, propertyTypeId),
    });

    if (!propertyType) {
      return NextResponse.json(
        { error: "Property type not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validation = customFieldSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      );
    }

    const fieldData = validation.data;

    // Validate select options if fieldType is 'select'
    if (
      fieldData.fieldType === "select" &&
      (!fieldData.selectOptions || fieldData.selectOptions.length === 0)
    ) {
      return NextResponse.json(
        { error: "Select fields must have at least one option" },
        { status: 400 },
      );
    }

    // Create the custom field
    const [newField] = await db
      .insert(customFields)
      .values({
        propertyTypeId,
        label_ro: fieldData.label_ro,
        label_en: fieldData.label_en || null,
        fieldType: fieldData.fieldType,
        isRequired: fieldData.isRequired,
        placeholder_ro: fieldData.placeholder_ro || null,
        placeholder_en: fieldData.placeholder_en || null,
        helpText_ro: fieldData.helpText_ro || null,
        helpText_en: fieldData.helpText_en || null,
        selectOptions: fieldData.selectOptions,
        validation: fieldData.validation,
        sortOrder: fieldData.sortOrder,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newField,
      message: "Custom field created successfully",
    });
  } catch (error) {
    console.error("Error creating custom field:", error);
    return NextResponse.json(
      { error: "Failed to create custom field" },
      { status: 500 },
    );
  }
}
