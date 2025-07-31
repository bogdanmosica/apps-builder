import { db } from '@/lib/db/drizzle';
import {
  evaluationQuestions,
  evaluationAnswerChoices,
  propertyEvaluations,
  propertyQualityScores,
  type EvaluationQuestion,
  type EvaluationAnswerChoice,
  type PropertyEvaluation,
  type PropertyQualityScore,
  type NewPropertyEvaluation,
  type NewPropertyQualityScore,
} from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface EvaluationQuestionWithChoices extends EvaluationQuestion {
  answerChoices: EvaluationAnswerChoice[];
}

export interface PropertyEvaluationData {
  questionId: number;
  answerChoiceId?: number;
  customAnswer?: string;
}

export interface QualityScoreBreakdown {
  categoryScores: Array<{
    category: string;
    score: number;
    maxScore: number;
    weight: number;
  }>;
  totalScore: number;
  starRating: number;
}

/**
 * Get all active evaluation questions with their answer choices
 */
export async function getEvaluationQuestions(): Promise<EvaluationQuestionWithChoices[]> {
  const questions = await db
    .select()
    .from(evaluationQuestions)
    .where(eq(evaluationQuestions.isActive, 1))
    .orderBy(evaluationQuestions.sortOrder, evaluationQuestions.id);

  const questionsWithChoices: EvaluationQuestionWithChoices[] = [];

  for (const question of questions) {
    const choices = await db
      .select()
      .from(evaluationAnswerChoices)
      .where(eq(evaluationAnswerChoices.questionId, question.id))
      .orderBy(evaluationAnswerChoices.sortOrder, evaluationAnswerChoices.id);

    questionsWithChoices.push({
      ...question,
      answerChoices: choices,
    });
  }

  return questionsWithChoices;
}

/**
 * Save property evaluation answers
 */
export async function savePropertyEvaluation(
  propertyId: number,
  evaluations: PropertyEvaluationData[],
  evaluatedBy: number
): Promise<void> {
  // Delete existing evaluations for this property
  await db
    .delete(propertyEvaluations)
    .where(eq(propertyEvaluations.propertyId, propertyId));

  // Insert new evaluations
  for (const evaluation of evaluations) {
    const newEvaluation: NewPropertyEvaluation = {
      propertyId,
      questionId: evaluation.questionId,
      answerChoiceId: evaluation.answerChoiceId,
      customAnswer: evaluation.customAnswer,
      evaluatedBy,
    };

    await db.insert(propertyEvaluations).values(newEvaluation);
  }

  // Calculate and save quality score
  await calculateAndSaveQualityScore(propertyId, evaluatedBy);
}

/**
 * Calculate weighted quality score for a property
 */
export async function calculateAndSaveQualityScore(
  propertyId: number,
  calculatedBy?: number
): Promise<PropertyQualityScore> {
  const breakdown = await calculateQualityScoreBreakdown(propertyId);

  // Delete existing quality score
  await db
    .delete(propertyQualityScores)
    .where(eq(propertyQualityScores.propertyId, propertyId));

  // Insert new quality score
  const newQualityScore: NewPropertyQualityScore = {
    propertyId,
    totalScore: breakdown.totalScore,
    starRating: breakdown.starRating,
    calculatedBy,
  };

  const [qualityScore] = await db
    .insert(propertyQualityScores)
    .values(newQualityScore)
    .returning();

  return qualityScore;
}

/**
 * Calculate detailed quality score breakdown
 */
export async function calculateQualityScoreBreakdown(
  propertyId: number
): Promise<QualityScoreBreakdown> {
  // Get all evaluations for this property with question and answer details
  const evaluationData = await db
    .select({
      evaluation: propertyEvaluations,
      question: evaluationQuestions,
      answerChoice: evaluationAnswerChoices,
    })
    .from(propertyEvaluations)
    .innerJoin(
      evaluationQuestions,
      eq(propertyEvaluations.questionId, evaluationQuestions.id)
    )
    .leftJoin(
      evaluationAnswerChoices,
      eq(propertyEvaluations.answerChoiceId, evaluationAnswerChoices.id)
    )
    .where(eq(propertyEvaluations.propertyId, propertyId));

  // Group by category
  const categoriesMap = new Map<string, {
    totalWeightedScore: number;
    totalWeight: number;
    maxPossibleScore: number;
  }>();

  for (const item of evaluationData) {
    const { question, answerChoice } = item;
    const category = question.category;
    const questionWeight = question.weight;
    const answerValue = answerChoice?.answerValue ?? 0;

    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, {
        totalWeightedScore: 0,
        totalWeight: 0,
        maxPossibleScore: 0,
      });
    }

    const categoryData = categoriesMap.get(category)!;
    categoryData.totalWeightedScore += (answerValue * questionWeight) / 100;
    categoryData.totalWeight += questionWeight;
    categoryData.maxPossibleScore += questionWeight; // Max score is when answerValue = 100
  }

  // Calculate category scores
  const categoryScores = Array.from(categoriesMap.entries()).map(([category, data]) => {
    const score = data.totalWeight > 0 
      ? Math.round((data.totalWeightedScore / data.totalWeight) * 100) 
      : 0;
    
    return {
      category,
      score,
      maxScore: 100,
      weight: data.totalWeight,
    };
  });

  // Calculate overall weighted score
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const [, data] of categoriesMap) {
    totalWeightedScore += data.totalWeightedScore;
    totalWeight += data.totalWeight;
  }

  const totalScore = totalWeight > 0 
    ? Math.round((totalWeightedScore / totalWeight) * 100) 
    : 0;

  // Convert to star rating (1-5 stars)
  const starRating = Math.max(1, Math.min(5, Math.ceil((totalScore / 100) * 5)));

  return {
    categoryScores,
    totalScore,
    starRating,
  };
}

/**
 * Get property quality score
 */
export async function getPropertyQualityScore(
  propertyId: number
): Promise<PropertyQualityScore | null> {
  const [qualityScore] = await db
    .select()
    .from(propertyQualityScores)
    .where(eq(propertyQualityScores.propertyId, propertyId))
    .limit(1);

  return qualityScore || null;
}

/**
 * Get property evaluations with details
 */
export async function getPropertyEvaluations(propertyId: number) {
  return await db
    .select({
      evaluation: propertyEvaluations,
      question: evaluationQuestions,
      answerChoice: evaluationAnswerChoices,
    })
    .from(propertyEvaluations)
    .innerJoin(
      evaluationQuestions,
      eq(propertyEvaluations.questionId, evaluationQuestions.id)
    )
    .leftJoin(
      evaluationAnswerChoices,
      eq(propertyEvaluations.answerChoiceId, evaluationAnswerChoices.id)
    )
    .where(eq(propertyEvaluations.propertyId, propertyId))
    .orderBy(evaluationQuestions.sortOrder);
}

/**
 * Check if property has been evaluated
 */
export async function isPropertyEvaluated(propertyId: number): Promise<boolean> {
  const [evaluation] = await db
    .select()
    .from(propertyEvaluations)
    .where(eq(propertyEvaluations.propertyId, propertyId))
    .limit(1);

  return !!evaluation;
}
