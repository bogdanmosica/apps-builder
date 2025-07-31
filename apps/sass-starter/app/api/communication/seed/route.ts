import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { 
  conversations, 
  messages, 
  campaigns, 
  communicationTemplates, 
  notifications, 
  users 
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Create sample conversations
    const sampleConversations = [
      {
        teamId,
        participantName: 'John Doe',
        participantEmail: 'john@example.com',
        lastMessage: 'Thanks for the quick response! This helped a lot.',
        unreadCount: 0,
        participantStatus: 'online',
        type: 'support',
        priority: 'medium',
        assignedTo: user.id,
      },
      {
        teamId,
        participantName: 'Jane Smith',
        participantEmail: 'jane@example.com',
        lastMessage: 'Could you help me with the integration setup?',
        unreadCount: 2,
        participantStatus: 'away',
        type: 'sales',
        priority: 'high',
        assignedTo: user.id,
      },
      {
        teamId,
        participantName: 'Mike Johnson',
        participantEmail: 'mike@example.com',
        lastMessage: 'The feature request has been submitted.',
        unreadCount: 1,
        participantStatus: 'offline',
        type: 'feedback',
        priority: 'low',
        assignedTo: user.id,
      },
    ];

    const createdConversations = await db
      .insert(conversations)
      .values(sampleConversations)
      .returning();

    // Create sample campaigns
    const sampleCampaigns = [
      {
        teamId,
        name: 'Product Launch Announcement',
        description: 'Announcing our new product features to all customers',
        type: 'email',
        status: 'sent',
        recipientCount: 2450,
        sentCount: 2450,
        openCount: 838,
        clickCount: 213,
        openRate: '34.2',
        clickRate: '8.7',
        sentAt: new Date('2024-03-25'),
        createdBy: user.id,
      },
      {
        teamId,
        name: 'Weekly Newsletter',
        description: 'Our weekly update newsletter',
        type: 'email',
        status: 'scheduled',
        recipientCount: 3200,
        scheduledAt: new Date('2024-03-26'),
        createdBy: user.id,
      },
      {
        teamId,
        name: 'User Feedback Survey',
        description: 'Collecting user feedback for product improvements',
        type: 'survey',
        status: 'active',
        recipientCount: 850,
        responseCount: 200,
        responseRate: '23.5',
        sentAt: new Date('2024-03-20'),
        createdBy: user.id,
      },
    ];

    await db.insert(campaigns).values(sampleCampaigns);

    // Create sample templates
    const sampleTemplates = [
      {
        teamId,
        name: 'Welcome Email',
        description: 'Welcome email for new users',
        type: 'email',
        category: 'onboarding',
        subject: 'Welcome to our platform!',
        content: 'Hi {{name}}, welcome to our platform! We are excited to have you on board.',
        usageCount: 245,
        createdBy: user.id,
      },
      {
        teamId,
        name: 'Support Response',
        description: 'Standard support ticket response template',
        type: 'message',
        category: 'support',
        content: 'Hi {{name}}, thank you for contacting support. We have received your request and will respond within 24 hours.',
        usageCount: 432,
        createdBy: user.id,
      },
      {
        teamId,
        name: 'Feature Announcement',
        description: 'Template for announcing new features',
        type: 'notification',
        category: 'product',
        content: 'New feature available: {{feature_name}}. Check it out in your dashboard!',
        usageCount: 87,
        createdBy: user.id,
      },
    ];

    await db.insert(communicationTemplates).values(sampleTemplates);

    // Create sample notifications
    const sampleNotifications = [
      {
        teamId,
        userId: user.id,
        title: 'New message from John Doe',
        description: 'Thanks for the quick response!',
        type: 'message',
        actionUrl: '/conversations/1',
        isRead: false,
      },
      {
        teamId,
        userId: user.id,
        title: 'Campaign sent successfully',
        description: 'Product Launch Announcement sent to 2,450 recipients',
        type: 'campaign',
        actionUrl: '/campaigns/1',
        isRead: false,
      },
      {
        teamId,
        userId: user.id,
        title: 'Low response rate alert',
        description: 'Weekly Newsletter has 15% lower open rate than average',
        type: 'alert',
        actionUrl: '/campaigns/2',
        isRead: true,
      },
    ];

    await db.insert(notifications).values(sampleNotifications);

    return NextResponse.json({ 
      success: true, 
      message: 'Sample communication data created successfully',
      data: {
        conversations: createdConversations.length,
        campaigns: sampleCampaigns.length,
        templates: sampleTemplates.length,
        notifications: sampleNotifications.length,
      }
    });
  } catch (error) {
    console.error('Error creating sample communication data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
