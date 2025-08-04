import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development or with special header
    const authHeader = request.headers.get('x-schema-fix-auth');
    if (process.env.NODE_ENV === 'production' && authHeader !== process.env.AUTH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Applying schema fixes...');
    
    // Add missing columns to evaluation_sessions table
    const fixes = [
      `ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_name varchar(100)`,
      `ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_location varchar(255)`,
      `ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_surface integer`,
      `ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_floors varchar(20)`,
      `ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_construction_year integer`
    ];

    const results = [];
    for (const fix of fixes) {
      try {
        await db.execute(sql.raw(fix));
        results.push({ query: fix, status: 'SUCCESS' });
        console.log('✅', fix);
      } catch (error) {
        results.push({ 
          query: fix, 
          status: 'FAILED', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error('❌', fix, error);
      }
    }

    return NextResponse.json({
      message: 'Schema fix completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schema fix failed:', error);
    return NextResponse.json({
      error: 'Schema fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
