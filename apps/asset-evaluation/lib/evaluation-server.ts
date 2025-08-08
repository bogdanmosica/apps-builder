// Server-side database functions for evaluation data

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import {
  answers,
  evaluationSessions,
  propertyTypes,
  questionCategories,
  questions,
  userEvaluationAnswers,
} from "@/lib/db/schema";
import type {
  CategoryWithQuestions,
  EvaluationResult,
  PropertyTypeWithCategories,
  QuestionWithAnswers,
  UserAnswer,
} from "./evaluation-utils";

// Fetch property types with full nested data
export async function getPropertyTypesWithData(): Promise<
  PropertyTypeWithCategories[]
> {
  const propertyTypesData = await db.select().from(propertyTypes);

  const result: PropertyTypeWithCategories[] = [];

  for (const propertyType of propertyTypesData) {
    const categories = await db
      .select()
      .from(questionCategories)
      .where(eq(questionCategories.propertyTypeId, propertyType.id));

    const categoriesWithQuestions: CategoryWithQuestions[] = [];

    for (const category of categories) {
      const questionsData = await db
        .select()
        .from(questions)
        .where(eq(questions.categoryId, category.id));

      const questionsWithAnswers: QuestionWithAnswers[] = [];

      for (const question of questionsData) {
        const answersData = await db
          .select()
          .from(answers)
          .where(eq(answers.questionId, question.id));

        questionsWithAnswers.push({
          ...question,
          answers: answersData,
        });
      }

      categoriesWithQuestions.push({
        ...category,
        questions: questionsWithAnswers,
      });
    }

    result.push({
      ...propertyType,
      categories: categoriesWithQuestions,
    });
  }

  return result;
}

// Save evaluation results to database
export async function saveEvaluationResults(
  userId: number,
  propertyTypeId: number,
  userAnswers: UserAnswer[],
  evaluationResult: EvaluationResult,
  propertyInfo?: {
    name?: string;
    location?: string;
    surface?: number;
    floors?: string;
    constructionYear?: number;
  },
): Promise<number> {
  try {
    console.log(
      "💾 Starting evaluation save for user:",
      userId,
      "property type:",
      propertyTypeId,
    );

    // For Neon serverless, try without explicit transactions first
    if (
      process.env.NODE_ENV === "production" ||
      process.env.USE_NEON === "true"
    ) {
      console.log("🌐 Using serverless save approach...");

      // Insert the evaluation session
      const [session] = await db
        .insert(evaluationSessions)
        .values({
          userId,
          propertyTypeId,
          propertyName: propertyInfo?.name || null,
          propertyLocation: propertyInfo?.location || null,
          propertySurface: propertyInfo?.surface || null,
          propertyFloors: propertyInfo?.floors || null,
          propertyConstructionYear: propertyInfo?.constructionYear || null,
          totalScore: Math.round(evaluationResult.totalScore * 100), // Store as integer (multiply by 100 for precision)
          maxPossibleScore: Math.round(evaluationResult.maxPossibleScore * 100),
          percentage: Math.round(evaluationResult.percentage),
          level: evaluationResult.level,
          badge: evaluationResult.badge,
          completionRate: Math.round(evaluationResult.completionRate),
        })
        .returning({ id: evaluationSessions.id });

      console.log("✅ Evaluation session created with ID:", session.id);

      // Insert user answers if any
      if (userAnswers.length > 0) {
        console.log("📝 Inserting", userAnswers.length, "user answers...");

        const answerRecords = userAnswers.map((answer) => ({
          evaluationSessionId: session.id,
          questionId: answer.questionId,
          answerId: answer.answerId,
          answerWeight: answer.answerWeight,
          questionWeight: answer.questionWeight,
          pointsEarned: Math.round(
            answer.answerWeight * answer.questionWeight * 100,
          ), // Store as integer
        }));

        try {
          await db.insert(userEvaluationAnswers).values(answerRecords);
          console.log("✅ User answers inserted successfully");
        } catch (answerError) {
          console.error(
            "❌ Failed to insert answers, but session exists:",
            answerError,
          );
          // Don't fail the entire operation if answers fail to save
          // The session is still valid
        }
      }

      console.log("🎉 Evaluation save completed successfully");
      return session.id;
    } else {
      // Use transaction for local development
      console.log("🔄 Using transaction approach...");

      return await db.transaction(async (tx: any) => {
        console.log("📦 Transaction started, inserting evaluation session...");

        // Insert the evaluation session
        const [session] = await tx
          .insert(evaluationSessions)
          .values({
            userId,
            propertyTypeId,
            propertyName: propertyInfo?.name || null,
            propertyLocation: propertyInfo?.location || null,
            propertySurface: propertyInfo?.surface || null,
            propertyFloors: propertyInfo?.floors || null,
            propertyConstructionYear: propertyInfo?.constructionYear || null,
            totalScore: Math.round(evaluationResult.totalScore * 100), // Store as integer (multiply by 100 for precision)
            maxPossibleScore: Math.round(
              evaluationResult.maxPossibleScore * 100,
            ),
            percentage: Math.round(evaluationResult.percentage),
            level: evaluationResult.level,
            badge: evaluationResult.badge,
            completionRate: Math.round(evaluationResult.completionRate),
          })
          .returning({ id: evaluationSessions.id });

        console.log("✅ Evaluation session created with ID:", session.id);

        // Insert user answers
        if (userAnswers.length > 0) {
          console.log("📝 Inserting", userAnswers.length, "user answers...");

          const answerRecords = userAnswers.map((answer) => ({
            evaluationSessionId: session.id,
            questionId: answer.questionId,
            answerId: answer.answerId,
            answerWeight: answer.answerWeight,
            questionWeight: answer.questionWeight,
            pointsEarned: Math.round(
              answer.answerWeight * answer.questionWeight * 100,
            ), // Store as integer
          }));

          await tx.insert(userEvaluationAnswers).values(answerRecords);
          console.log("✅ User answers inserted successfully");
        }

        console.log("🎉 Evaluation save completed successfully");
        return session.id;
      });
    }
  } catch (error) {
    console.error("❌ Error in saveEvaluationResults:", error);

    // Check if it's a database connection error
    if (error instanceof Error) {
      if (
        error.message.includes("connect") ||
        error.message.includes("ECONNREFUSED")
      ) {
        throw new Error(
          "Database connection failed. Please check your database configuration.",
        );
      }
      if (
        error.message.includes("relation") ||
        error.message.includes("does not exist")
      ) {
        throw new Error(
          "Database schema error. Please ensure all tables exist.",
        );
      }
      if (error.message.includes("foreign key constraint")) {
        throw new Error(
          "Data integrity error. Please check that all referenced data exists.",
        );
      }
    }

    throw error;
  }
}
