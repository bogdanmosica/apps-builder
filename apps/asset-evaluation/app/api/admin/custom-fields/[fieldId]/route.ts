import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { customFields } from "@/lib/db/schema";

// Validation schema
const updateCustomFieldSchema = z.object({
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
  isActive: z.boolean().optional().default(true),
});

// PUT /api/admin/custom-fields/[fieldId]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ fieldId: string }> },
) {
  try {
    const user = await getUser();
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;
    const fieldId = parseInt(params.fieldId);
    if (isNaN(fieldId)) {
      return NextResponse.json({ error: "Invalid field ID" }, { status: 400 });
    }

    // Verify field exists
    const existingField = await db.query.customFields.findFirst({
      where: eq(customFields.id, fieldId),
    });

    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validation = updateCustomFieldSchema.safeParse(body);

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

    // Update the custom field
    const [updatedField] = await db
      .update(customFields)
      .set({
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
        isActive: fieldData.isActive,
        updatedAt: new Date(),
      })
      .where(eq(customFields.id, fieldId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedField,
      message: "Custom field updated successfully",
    });
  } catch (error) {
    console.error("Error updating custom field:", error);
    return NextResponse.json(
      { error: "Failed to update custom field" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/custom-fields/[fieldId]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ fieldId: string }> },
) {
  try {
    const user = await getUser();
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;
    const fieldId = parseInt(params.fieldId);
    if (isNaN(fieldId)) {
      return NextResponse.json({ error: "Invalid field ID" }, { status: 400 });
    }

    // Verify field exists
    const existingField = await db.query.customFields.findFirst({
      where: eq(customFields.id, fieldId),
    });

    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" },
        { status: 404 },
      );
    }

    // Delete the custom field (cascade will handle related values)
    await db.delete(customFields).where(eq(customFields.id, fieldId));

    return NextResponse.json({
      success: true,
      message: "Custom field deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting custom field:", error);
    return NextResponse.json(
      { error: "Failed to delete custom field" },
      { status: 500 },
    );
  }
}
