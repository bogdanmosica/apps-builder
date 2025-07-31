import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { evaluationQuestions, evaluationAnswerChoices } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const questionId = parseInt(params.questionId);
    
    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    // Delete answer choices first (foreign key constraint)
    await db
      .delete(evaluationAnswerChoices)
      .where(eq(evaluationAnswerChoices.questionId, questionId));

    // Delete the question
    await db
      .delete(evaluationQuestions)
      .where(eq(evaluationQuestions.id, questionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
