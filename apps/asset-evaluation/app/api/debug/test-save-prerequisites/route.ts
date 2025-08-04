import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing evaluation save endpoint prerequisites...');
    
    // Check if user session exists
    const session = await getSession();
    console.log('👤 Session check:', session ? 'Found' : 'Not found');
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'No user session found',
        session: session
      });
    }
    
    // Check if user exists in database
    const userInDb = await db.select().from(users).where(eq(users.id, session.user.id));
    console.log('👤 User in DB:', userInDb.length > 0 ? 'Found' : 'Not found');
    
    // Check property types count
    const propertyTypesResult = await db.execute(sql`SELECT COUNT(*) as count FROM property_types`);
    const propertyTypesCount = propertyTypesResult.rows[0]?.count || 0;
    console.log('🏠 Property types count:', propertyTypesCount);
    
    // Check questions count  
    const questionsResult = await db.execute(sql`SELECT COUNT(*) as count FROM questions`);
    const questionsCount = questionsResult.rows[0]?.count || 0;
    console.log('❓ Questions count:', questionsCount);
    
    // Check answers count
    const answersResult = await db.execute(sql`SELECT COUNT(*) as count FROM answers`);
    const answersCount = answersResult.rows[0]?.count || 0;
    console.log('💬 Answers count:', answersCount);
    
    return NextResponse.json({
      success: true,
      data: {
        hasSession: !!session,
        userId: session.user.id,
        userExistsInDb: userInDb.length > 0,
        propertyTypesCount: parseInt(propertyTypesCount as string),
        questionsCount: parseInt(questionsCount as string),
        answersCount: parseInt(answersCount as string),
        databaseTables: {
          propertyTypes: propertyTypesCount,
          questions: questionsCount,
          answers: answersCount
        }
      }
    });
  } catch (error) {
    console.error('❌ Error in test endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
