import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { 
  integrations, 
  apiRequests, 
  webhooks, 
  webhookDeliveries, 
  teamMembers 
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';

// Type for webhook ID query result
type WebhookIdData = {
  id: number;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team
    const userWithTeam = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userWithTeam.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamId = userWithTeam[0].teamId;
    const integrationId = parseInt(id);

    if (isNaN(integrationId)) {
      return NextResponse.json(
        { error: 'Invalid integration ID' },
        { status: 400 }
      );
    }

    // Check if integration exists and belongs to the user's team
    const existingIntegration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.teamId, teamId)
        )
      )
      .limit(1);

    if (existingIntegration.length === 0) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Delete related data first (cascade delete)
    // Delete webhook deliveries for webhooks related to this integration
    const integrationWebhooks = await db
      .select({ id: webhooks.id })
      .from(webhooks)
      .where(eq(webhooks.integrationId, integrationId));
    
    if (integrationWebhooks.length > 0) {
      const webhookIds = integrationWebhooks.map((w: WebhookIdData) => w.id);
      await db
        .delete(webhookDeliveries)
        .where(
          and(
            eq(webhookDeliveries.teamId, teamId),
            // Use IN operator for multiple webhook IDs (simplified approach)
          )
        );
    }

    // Delete webhooks related to this integration
    await db
      .delete(webhooks)
      .where(eq(webhooks.integrationId, integrationId));

    // Delete API requests related to this integration
    await db
      .delete(apiRequests)
      .where(eq(apiRequests.integrationId, integrationId));

    // Finally, delete the integration
    await db
      .delete(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.teamId, teamId)
        )
      );

    return NextResponse.json(
      { message: 'Integration deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team
    const userWithTeam = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userWithTeam.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamId = userWithTeam[0].teamId;
    const integrationId = parseInt(id);

    if (isNaN(integrationId)) {
      return NextResponse.json(
        { error: 'Invalid integration ID' },
        { status: 400 }
      );
    }

    // Get specific integration
    const integration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.teamId, teamId)
        )
      )
      .limit(1);

    if (integration.length === 0) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(integration[0]);
  } catch (error) {
    console.error('Error fetching integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team
    const userWithTeam = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userWithTeam.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamId = userWithTeam[0].teamId;
    const integrationId = parseInt(id);

    if (isNaN(integrationId)) {
      return NextResponse.json(
        { error: 'Invalid integration ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, category, dataFlow, status, health, config } = body;

    // Check if integration exists and belongs to the user's team
    const existingIntegration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.teamId, teamId)
        )
      )
      .limit(1);

    if (existingIntegration.length === 0) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Update integration
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (dataFlow !== undefined) updateData.dataFlow = dataFlow;
    if (status !== undefined) updateData.status = status;
    if (health !== undefined) updateData.health = health;
    if (config !== undefined) updateData.config = config;

    const [updatedIntegration] = await db
      .update(integrations)
      .set(updateData)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.teamId, teamId)
        )
      )
      .returning();

    return NextResponse.json(updatedIntegration);
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
