import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../../../lib/auth/session";
import { db } from "../../../../../lib/db/drizzle";
import {
  customFieldValues,
  evaluationSessions,
} from "../../../../../lib/db/schema";

// Validation schema for updating dynamic evaluation
const updateDynamicEvaluationSchema = z.object({
  propertyTypeId: z.number().optional(),
  propertyName: z.string().min(3).optional(),
  propertyLocation: z.string().optional(),
  propertySurface: z.number().min(10).optional(),
  propertyFloors: z.string().optional(),
  propertyConstructionYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ evaluationId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { evaluationId: evaluationIdStr } = await params;
    const evaluationId = parseInt(evaluationIdStr);
    if (isNaN(evaluationId)) {
      return NextResponse.json(
        { error: "Invalid evaluation ID" },
        { status: 400 },
      );
    }

    // Check if evaluation exists and belongs to user
    const existingEvaluation = await db.query.evaluationSessions.findFirst({
      where: and(
        eq(evaluationSessions.id, evaluationId),
        eq(evaluationSessions.userId, session.user.id),
      ),
    });

    if (!existingEvaluation) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validatedData = updateDynamicEvaluationSchema.parse(body);

    // Update evaluation session
    const updateData: any = {};
    if (validatedData.propertyName)
      updateData.propertyName = validatedData.propertyName;
    if (validatedData.propertyLocation !== undefined)
      updateData.propertyLocation = validatedData.propertyLocation;
    if (validatedData.propertySurface !== undefined)
      updateData.propertySurface = validatedData.propertySurface;
    if (validatedData.propertyFloors !== undefined)
      updateData.propertyFloors = validatedData.propertyFloors;
    if (validatedData.propertyConstructionYear !== undefined)
      updateData.propertyConstructionYear =
        validatedData.propertyConstructionYear;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(evaluationSessions)
        .set(updateData)
        .where(eq(evaluationSessions.id, evaluationId));
    }

    // Update custom field values if provided
    if (
      validatedData.customFields &&
      Object.keys(validatedData.customFields).length > 0
    ) {
      // Delete existing custom field values for this evaluation
      await db
        .delete(customFieldValues)
        .where(eq(customFieldValues.evaluationSessionId, evaluationId));

      // Insert new custom field values
      const customFieldValuesToInsert = Object.entries(
        validatedData.customFields,
      )
        .filter(
          ([_, value]) => value !== undefined && value !== null && value !== "",
        )
        .map(([fieldKey, value]) => {
          // Extract field ID from key (format: custom_123)
          const fieldIdMatch = fieldKey.match(/^custom_(\d+)$/);
          if (!fieldIdMatch) return null;

          const customFieldId = parseInt(fieldIdMatch[1]);

          return {
            evaluationSessionId: evaluationId,
            customFieldId,
            value:
              typeof value === "object" ? JSON.stringify(value) : String(value),
          };
        })
        .filter(Boolean);

      if (customFieldValuesToInsert.length > 0) {
        await db.insert(customFieldValues).values(customFieldValuesToInsert);
      }
    }

    // Fetch updated evaluation
    const updatedEvaluation = await db.query.evaluationSessions.findFirst({
      where: eq(evaluationSessions.id, evaluationId),
      with: {
        customFieldValues: {
          with: {
            customField: true,
          },
        },
        propertyType: true,
      },
    });

    return NextResponse.json({
      success: true,
      evaluationSession: updatedEvaluation,
      message: "Property evaluation updated successfully",
    });
  } catch (error) {
    console.error("Error updating dynamic evaluation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update property evaluation",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ evaluationId: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { evaluationId: evaluationIdStr } = await params;
    const evaluationId = parseInt(evaluationIdStr);
    if (isNaN(evaluationId)) {
      return NextResponse.json(
        { error: "Invalid evaluation ID" },
        { status: 400 },
      );
    }

    // Check if evaluation exists and belongs to user
    const existingEvaluation = await db.query.evaluationSessions.findFirst({
      where: and(
        eq(evaluationSessions.id, evaluationId),
        eq(evaluationSessions.userId, session.user.id),
      ),
    });

    if (!existingEvaluation) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 },
      );
    }

    // Delete evaluation (custom field values will be deleted via cascade)
    await db
      .delete(evaluationSessions)
      .where(eq(evaluationSessions.id, evaluationId));

    return NextResponse.json({
      success: true,
      message: "Property evaluation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    return NextResponse.json(
      {
        error: "Failed to delete property evaluation",
      },
      { status: 500 },
    );
  }
}
