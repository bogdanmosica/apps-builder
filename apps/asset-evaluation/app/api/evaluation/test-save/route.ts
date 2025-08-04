import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { evaluationSessions, userEvaluationAnswers } from '@/lib/db/schema';
import { calculateEvaluationResult } from '@/lib/evaluation-utils';
import type { UserAnswer, PropertyTypeWithCategories } from '@/lib/evaluation-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Testing simplified save endpoint...');
    
    // Get the current user session
    const session = await getSession();
    if (!session?.user?.id) {
      console.log('❌ No user session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', session.user.id);

    // Parse the request body
    const body = await request.json();
    const { userAnswers, propertyData, propertyInfo }: {
      userAnswers: UserAnswer[];
      propertyData: PropertyTypeWithCategories;
      propertyInfo?: {
        name?: string;
        location?: string;
        surface?: number;
        floors?: string;
        constructionYear?: number;
      };
    } = body;

    console.log('📝 Request data received:', {
      answersCount: userAnswers?.length || 0,
      propertyTypeId: propertyData?.id,
      hasPropertyInfo: !!propertyInfo
    });

    // Validate required data
    if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
      console.log('❌ Invalid user answers');
      return NextResponse.json(
        { error: 'User answers are required' },
        { status: 400 }
      );
    }

    if (!propertyData || !propertyData.id) {
      console.log('❌ Invalid property data');
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    // Calculate evaluation result
    console.log('🧮 Calculating evaluation result...');
    const evaluationResult = calculateEvaluationResult(userAnswers, propertyData);
    console.log('✅ Evaluation result:', evaluationResult);

    // Test database connection first
    console.log('🗄️ Testing database connection...');
    try {
      await db.select().from(evaluationSessions).limit(1);
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 503 }
      );
    }

    // Try simple insert without transaction first
    console.log('💾 Attempting to save evaluation session...');
    const sessionData = {
      userId: session.user.id,
      propertyTypeId: propertyData.id,
      propertyName: propertyInfo?.name || null,
      propertyLocation: propertyInfo?.location || null,
      propertySurface: propertyInfo?.surface || null,
      propertyFloors: propertyInfo?.floors || null,
      propertyConstructionYear: propertyInfo?.constructionYear || null,
      totalScore: Math.round(evaluationResult.totalScore * 100),
      maxPossibleScore: Math.round(evaluationResult.maxPossibleScore * 100),
      percentage: Math.round(evaluationResult.percentage),
      level: evaluationResult.level,
      badge: evaluationResult.badge,
      completionRate: Math.round(evaluationResult.completionRate),
    };

    console.log('📦 Session data to insert:', sessionData);

    const [savedSession] = await db.insert(evaluationSessions).values(sessionData).returning({ id: evaluationSessions.id });
    
    console.log('✅ Evaluation session saved with ID:', savedSession.id);

    return NextResponse.json({
      success: true,
      evaluationSessionId: savedSession.id,
      result: evaluationResult,
      message: 'Saved successfully (test endpoint)'
    });

  } catch (error) {
    console.error('❌ Error in test save endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save evaluation results (test)', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
