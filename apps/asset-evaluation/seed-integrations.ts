import { db } from './lib/db/drizzle';
import { 
  integrations, 
  apiRequests, 
  webhooks, 
  webhookDeliveries, 
  apiKeys, 
  teamMembers,
  users 
} from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function seedIntegrations() {
  console.log('🌱 Seeding integrations data...');

  // Get the admin user and their team
  const adminUser = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@admin.com'))
    .limit(1);

  if (adminUser.length === 0) {
    console.error('❌ Admin user not found. Please run db:seed first.');
    process.exit(1);
  }

  const userWithTeam = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, adminUser[0].id))
    .limit(1);

  if (userWithTeam.length === 0) {
    console.error('❌ Admin user has no team. Please run db:seed first.');
    process.exit(1);
  }

  const teamId = userWithTeam[0].teamId;
  console.log(`📋 Using team ID: ${teamId}`);

  // Clear existing data for this team (for demo purposes)
  await db.delete(apiRequests).where(eq(apiRequests.teamId, teamId));
  await db.delete(webhookDeliveries).where(eq(webhookDeliveries.teamId, teamId));
  await db.delete(webhooks).where(eq(webhooks.teamId, teamId));
  await db.delete(apiKeys).where(eq(apiKeys.teamId, teamId));
  await db.delete(integrations).where(eq(integrations.teamId, teamId));

  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Create sample integrations
  console.log('📦 Creating integrations...');
  const sampleIntegrations = await db.insert(integrations).values([
    {
      teamId,
      name: 'Slack',
      description: 'Team communication and notifications',
      category: 'Communication',
      status: 'connected',
      health: 'healthy',
      dataFlow: 'bidirectional',
      lastSync: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      config: {
        workspace: 'acme-corp',
        channels: ['#general', '#alerts', '#sales'],
        notifications: true,
      },
    },
    {
      teamId,
      name: 'GitHub',
      description: 'Code repository and deployment tracking',
      category: 'Development',
      status: 'connected',
      health: 'healthy',
      dataFlow: 'inbound',
      lastSync: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      config: {
        repository: 'acme-corp/saas-app',
        branches: ['main', 'develop'],
        webhooks: ['push', 'pull_request'],
      },
    },
    {
      teamId,
      name: 'Stripe',
      description: 'Payment processing and subscription management',
      category: 'Payments',
      status: 'connected',
      health: 'warning',
      dataFlow: 'bidirectional',
      lastSync: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
      config: {
        mode: 'live',
        webhooks: ['payment_intent.succeeded', 'customer.subscription.updated'],
        currencies: ['USD', 'EUR'],
      },
    },
    {
      teamId,
      name: 'Mailgun',
      description: 'Email delivery and marketing automation',
      category: 'Email',
      status: 'error',
      health: 'error',
      dataFlow: 'outbound',
      lastSync: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
      config: {
        domain: 'mail.acme-corp.com',
        region: 'us',
        suppressions: true,
      },
    },
  ]).returning({ id: integrations.id });

  console.log(`✅ Created ${sampleIntegrations.length} integrations`);

  // 2. Create sample API requests
  console.log('🔄 Creating API requests...');
  const sampleApiRequests = [];
  const endpoints = [
    '/api/users',
    '/api/auth',
    '/api/billing', 
    '/api/analytics',
    '/api/integrations',
    '/api/webhooks',
  ];

  // Generate requests for the last 24 hours
  for (let i = 0; i < 500; i++) {
    const randomTime = new Date(last24Hours.getTime() + Math.random() * (now.getTime() - last24Hours.getTime()));
    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const randomIntegration = sampleIntegrations[Math.floor(Math.random() * sampleIntegrations.length)];
    const isSuccess = Math.random() > 0.05; // 95% success rate overall
    const responseTime = Math.floor(Math.random() * 500) + 50; // 50-550ms
    
    sampleApiRequests.push({
      teamId,
      integrationId: randomIntegration.id,
      endpoint: randomEndpoint,
      method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
      statusCode: isSuccess ? [200, 201, 204][Math.floor(Math.random() * 3)] : [400, 401, 403, 404, 500][Math.floor(Math.random() * 5)],
      responseTime,
      requestSize: Math.floor(Math.random() * 1000) + 100,
      responseSize: Math.floor(Math.random() * 5000) + 200,
      timestamp: randomTime,
      isSuccess,
      errorMessage: isSuccess ? null : 'Sample error message',
    });
  }

  await db.insert(apiRequests).values(sampleApiRequests);
  console.log(`✅ Created ${sampleApiRequests.length} API requests`);

  // 3. Create sample webhooks
  console.log('🪝 Creating webhooks...');
  const sampleWebhooks = await db.insert(webhooks).values([
    {
      teamId,
      integrationId: sampleIntegrations[0].id, // Slack
      name: 'User Registration Webhook',
      url: 'https://api.acme-corp.com/webhooks/user-registered',
      events: ['user.created', 'user.updated'],
      status: 'active',
      retries: 3,
      timeout: 30,
      lastTriggered: new Date(now.getTime() - 20 * 60 * 1000), // 20 minutes ago
    },
    {
      teamId,
      integrationId: sampleIntegrations[2].id, // Stripe
      name: 'Payment Success Webhook',
      url: 'https://api.acme-corp.com/webhooks/payment-success',
      events: ['payment.succeeded', 'subscription.created'],
      status: 'active',
      retries: 5,
      timeout: 15,
      lastTriggered: new Date(now.getTime() - 18 * 60 * 1000), // 18 minutes ago
    },
    {
      teamId,
      integrationId: sampleIntegrations[1].id, // GitHub
      name: 'Analytics Webhook',
      url: 'https://analytics.acme-corp.com/events',
      events: ['page.viewed', 'feature.used'],
      status: 'paused',
      retries: 2,
      timeout: 10,
      lastTriggered: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ]).returning({ id: webhooks.id });

  console.log(`✅ Created ${sampleWebhooks.length} webhooks`);

  // 4. Create sample webhook deliveries
  console.log('📨 Creating webhook deliveries...');
  const sampleWebhookDeliveries = [];
  for (let i = 0; i < 200; i++) {
    const randomTime = new Date(last7Days.getTime() + Math.random() * (now.getTime() - last7Days.getTime()));
    const randomWebhook = sampleWebhooks[Math.floor(Math.random() * sampleWebhooks.length)];
    const isSuccess = Math.random() > 0.02; // 98% success rate
    const responseTime = Math.floor(Math.random() * 300) + 50; // 50-350ms
    
    sampleWebhookDeliveries.push({
      webhookId: randomWebhook.id,
      teamId,
      event: ['user.created', 'payment.succeeded', 'page.viewed'][Math.floor(Math.random() * 3)],
      payload: { sample: 'data' },
      statusCode: isSuccess ? 200 : [400, 500][Math.floor(Math.random() * 2)],
      responseTime,
      attempts: isSuccess ? 1 : Math.floor(Math.random() * 3) + 1,
      isSuccess,
      errorMessage: isSuccess ? null : 'Sample webhook error',
      timestamp: randomTime,
    });
  }

  await db.insert(webhookDeliveries).values(sampleWebhookDeliveries);
  console.log(`✅ Created ${sampleWebhookDeliveries.length} webhook deliveries`);

  // 5. Create sample API keys
  console.log('🔑 Creating API keys...');
  await db.insert(apiKeys).values([
    {
      teamId,
      name: 'Production API Key',
      description: 'Main production environment key',
      keyHash: 'hashed_key_1',
      permissions: ['read', 'write', 'admin'],
      environment: 'production',
      status: 'active',
      rateLimit: 10000,
      lastUsed: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      teamId,
      name: 'Mobile App Key',
      description: 'Mobile application API access',
      keyHash: 'hashed_key_2',
      permissions: ['read', 'write'],
      environment: 'production',
      status: 'active',
      rateLimit: 5000,
      lastUsed: new Date(now.getTime() - 25 * 60 * 1000), // 25 minutes ago
    },
    {
      teamId,
      name: 'Development Key',
      description: 'Development and testing environment',
      keyHash: 'hashed_key_3',
      permissions: ['read', 'write'],
      environment: 'development',
      status: 'active',
      rateLimit: 1000,
      lastUsed: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ]);

  console.log('✅ Created 3 API keys');

  console.log('');
  console.log('🎉 Integrations data seeded successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${sampleIntegrations.length} integrations`);
  console.log(`   - ${sampleApiRequests.length} API requests`);
  console.log(`   - ${sampleWebhooks.length} webhooks`);
  console.log(`   - ${sampleWebhookDeliveries.length} webhook deliveries`);
  console.log(`   - 3 API keys`);
  console.log('');
  console.log('🔗 You can now visit http://localhost:3003/dashboard/integrations');
  console.log('📧 Login with: admin@admin.com / admin123');
}

seedIntegrations()
  .catch((error) => {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
