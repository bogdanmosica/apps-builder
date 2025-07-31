import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getEvaluationQuestions } from '@/lib/evaluation/service';

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all evaluation questions
    const questions = await getEvaluationQuestions();
    
    // Filter to only return active questions for regular users
    const activeQuestions = questions.filter(q => q.isActive);
    
    return NextResponse.json(activeQuestions);
  } catch (error) {
    console.error('Error fetching evaluation questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation questions' },
      { status: 500 }
    );
  }
}
