import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { propertyTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updatePropertyTypeSchema = z.object({
  name_ro: z.string().min(1, 'Romanian name is required'),
  name_en: z.string().nullable(),
});

// GET /api/admin/property-types/[id]
export async function GET(
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
        { success: false, error: 'Invalid property type ID' },
        { status: 400 }
      );
    }

    // Check if we need to include related data
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include');
    const includeCategories = include?.includes('categories');
    const includeQuestions = include?.includes('questions');
    const includeAnswers = include?.includes('answers');

    let propertyType;
    
    if (includeCategories || includeQuestions || includeAnswers) {
      // Fetch with related data
      propertyType = await db.query.propertyTypes.findFirst({
        where: eq(propertyTypes.id, id),
        with: {
          questionCategories: includeCategories ? {
            with: {
              questions: includeQuestions ? {
                with: {
                  answers: includeAnswers ? true : false,
                },
              } : false,
            },
          } : false,
        },
      });
    } else {
      // Fetch only property type
      propertyType = await db.query.propertyTypes.findFirst({
        where: eq(propertyTypes.id, id),
      });
    }

    if (!propertyType) {
      return NextResponse.json(
        { success: false, error: 'Property type not found' },
        { status: 404 }
      );
    }

    // Transform data to match expected structure
    const result = {
      ...propertyType,
      categories: propertyType.questionCategories || [],
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching property type:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
        { success: false, error: 'Invalid property type ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updatePropertyTypeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name_ro, name_en } = validation.data;

    // Check if property type exists
    const existing = await db.query.propertyTypes.findFirst({
      where: eq(propertyTypes.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Property type not found' },
        { status: 404 }
      );
    }

    // Check for duplicate names (excluding current record)
    const duplicate = await db.query.propertyTypes.findFirst({
      where: eq(propertyTypes.name_ro, name_ro),
    });

    if (duplicate && duplicate.id !== id) {
      return NextResponse.json(
        { success: false, error: 'Property type with this Romanian name already exists' },
        { status: 409 }
      );
    }

    const [updatedPropertyType] = await db
      .update(propertyTypes)
      .set({
        name_ro,
        name_en,
        updatedAt: new Date(),
      })
      .where(eq(propertyTypes.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedPropertyType,
    });
  } catch (error) {
    console.error('Error updating property type:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/property-types/[id]
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
        { success: false, error: 'Invalid property type ID' },
        { status: 400 }
      );
    }

    // Check if property type exists and has no categories
    const existing = await db.query.propertyTypes.findFirst({
      where: eq(propertyTypes.id, id),
      with: {
        questionCategories: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Property type not found' },
        { status: 404 }
      );
    }

    if (existing.questionCategories.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete property type with existing categories' },
        { status: 409 }
      );
    }

    await db.delete(propertyTypes).where(eq(propertyTypes.id, id));

    return NextResponse.json({
      success: true,
      message: 'Property type deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting property type:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
