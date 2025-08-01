import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const conversationId = parseInt(id);
    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !['active', 'archived', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, archived, or closed' },
        { status: 400 }
      );
    }

    console.log(`📝 Updating conversation ${conversationId} status to: ${status}`);

    // Update conversation status
    const [updatedConversation] = await db
      .update(conversations)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(conversations.id, conversationId))
      .returning();

    if (!updatedConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    console.log('✅ Conversation status updated successfully:', {
      id: updatedConversation.id,
      status: updatedConversation.status,
      participant: updatedConversation.participantName,
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: updatedConversation.id,
        participant: updatedConversation.participantName,
        email: updatedConversation.participantEmail,
        status: updatedConversation.status,
        updatedAt: updatedConversation.updatedAt,
      },
      message: `Conversation ${status === 'archived' ? 'archived' : status === 'active' ? 'restored' : 'closed'} successfully`,
    });

  } catch (error) {
    console.error('💥 Error updating conversation status:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error while updating conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
