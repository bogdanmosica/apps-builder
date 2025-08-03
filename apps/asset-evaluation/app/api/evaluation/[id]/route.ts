import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { evaluationSessions, userEvaluationAnswers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluationId = parseInt(id);
    
    if (isNaN(evaluationId)) {
      return NextResponse.json({ error: 'Invalid evaluation ID' }, { status: 400 });
    }

    // Get current user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the evaluation belongs to the current user
    const evaluation = await db
      .select()
      .from(evaluationSessions)
      .where(and(
        eq(evaluationSessions.id, evaluationId),
        eq(evaluationSessions.userId, user.id)
      ))
      .limit(1);

    if (evaluation.length === 0) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    // Delete related answers first
    await db
      .delete(userEvaluationAnswers)
      .where(eq(userEvaluationAnswers.evaluationSessionId, evaluationId));

    // Delete the evaluation session
    await db
      .delete(evaluationSessions)
      .where(eq(evaluationSessions.id, evaluationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluationId = parseInt(id);
    
    if (isNaN(evaluationId)) {
      return NextResponse.json({ error: 'Invalid evaluation ID' }, { status: 400 });
    }

    const body = await request.json();
    const { propertyName, propertyLocation, propertySurface, propertyFloors, propertyConstructionYear } = body;

    // Get current user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the evaluation belongs to the current user
    const evaluation = await db
      .select()
      .from(evaluationSessions)
      .where(and(
        eq(evaluationSessions.id, evaluationId),
        eq(evaluationSessions.userId, user.id)
      ))
      .limit(1);

    if (evaluation.length === 0) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    // Update the evaluation
    const updateData: any = {};
    if (propertyName !== undefined) updateData.propertyName = propertyName;
    if (propertyLocation !== undefined) updateData.propertyLocation = propertyLocation;
    if (propertySurface !== undefined) updateData.propertySurface = propertySurface ? parseInt(propertySurface) : null;
    if (propertyFloors !== undefined) updateData.propertyFloors = propertyFloors;
    if (propertyConstructionYear !== undefined) updateData.propertyConstructionYear = propertyConstructionYear ? parseInt(propertyConstructionYear) : null;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(evaluationSessions)
        .set(updateData)
        .where(eq(evaluationSessions.id, evaluationId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating evaluation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
