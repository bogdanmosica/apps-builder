import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../../lib/auth/session";
import { saveEvaluationResults } from "../../../../lib/evaluation-server";

// Validation schema for complete evaluation submission
const completeEvaluationSchema = z.object({
  propertyTypeId: z.number(),
  propertyInfo: z.object({
    name: z.string(),
    location: z.string().optional(),
    surface: z.number().optional(),
    floors: z.string().optional(),
    constructionYear: z.number().optional(),
  }),
  userAnswers: z.array(
    z.object({
      questionId: z.number(),
      answerId: z.number(),
      answerWeight: z.number(),
      questionWeight: z.number(),
    }),
  ),
  evaluationResult: z.object({
    totalScore: z.number(),
    maxPossibleScore: z.number(),
    percentage: z.number(),
    level: z.enum(["Novice", "Good", "Expert"]),
    badge: z.string(),
    completionRate: z.number(),
    categoryScores: z.array(
      z.object({
        categoryId: z.number(),
        categoryName: z.string(),
        score: z.number(),
        maxScore: z.number(),
        percentage: z.number(),
        questionsAnswered: z.number(),
        totalQuestions: z.number(),
      }),
    ),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = completeEvaluationSchema.parse(body);

    console.log("📝 Received complete evaluation submission:", {
      propertyTypeId: validatedData.propertyTypeId,
      propertyName: validatedData.propertyInfo.name,
      answersCount: validatedData.userAnswers.length,
      totalScore: validatedData.evaluationResult.totalScore,
      level: validatedData.evaluationResult.level,
    });

    // Save evaluation to database
    const evaluationSessionId = await saveEvaluationResults(
      session.user.id,
      validatedData.propertyTypeId,
      validatedData.userAnswers,
      validatedData.evaluationResult,
      validatedData.propertyInfo,
    );

    console.log(
      "✅ Evaluation saved successfully with session ID:",
      evaluationSessionId,
    );

    return NextResponse.json({
      success: true,
      evaluationSessionId,
      message: "Property evaluation completed and saved successfully",
    });
  } catch (error) {
    console.error("❌ Error saving complete evaluation:", error);

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
        error: "Failed to save property evaluation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
