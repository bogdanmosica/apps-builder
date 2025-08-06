import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { questions, answers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createQuestionSchema = z.object({
  text_ro: z.string().min(1, 'Romanian text is required'),
  text_en: z.string().min(1, 'English text is required'),
  weight: z.number().int().min(1).max(100),
  categoryId: z.number().int().positive('Category ID is required'),
  answers: z.array(z.object({
    text_ro: z.string().min(1, 'Romanian text is required'),
    text_en: z.string().min(1, 'English text is required'),
    weight: z.number().int().min(0).max(100),
  })).min(2, 'At least 2 answers are required'),
});

const updateQuestionSchema = z.object({
  text_ro: z.string().min(1, 'Romanian text is required'),
  text_en: z.string().nullable(),
  weight: z.number().int().min(1).max(10),
  categoryId: z.number().int().positive('Category ID is required'),
});

// GET /api/admin/questions
export async function GET() {
  try {
    const user = await getUser();
    
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const allQuestions = await db.query.questions.findMany({
      with: {
        answers: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: allQuestions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/questions
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createQuestionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { text_ro, text_en, weight, categoryId, answers: answersData } = validation.data;

    // Create question and answers in transaction
    const result = await db.transaction(async (tx: any) => {
      // Create question
      const [newQuestion] = await tx
        .insert(questions)
        .values({
          text_ro,
          text_en,
          weight,
          categoryId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create answers
      const newAnswers = await tx
        .insert(answers)
        .values(
          answersData.map(answer => ({
            text_ro: answer.text_ro,
            text_en: answer.text_en,
            weight: answer.weight,
            questionId: newQuestion.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        )
        .returning();

      return {
        question: newQuestion,
        answers: newAnswers,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result.question,
        answers: result.answers,
      },
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
