// Server-side database functions for evaluation data

import { db } from '@/lib/db/drizzle';
import {
  propertyTypes,
  questionCategories,
  questions,
  answers,
  evaluationSessions,
  userEvaluationAnswers,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type {
  PropertyTypeWithCategories,
  CategoryWithQuestions,
  QuestionWithAnswers,
  UserAnswer,
  EvaluationResult,
} from './evaluation-utils';

// Fetch property types with full nested data
export async function getPropertyTypesWithData(): Promise<PropertyTypeWithCategories[]> {
  const propertyTypesData = await db
    .select()
    .from(propertyTypes);

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
  }
): Promise<number> {
  // Start a transaction to ensure data consistency
  return await db.transaction(async (tx: any) => {
    // Insert the evaluation session
    const [session] = await tx.insert(evaluationSessions).values({
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
    }).returning({ id: evaluationSessions.id });

    // Insert user answers
    if (userAnswers.length > 0) {
      const answerRecords = userAnswers.map(answer => ({
        evaluationSessionId: session.id,
        questionId: answer.questionId,
        answerId: answer.answerId,
        answerWeight: answer.answerWeight,
        questionWeight: answer.questionWeight,
        pointsEarned: Math.round(answer.answerWeight * answer.questionWeight * 100), // Store as integer
      }));

      await tx.insert(userEvaluationAnswers).values(answerRecords);
    }

    return session.id;
  });
}
