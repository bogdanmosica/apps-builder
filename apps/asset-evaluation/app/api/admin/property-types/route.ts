import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { propertyTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createPropertyTypeSchema = z.object({
  name_ro: z.string().min(1, 'Romanian name is required'),
  name_en: z.string().nullable(),
});

const updatePropertyTypeSchema = z.object({
  name_ro: z.string().min(1, 'Romanian name is required'),
  name_en: z.string().nullable(),
});

// GET /api/admin/property-types
export async function GET() {
  try {
    const user = await getUser();
    
    if (!user || !['admin', 'superuser'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const allPropertyTypes = await db.query.propertyTypes.findMany({
      with: {
        questionCategories: {
          with: {
            questions: {
              with: {
                answers: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: allPropertyTypes,
    });
  } catch (error) {
    console.error('Error fetching property types:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/property-types
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
    const validation = createPropertyTypeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name_ro, name_en } = validation.data;

    // Check for duplicate names
    const existing = await db.query.propertyTypes.findFirst({
      where: eq(propertyTypes.name_ro, name_ro),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Property type with this Romanian name already exists' },
        { status: 409 }
      );
    }

    const [newPropertyType] = await db
      .insert(propertyTypes)
      .values({
        name_ro,
        name_en,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newPropertyType,
    });
  } catch (error) {
    console.error('Error creating property type:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
