import { NextRequest, NextResponse } from 'next/server';
import { calculateQualityScoreBreakdown, getPropertyQualityScore } from '@/lib/evaluation/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const resolvedParams = await params;
    const propertyId = parseInt(resolvedParams.propertyId);
    
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    // Try to get existing quality score
    const existingScore = await getPropertyQualityScore(propertyId);
    
    if (existingScore) {
      // Calculate detailed breakdown
      const breakdown = await calculateQualityScoreBreakdown(propertyId);
      return NextResponse.json(breakdown);
    }

    return NextResponse.json(
      { error: 'Property has not been evaluated yet' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching quality score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quality score' },
      { status: 500 }
    );
  }
}
