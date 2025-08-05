import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { questionCategories, questions, answers, userEvaluationAnswers } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name_ro: z.string().min(1, 'Romanian name is required'),
  name_en: z.string().nullable(),
});

// PATCH /api/admin/question-categories/[id]
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
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name_ro, name_en } = validation.data;

    // Check if category exists
    const existing = await db.query.questionCategories.findFirst({
      where: eq(questionCategories.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for duplicate names within the same property type (excluding current record)
    const duplicate = await db.query.questionCategories.findFirst({
      where: eq(questionCategories.name_ro, name_ro),
    });

    if (duplicate && duplicate.id !== id && duplicate.propertyTypeId === existing.propertyTypeId) {
      return NextResponse.json(
        { success: false, error: 'Category with this Romanian name already exists for this property type' },
        { status: 409 }
      );
    }

    const [updatedCategory] = await db
      .update(questionCategories)
      .set({
        name_ro,
        name_en,
        updatedAt: new Date(),
      })
      .where(eq(questionCategories.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/question-categories/[id]
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
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category exists and has no questions
    const existing = await db.query.questionCategories.findFirst({
      where: eq(questionCategories.id, id),
      with: {
        questions: {
          with: {
            answers: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (existing.questions.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with existing questions' },
        { status: 409 }
      );
    }

    await db.delete(questionCategories).where(eq(questionCategories.id, id));

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
