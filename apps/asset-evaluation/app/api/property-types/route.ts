import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { propertyTypes } from '@/lib/db/schema';

export async function GET() {
  try {
    console.log('🔍 Fetching property types for navigation...');
    
    const types = await db
      .select({
        id: propertyTypes.id,
        name_ro: propertyTypes.name_ro,
        name_en: propertyTypes.name_en,
      })
      .from(propertyTypes);

    console.log('✅ Retrieved property types:', types.length);
    
    return NextResponse.json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error('❌ Error fetching property types:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch property types',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
