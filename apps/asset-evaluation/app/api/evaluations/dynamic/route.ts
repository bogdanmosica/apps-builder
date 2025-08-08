import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../../lib/auth/session";
import { db } from "../../../../lib/db/drizzle";
import {
  customFieldValues,
  evaluationSessions,
} from "../../../../lib/db/schema";

// Validation schema for unified evaluation (all fields are custom fields now)
const unifiedEvaluationSchema = z
  .object({
    propertyTypeId: z.number(),
    // All fields are now passed as fieldId: value pairs
  })
  .catchall(z.any()); // Allow any additional field IDs as keys

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = unifiedEvaluationSchema.parse(body);

    console.log("📝 Received unified evaluation data:", validatedData);

    // Extract propertyTypeId
    const { propertyTypeId, ...fieldValues } = validatedData;

    // We'll extract common values for the evaluation session, but all data will be stored as custom field values
    let propertyName = "Property Evaluation";
    let propertyLocation = "";

    // For legacy compatibility, try to find common fields by their content
    Object.entries(fieldValues).forEach(([key, value]) => {
      if (typeof value === "string") {
        // Try to identify property name field (usually contains meaningful text)
        if (
          value.length > 3 &&
          value.length < 100 &&
          !value.includes("GPS") &&
          !value.includes("Coordonate")
        ) {
          if (propertyName === "Property Evaluation") {
            // Only set if we haven't found a better name
            propertyName = value;
          }
        }
        // Try to identify location/address field
        if (
          value.includes("GPS") ||
          value.includes("Coordonate") ||
          value.includes("strada") ||
          value.includes("Str.")
        ) {
          propertyLocation = value;
        }
      }
    });

    // Create evaluation session
    const [newEvaluationSession] = await db
      .insert(evaluationSessions)
      .values({
        userId: session.user.id,
        propertyTypeId: propertyTypeId,
        propertyName: propertyName,
        propertyLocation: propertyLocation || undefined,
        // Placeholder values - in real implementation these would be calculated
        totalScore: 0,
        maxPossibleScore: 100,
        percentage: 0,
        level: "Pending",
        badge: "evaluation-pending",
        completionRate: 0,
      })
      .returning();

    console.log("✅ Created evaluation session:", newEvaluationSession.id);

    // Save all field values as custom field values
    const customFieldValuesToInsert = Object.entries(fieldValues)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      )
      .map(([fieldId, value]) => ({
        evaluationSessionId: newEvaluationSession.id,
        customFieldId: parseInt(fieldId), // fieldId is the custom field ID
        value:
          typeof value === "object" ? JSON.stringify(value) : String(value),
      }))
      .filter((item) => !isNaN(item.customFieldId)); // Only valid field IDs

    if (customFieldValuesToInsert.length > 0) {
      await db.insert(customFieldValues).values(customFieldValuesToInsert);
      console.log(
        `✅ Saved ${customFieldValuesToInsert.length} custom field values`,
      );
    }

    return NextResponse.json({
      success: true,
      evaluationSession: newEvaluationSession,
      message: "Property evaluation created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating unified evaluation:", error);

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
        error: "Failed to create property evaluation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const evaluationId = searchParams.get("evaluationId");

    if (!evaluationId) {
      return NextResponse.json(
        { error: "Evaluation ID is required" },
        { status: 400 },
      );
    }

    // Get evaluation session with custom field values
    const evaluationSession = await db.query.evaluationSessions.findFirst({
      where: and(
        eq(evaluationSessions.id, parseInt(evaluationId)),
        eq(evaluationSessions.userId, session.user.id),
      ),
      with: {
        customFieldValues: {
          with: {
            customField: true,
          },
        },
        propertyType: true,
      },
    });

    if (!evaluationSession) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 },
      );
    }

    // Transform custom field values into a more usable format
    const customFieldValuesFormatted =
      evaluationSession.customFieldValues.reduce(
        (acc: Record<string, any>, cfv: any) => {
          acc[`custom_${cfv.customFieldId}`] = cfv.value;
          return acc;
        },
        {} as Record<string, any>,
      );

    return NextResponse.json({
      evaluationSession: {
        ...evaluationSession,
        customFieldValues: customFieldValuesFormatted,
      },
    });
  } catch (error) {
    console.error("Error fetching evaluation:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch evaluation",
      },
      { status: 500 },
    );
  }
}
