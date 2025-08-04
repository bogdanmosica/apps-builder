import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { saveEvaluationResults } from '@/lib/evaluation-server';
import { calculateEvaluationResult } from '@/lib/evaluation-utils';
import type { UserAnswer, PropertyTypeWithCategories } from '@/lib/evaluation-utils';

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    // Debug logging
    console.log('📝 Saving evaluation with propertyInfo:', propertyInfo);

    // Validate required data
    if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
      return NextResponse.json(
        { error: 'User answers are required' },
        { status: 400 }
      );
    }

    if (!propertyData || !propertyData.id) {
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    // Calculate evaluation result
    const evaluationResult = calculateEvaluationResult(userAnswers, propertyData);

    // Save to database
    const evaluationSessionId = await saveEvaluationResults(
      session.user.id,
      propertyData.id,
      userAnswers,
      evaluationResult,
      propertyInfo
    );

    return NextResponse.json({
      success: true,
      evaluationSessionId,
      result: evaluationResult,
    });

  } catch (error) {
    console.error('Error saving evaluation results:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to save evaluation results';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Database connection failed')) {
        errorMessage = 'Database connection error. Please try again later.';
        statusCode = 503; // Service Unavailable
      } else if (error.message.includes('Database schema error')) {
        errorMessage = 'Database configuration error. Please contact support.';
        statusCode = 500;
      } else if (error.message.includes('Authentication required')) {
        errorMessage = 'Authentication required';
        statusCode = 401;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: statusCode }
    );
  }
}
