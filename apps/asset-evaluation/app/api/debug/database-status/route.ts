import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { propertyTypes, questionCategories, questions, answers, users, evaluationSessions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking database status...');
    
    // Check current user session
    const session = await getSession();
    console.log('📝 Session check:', session?.user ? `User ${session.user.id} authenticated` : 'No session');
    
    // Check property types
    const propertyTypesData = await db.select().from(propertyTypes);
    console.log('📋 Property types in database:', propertyTypesData.length);
    
    // Check question categories
    const categoriesData = await db.select().from(questionCategories);
    console.log('📂 Question categories in database:', categoriesData.length);
    
    // Check questions
    const questionsData = await db.select().from(questions);
    console.log('❓ Questions in database:', questionsData.length);
    
    // Check answers
    const answersData = await db.select().from(answers);
    console.log('💬 Answers in database:', answersData.length);
    
    // Check users
    const usersData = await db.select().from(users);
    console.log('👥 Users in database:', usersData.length);
    
    // Check evaluation sessions
    const sessionsData = await db.select().from(evaluationSessions);
    console.log('📊 Evaluation sessions in database:', sessionsData.length);
    
    // Test database connection
    const connectionTest = await db.select().from(propertyTypes).limit(1);
    
    const databaseStatus = {
      success: true,
      connection: 'healthy',
      user: session?.user ? {
        id: session.user.id,
        authenticated: true
      } : {
        authenticated: false
      },
      tables: {
        propertyTypes: {
          count: propertyTypesData.length,
          data: propertyTypesData
        },
        questionCategories: {
          count: categoriesData.length
        },
        questions: {
          count: questionsData.length
        },
        answers: {
          count: answersData.length
        },
        users: {
          count: usersData.length
        },
        evaluationSessions: {
          count: sessionsData.length
        }
      },
      isSeeded: propertyTypesData.length > 0 && questionsData.length > 0,
      recommendations: [] as string[]
    };
    
    // Add recommendations based on the status
    if (propertyTypesData.length === 0) {
      databaseStatus.recommendations.push('❌ No property types found. Run seed script to populate the database.');
    }
    
    if (questionsData.length === 0) {
      databaseStatus.recommendations.push('❌ No questions found. Run seed script to populate the database.');
    }
    
    if (usersData.length === 0) {
      databaseStatus.recommendations.push('❌ No users found. Run seed script to create admin user.');
    }
    
    if (!session?.user) {
      databaseStatus.recommendations.push('⚠️ No authenticated user. Login required for evaluation saving.');
    }
    
    if (databaseStatus.recommendations.length === 0) {
      databaseStatus.recommendations.push('✅ Database appears to be properly configured and seeded.');
    }
    
    return NextResponse.json(databaseStatus);
    
  } catch (error) {
    console.error('❌ Error checking database status:', error);
    
    return NextResponse.json({
      success: false,
      connection: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
      recommendations: [
        '❌ Database connection failed. Check your database configuration.',
        '1. Verify DATABASE_URL environment variable',
        '2. Ensure database server is running',
        '3. Check network connectivity',
        '4. Verify database credentials'
      ]
    }, { status: 500 });
  }
}
