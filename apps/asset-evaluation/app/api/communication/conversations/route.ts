import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations, messages, teams, users } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

// Type for conversation data from query
type ConversationData = {
  id: number;
  participantName: string | null;
  participantEmail: string | null;
  participantAvatar: string | null;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  status: string;
  participantStatus: string;
  type: string;
  priority: string;
  assignedTo: number | null;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'active'; // Default to active
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    console.log('🔍 Fetching conversations with filters:', { type, status, priority, search });

    // Get user's team
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        teamMembers: {
          with: {
            team: true,
          },
        },
      },
    });

    if (!user || !user.teamMembers[0]) {
      return NextResponse.json({ error: 'User not found or not part of a team' }, { status: 404 });
    }

    const teamId = user.teamMembers[0].teamId;

    // Build query conditions
    const conditions = [eq(conversations.teamId, teamId)];

    if (type && type !== 'all') {
      conditions.push(eq(conversations.type, type));
    }

    // Always filter by status (active/archived/closed)
    conditions.push(eq(conversations.status, status));

    if (priority && priority !== 'all') {
      conditions.push(eq(conversations.priority, priority));
    }

    // Get conversations with message count
    const conversationList = await db
      .select({
        id: conversations.id,
        participantName: conversations.participantName,
        participantEmail: conversations.participantEmail,
        participantAvatar: conversations.participantAvatar,
        lastMessage: conversations.lastMessage,
        lastMessageAt: conversations.lastMessageAt,
        unreadCount: conversations.unreadCount,
        status: conversations.status,
        participantStatus: conversations.participantStatus,
        type: conversations.type,
        priority: conversations.priority,
        assignedTo: conversations.assignedTo,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(and(...conditions))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(50);

    // Filter by search if provided
    let filteredConversations = conversationList;
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredConversations = conversationList.filter(
        (conv: ConversationData) =>
          conv.participantName?.toLowerCase().includes(searchLower) ||
          conv.participantEmail?.toLowerCase().includes(searchLower) ||
          (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      conversations: filteredConversations.map((conv: ConversationData) => ({
        id: conv.id,
        participant: conv.participantName,
        email: conv.participantEmail,
        avatar: conv.participantAvatar,
        lastMessage: conv.lastMessage,
        timestamp: conv.lastMessageAt?.toISOString() || new Date().toISOString(),
        unread: conv.unreadCount,
        status: conv.participantStatus, // Online/offline status of participant
        conversationStatus: conv.status, // Active/archived/closed status of conversation
        type: conv.type,
        priority: conv.priority,
      })),
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { participantName, participantEmail, type = 'support', priority = 'medium' } = body;

    if (!participantName || !participantEmail) {
      return NextResponse.json({ error: 'Participant name and email are required' }, { status: 400 });
    }

    // Get user's team
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        teamMembers: {
          with: {
            team: true,
          },
        },
      },
    });

    if (!user || !user.teamMembers[0]) {
      return NextResponse.json({ error: 'User not found or not part of a team' }, { status: 404 });
    }

    const teamId = user.teamMembers[0].teamId;

    // Create new conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        teamId,
        participantName,
        participantEmail,
        type,
        priority,
        assignedTo: user.id,
      })
      .returning();

    return NextResponse.json({
      conversation: {
        id: newConversation.id,
        participant: newConversation.participantName,
        email: newConversation.participantEmail,
        avatar: newConversation.participantAvatar,
        lastMessage: newConversation.lastMessage,
        timestamp: newConversation.lastMessageAt?.toISOString(),
        unread: newConversation.unreadCount,
        status: newConversation.participantStatus,
        type: newConversation.type,
        priority: newConversation.priority,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
