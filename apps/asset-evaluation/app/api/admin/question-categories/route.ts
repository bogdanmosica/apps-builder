import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { questionCategories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createCategorySchema = z.object({
  name_ro: z.string().min(1, 'Romanian name is required'),
  name_en: z.string().min(1, 'English name is required'),
  propertyTypeId: z.number().int().positive('Property type ID is required'),
});

const updateCategorySchema = z.object({
  name_ro: z.string().min(1, 'Romanian name is required'),
  name_en: z.string().nullable(),
});

// GET /api/admin/question-categories
export async function GET() {
  try {
    const user = await getUser();
    
    if (!user || !['admin', 'superuser'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const allCategories = await db.query.questionCategories.findMany({
      with: {
        questions: {
          with: {
            answers: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    console.error('Error fetching question categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/question-categories
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || !['admin', 'superuser'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name_ro, name_en, propertyTypeId } = validation.data;

    // Check for duplicate names within the same property type
    const existing = await db.query.questionCategories.findFirst({
      where: eq(questionCategories.name_ro, name_ro),
    });

    if (existing && existing.propertyTypeId === propertyTypeId) {
      return NextResponse.json(
        { success: false, error: 'Category with this Romanian name already exists for this property type' },
        { status: 409 }
      );
    }

    const [newCategory] = await db
      .insert(questionCategories)
      .values({
        name_ro,
        name_en,
        propertyTypeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    console.error('Error creating question category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
