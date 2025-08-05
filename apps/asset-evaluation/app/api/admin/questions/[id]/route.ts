import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { questions, answers, userEvaluationAnswers } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

const updateQuestionSchema = z.object({
  text_ro: z.string().min(1, 'Romanian text is required'),
  text_en: z.string().min(1, 'English text is required'),
  weight: z.number().int().min(1).max(100),
  answers: z.array(z.object({
    id: z.number().optional(), // Existing answer ID
    text_ro: z.string().min(1, 'Romanian text is required'),
    text_en: z.string().min(1, 'English text is required'),
    weight: z.number().int().min(0).max(100),
    isNew: z.boolean().optional(),
  })).min(2, 'At least 2 answers are required'),
  deletedAnswerIds: z.array(z.number()).optional(),
});

// PUT /api/admin/questions/[id] - Full update with answers
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || !['admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateQuestionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { text_ro, text_en, weight, answers: answersData, deletedAnswerIds = [] } = validation.data;

    // Check if question exists
    const existing = await db.query.questions.findFirst({
      where: eq(questions.id, id),
      with: {
        answers: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }

    // Start transaction
    await db.transaction(async (tx: any) => {
      // Update question
      await tx
        .update(questions)
        .set({
          text_ro,
          text_en,
          weight,
          updatedAt: new Date(),
        })
        .where(eq(questions.id, id));

      // Delete specified answers
      if (deletedAnswerIds.length > 0) {
        await tx.delete(answers).where(inArray(answers.id, deletedAnswerIds));
      }

      // Process answers
      for (const answerData of answersData) {
        if (answerData.id && !answerData.isNew) {
          // Update existing answer
          await tx
            .update(answers)
            .set({
              text_ro: answerData.text_ro,
              text_en: answerData.text_en,
              weight: answerData.weight,
              updatedAt: new Date(),
            })
            .where(eq(answers.id, answerData.id));
        } else {
          // Create new answer
          await tx.insert(answers).values({
            text_ro: answerData.text_ro,
            text_en: answerData.text_en,
            weight: answerData.weight,
            questionId: id,
          });
        }
      }
    });

    // Fetch updated question with answers
    const updatedQuestion = await db.query.questions.findFirst({
      where: eq(questions.id, id),
      with: {
        answers: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/questions/[id] - Simple update (backwards compatibility)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || !['admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const simpleUpdateSchema = z.object({
      text_ro: z.string().min(1, 'Romanian text is required'),
      text_en: z.string().nullable(),
      weight: z.number().int().min(1).max(10),
      categoryId: z.number().int().positive('Category ID is required'),
    });
    
    const validation = simpleUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { text_ro, text_en, weight, categoryId } = validation.data;

    // Check if question exists
    const existing = await db.query.questions.findFirst({
      where: eq(questions.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }

    const [updatedQuestion] = await db
      .update(questions)
      .set({
        text_ro,
        text_en,
        weight,
        categoryId,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/questions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || !['admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    // Check if question exists
    const existing = await db.query.questions.findFirst({
      where: eq(questions.id, id),
      with: {
        answers: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }

    // Delete cascade: user evaluation answers -> answers -> question
    if (existing.answers.length > 0) {
      const answerIds = existing.answers.map((a: any) => a.id);
      
      // First delete any user evaluation answers that reference these answers
      await db.delete(userEvaluationAnswers)
        .where(inArray(userEvaluationAnswers.answerId, answerIds));
      
      // Also delete any user evaluation answers that reference this question
      await db.delete(userEvaluationAnswers)
        .where(eq(userEvaluationAnswers.questionId, id));
      
      // Then delete the answers
      await db.delete(answers).where(eq(answers.questionId, id));
    }

    // Finally delete the question
    await db.delete(questions).where(eq(questions.id, id));

    return NextResponse.json({
      success: true,
      message: 'Question and all its answers deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
