import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { answers, userEvaluationAnswers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateAnswerSchema = z.object({
  text_ro: z.string().min(1, 'Romanian text is required'),
  text_en: z.string().nullable(),
  weight: z.number().int().min(1).max(10),
});

// PATCH /api/admin/answers/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || !['admin', 'superuser'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid answer ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateAnswerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { text_ro, text_en, weight } = validation.data;

    // Check if answer exists
    const existing = await db.query.answers.findFirst({
      where: eq(answers.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Answer not found' },
        { status: 404 }
      );
    }

    const [updatedAnswer] = await db
      .update(answers)
      .set({
        text_ro,
        text_en,
        weight,
        updatedAt: new Date(),
      })
      .where(eq(answers.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedAnswer,
    });
  } catch (error) {
    console.error('Error updating answer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/answers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || !['admin', 'superuser'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid answer ID' },
        { status: 400 }
      );
    }

    // Check if answer exists
    const existing = await db.query.answers.findFirst({
      where: eq(answers.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Answer not found' },
        { status: 404 }
      );
    }

    // Check if question would have less than 2 answers after deletion
    const questionAnswers = await db.query.answers.findMany({
      where: eq(answers.questionId, existing.questionId),
    });

    if (questionAnswers.length <= 2) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete answer. Questions must have at least 2 answers.' },
        { status: 409 }
      );
    }

    // Delete any user evaluation answers that reference this answer first
    await db.delete(userEvaluationAnswers)
      .where(eq(userEvaluationAnswers.answerId, id));

    await db.delete(answers).where(eq(answers.id, id));

    return NextResponse.json({
      success: true,
      message: 'Answer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting answer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
