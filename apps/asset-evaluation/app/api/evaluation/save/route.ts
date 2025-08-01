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
    const { userAnswers, propertyData }: {
      userAnswers: UserAnswer[];
      propertyData: PropertyTypeWithCategories;
    } = body;

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
      evaluationResult
    );

    return NextResponse.json({
      success: true,
      evaluationSessionId,
      result: evaluationResult,
    });

  } catch (error) {
    console.error('Error saving evaluation results:', error);
    return NextResponse.json(
      { error: 'Failed to save evaluation results' },
      { status: 500 }
    );
  }
}
