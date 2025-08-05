import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { answers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createAnswerSchema = z.object({
  text_ro: z.string().min(1, 'Romanian text is required'),
  text_en: z.string().nullable(),
  weight: z.number().int().min(1).max(10),
  questionId: z.number().int().positive('Question ID is required'),
});

const updateAnswerSchema = z.object({
  text_ro: z.string().min(1, 'Romanian text is required'),
  text_en: z.string().nullable(),
  weight: z.number().int().min(1).max(10),
});

// GET /api/admin/answers
export async function GET() {
  try {
    const user = await getUser();
    
    if (!user || !['admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const allAnswers = await db.query.answers.findMany();

    return NextResponse.json({
      success: true,
      data: allAnswers,
    });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/answers
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || !['admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createAnswerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { text_ro, text_en, weight, questionId } = validation.data;

    const [newAnswer] = await db
      .insert(answers)
      .values({
        text_ro,
        text_en,
        weight,
        questionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newAnswer,
    });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
