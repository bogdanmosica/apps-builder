import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { db } from "@/lib/db/drizzle";
import {
  evaluationAnswerChoices,
  evaluationQuestions,
  type NewEvaluationAnswerChoice,
  type NewEvaluationQuestion,
} from "@/lib/db/schema";

// Get all questions with choices (admin only)
export async function GET() {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const questions = await db
      .select()
      .from(evaluationQuestions)
      .orderBy(evaluationQuestions.sortOrder, evaluationQuestions.id);

    const questionsWithChoices = [];
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

    return NextResponse.json(questionsWithChoices);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

// Create new question
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const body = await request.json();
    const { question, answerChoices } = body;

    if (!question || !answerChoices || !Array.isArray(answerChoices)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    // Create the question
    const newQuestion: NewEvaluationQuestion = {
      question: question.question,
      description: question.description || null,
      category: question.category,
      weight: question.weight,
      isActive: question.isActive ? 1 : 0,
      sortOrder: question.sortOrder,
    };

    const [insertedQuestion] = await db
      .insert(evaluationQuestions)
      .values(newQuestion)
      .returning();

    // Create answer choices
    for (const choice of answerChoices) {
      const newChoice: NewEvaluationAnswerChoice = {
        questionId: insertedQuestion.id,
        answerText: choice.answerText,
        answerValue: choice.answerValue,
        sortOrder: choice.sortOrder,
      };

      await db.insert(evaluationAnswerChoices).values(newChoice);
    }

    return NextResponse.json({
      success: true,
      questionId: insertedQuestion.id,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    );
  }
}

// Update existing question
export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const body = await request.json();
    const { question, answerChoices } = body;

    if (!question?.id || !answerChoices || !Array.isArray(answerChoices)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    // Update the question
    await db
      .update(evaluationQuestions)
      .set({
        question: question.question,
        description: question.description || null,
        category: question.category,
        weight: question.weight,
        isActive: question.isActive ? 1 : 0,
        sortOrder: question.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(evaluationQuestions.id, question.id));

    // Delete existing answer choices
    await db
      .delete(evaluationAnswerChoices)
      .where(eq(evaluationAnswerChoices.questionId, question.id));

    // Create new answer choices
    for (const choice of answerChoices) {
      const newChoice: NewEvaluationAnswerChoice = {
        questionId: question.id,
        answerText: choice.answerText,
        answerValue: choice.answerValue,
        sortOrder: choice.sortOrder,
      };

      await db.insert(evaluationAnswerChoices).values(newChoice);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 },
    );
  }
}

// Delete question
export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("id");

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 },
      );
    }

    // Delete answer choices first (due to foreign key constraint)
    await db
      .delete(evaluationAnswerChoices)
      .where(eq(evaluationAnswerChoices.questionId, parseInt(questionId)));

    // Delete the question
    await db
      .delete(evaluationQuestions)
      .where(eq(evaluationQuestions.id, parseInt(questionId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 },
    );
  }
}
