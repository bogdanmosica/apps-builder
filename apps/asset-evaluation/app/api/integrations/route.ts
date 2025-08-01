import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { 
  integrations, 
  apiRequests, 
  webhooks, 
  webhookDeliveries, 
  apiKeys, 
  teamMembers 
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, gte, sql, desc, count, avg, sum } from 'drizzle-orm';

// Type for integration data from active integrations query
type ActiveIntegrationData = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  status: string;
  health: string;
  dataFlow: string;
  lastSync: Date | null;
  config: unknown;
};

// Type for webhook data from database
type WebhookData = typeof webhooks.$inferSelect;

// Type for API key data from database  
type ApiKeyData = typeof apiKeys.$inferSelect;

// Type for endpoint result from query
type EndpointData = {
  endpoint: string;
  requests: number;
  avgTime: number;
};

export async function GET(request: NextRequest) {
  try {
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

    // Calculate date ranges
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Helper function to safely get numeric value
    const safeNumber = (value: any): number => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    // 1. ACTIVE INTEGRATIONS COUNT
    const activeIntegrationsResult = await db
      .select({ count: count() })
      .from(integrations)
      .where(
        and(
          eq(integrations.teamId, teamId),
          eq(integrations.status, 'connected')
        )
      );

    const activeIntegrationsCount = safeNumber(activeIntegrationsResult[0]?.count) || 0;

    // 2. TOTAL API REQUESTS (last 24 hours)
    const totalApiRequestsResult = await db
      .select({ count: count() })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.teamId, teamId),
          gte(apiRequests.timestamp, last24Hours)
        )
      );

    const totalApiRequests = safeNumber(totalApiRequestsResult[0]?.count) || 0;

    // 3. SUCCESS RATE (last 24 hours)
    const [successfulRequests, totalRequests] = await Promise.all([
      db
        .select({ count: count() })
        .from(apiRequests)
        .where(
          and(
            eq(apiRequests.teamId, teamId),
            eq(apiRequests.isSuccess, true),
            gte(apiRequests.timestamp, last24Hours)
          )
        ),
      db
        .select({ count: count() })
        .from(apiRequests)
        .where(
          and(
            eq(apiRequests.teamId, teamId),
            gte(apiRequests.timestamp, last24Hours)
          )
        )
    ]);

    const successfulCount = safeNumber(successfulRequests[0]?.count) || 0;
    const totalCount = safeNumber(totalRequests[0]?.count) || 0;
    const successRate = totalCount > 0 ? Math.round((successfulCount / totalCount) * 100 * 10) / 10 : 100;

    // 4. AVERAGE RESPONSE TIME (last 24 hours)
    const avgResponseTimeResult = await db
      .select({ 
        avgTime: sql<number>`COALESCE(AVG(${apiRequests.responseTime}), 0)` 
      })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.teamId, teamId),
          gte(apiRequests.timestamp, last24Hours)
        )
      );

    const avgResponseTime = Math.round(safeNumber(avgResponseTimeResult[0]?.avgTime) || 0);

    // 5. GET ACTIVE INTEGRATIONS WITH DETAILS
    const activeIntegrationsData = await db
      .select({
        id: integrations.id,
        name: integrations.name,
        description: integrations.description,
        category: integrations.category,
        status: integrations.status,
        health: integrations.health,
        dataFlow: integrations.dataFlow,
        lastSync: integrations.lastSync,
        config: integrations.config,
      })
      .from(integrations)
      .where(eq(integrations.teamId, teamId))
      .orderBy(desc(integrations.lastSync));

    // 6. GET API METRICS FOR EACH INTEGRATION
    const integrationsWithMetrics = await Promise.all(
      activeIntegrationsData.map(async (integration: ActiveIntegrationData) => {
        // Get events count (API requests) for last 24h
        const eventsResult = await db
          .select({ count: count() })
          .from(apiRequests)
          .where(
            and(
              eq(apiRequests.teamId, teamId),
              eq(apiRequests.integrationId, integration.id),
              gte(apiRequests.timestamp, last24Hours)
            )
          );

        // Get error rate for this integration
        const [errors, total] = await Promise.all([
          db
            .select({ count: count() })
            .from(apiRequests)
            .where(
              and(
                eq(apiRequests.teamId, teamId),
                eq(apiRequests.integrationId, integration.id),
                eq(apiRequests.isSuccess, false),
                gte(apiRequests.timestamp, last24Hours)
              )
            ),
          db
            .select({ count: count() })
            .from(apiRequests)
            .where(
              and(
                eq(apiRequests.teamId, teamId),
                eq(apiRequests.integrationId, integration.id),
                gte(apiRequests.timestamp, last24Hours)
              )
            )
        ]);

        const errorCount = safeNumber(errors[0]?.count) || 0;
        const totalCount = safeNumber(total[0]?.count) || 0;
        const errorRate = totalCount > 0 ? Math.round((errorCount / totalCount) * 100 * 10) / 10 : 0;

        return {
          ...integration,
          events: safeNumber(eventsResult[0]?.count) || 0,
          errorRate,
        };
      })
    );

    // 7. GET WEBHOOKS DATA
    const webhooksData = await db
      .select({
        id: webhooks.id,
        name: webhooks.name,
        url: webhooks.url,
        events: webhooks.events,
        status: webhooks.status,
        lastTriggered: webhooks.lastTriggered,
        retries: webhooks.retries,
        timeout: webhooks.timeout,
      })
      .from(webhooks)
      .where(eq(webhooks.teamId, teamId))
      .orderBy(desc(webhooks.lastTriggered));

    // Calculate success rate for each webhook
    const webhooksWithMetrics = await Promise.all(
      webhooksData.map(async (webhook: WebhookData) => {
        const [successful, total] = await Promise.all([
          db
            .select({ count: count() })
            .from(webhookDeliveries)
            .where(
              and(
                eq(webhookDeliveries.webhookId, webhook.id),
                eq(webhookDeliveries.isSuccess, true),
                gte(webhookDeliveries.timestamp, last30Days)
              )
            ),
          db
            .select({ count: count() })
            .from(webhookDeliveries)
            .where(
              and(
                eq(webhookDeliveries.webhookId, webhook.id),
                gte(webhookDeliveries.timestamp, last30Days)
              )
            )
        ]);

        const successfulCount = safeNumber(successful[0]?.count) || 0;
        const totalCount = safeNumber(total[0]?.count) || 0;
        const successRate = totalCount > 0 ? Math.round((successfulCount / totalCount) * 100 * 10) / 10 : 100;

        return {
          ...webhook,
          successRate,
        };
      })
    );

    // 8. GET API KEYS DATA
    const apiKeysData = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        description: apiKeys.description,
        permissions: apiKeys.permissions,
        environment: apiKeys.environment,
        status: apiKeys.status,
        rateLimit: apiKeys.rateLimit,
        lastUsed: apiKeys.lastUsed,
      })
      .from(apiKeys)
      .where(eq(apiKeys.teamId, teamId))
      .orderBy(desc(apiKeys.lastUsed));

    // Calculate usage for each API key (simplified - you'd track this in api_requests table)
    const apiKeysWithUsage = apiKeysData.map((apiKey: ApiKeyData) => ({
      ...apiKey,
      usage: Math.floor(Math.random() * (apiKey.rateLimit || 1000)), // Mock usage for now
    }));

    // 9. GET TOP API ENDPOINTS
    const topEndpointsResult = await db
      .select({
        endpoint: apiRequests.endpoint,
        requests: count(apiRequests.id),
        avgTime: sql<number>`COALESCE(AVG(${apiRequests.responseTime}), 0)`,
      })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.teamId, teamId),
          gte(apiRequests.timestamp, last24Hours)
        )
      )
      .groupBy(apiRequests.endpoint)
      .orderBy(desc(count(apiRequests.id)))
      .limit(5);

    const topEndpoints = topEndpointsResult.map((endpoint: EndpointData) => ({
      endpoint: endpoint.endpoint,
      requests: safeNumber(endpoint.requests),
      avgTime: Math.round(safeNumber(endpoint.avgTime)),
    }));

    // Response data structure matching the existing interface
    const responseData = {
      // Quick Stats (for the 4 metric cards)
      activeIntegrations: integrationsWithMetrics,
      apiMetrics: {
        totalRequests: totalApiRequests,
        successRate,
        avgResponseTime,
        rateLimitHits: 0, // Could be calculated from rate limiting logs
        topEndpoints,
      },
      webhooks: webhooksWithMetrics,
      apiKeys: apiKeysWithUsage,
      
      // Available integrations (static for now)
      availableIntegrations: [
        {
          id: 'zapier',
          name: 'Zapier',
          description: 'Automate workflows between apps',
          category: 'Automation',
          popularity: 'high',
          pricing: 'freemium',
          setupDifficulty: 'easy',
        },
        {
          id: 'google_analytics',
          name: 'Google Analytics',
          description: 'Web analytics and user behavior tracking',
          category: 'Analytics',
          popularity: 'high',
          pricing: 'free',
          setupDifficulty: 'medium',
        },
        {
          id: 'hubspot',
          name: 'HubSpot',
          description: 'CRM and marketing automation platform',
          category: 'CRM',
          popularity: 'medium',
          pricing: 'freemium',
          setupDifficulty: 'medium',
        },
        {
          id: 'notion',
          name: 'Notion',
          description: 'Collaborative workspace and documentation',
          category: 'Productivity',
          popularity: 'medium',
          pricing: 'freemium',
          setupDifficulty: 'easy',
        },
      ],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching integrations data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    // Parse request body
    const body = await request.json();
    const { name, description, category, dataFlow, config = {} } = body;

    // Validate required fields
    if (!name || !category || !dataFlow) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, dataFlow' },
        { status: 400 }
      );
    }

    // Create new integration
    const [newIntegration] = await db
      .insert(integrations)
      .values({
        teamId,
        name,
        description: description || '',
        category,
        status: 'disconnected', // New integrations start as disconnected
        health: 'unknown',
        dataFlow,
        config,
        lastSync: null,
      })
      .returning();

    return NextResponse.json(newIntegration, { status: 201 });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
