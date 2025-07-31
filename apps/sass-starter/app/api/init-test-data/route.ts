import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, subscriptions, payments, userSessions, activityLogs } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Initializing test data...');

    // Check if test user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@test.com'))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        message: 'Test data already exists',
        user: { email: 'admin@test.com', password: 'password123' }
      });
    }

    // Create test user
    const hashedPassword = await hashPassword('password123');
    
    const [user] = await db.insert(users).values({
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      role: 'owner',
    }).returning();

    console.log('✅ Created test user:', user.email);

    // Create test team
    const [team] = await db.insert(teams).values({
      name: 'Test Team',
      planName: 'pro',
      subscriptionStatus: 'active',
    }).returning();

    console.log('✅ Created test team:', team.name);

    // Add user to team
    await db.insert(teamMembers).values({
      userId: user.id,
      teamId: team.id,
      role: 'owner',
    });

    console.log('✅ Added user to team');

    // Create active subscription
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const [subscription] = await db.insert(subscriptions).values({
      teamId: team.id,
      userId: user.id,
      planName: 'pro',
      status: 'active',
      amount: 2999, // $29.99
      currency: 'usd',
      billingPeriod: 'monthly',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
    }).returning();

    console.log('✅ Created subscription');

    // Create sample payments
    const paymentDates = [];
    for (let i = 5; i >= 0; i--) {
      paymentDates.push(new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000));
    }

    const paymentPromises = paymentDates.map(date => 
      db.insert(payments).values({
        teamId: team.id,
        userId: user.id,
        subscriptionId: subscription.id,
        amount: 2999,
        currency: 'usd',
        status: 'completed',
        description: 'Monthly subscription payment',
        createdAt: date,
      })
    );

    await Promise.all(paymentPromises);
    console.log('✅ Created sample payments');

    // Generate sample user sessions
    const sessionPromises = [];
    for (let i = 0; i < 100; i++) {
      const sessionStart = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 60) + 1; // 1-60 minutes
      const sessionEnd = new Date(sessionStart.getTime() + duration * 60 * 1000);
      
      sessionPromises.push(
        db.insert(userSessions).values({
          userId: user.id,
          teamId: team.id,
          startTime: sessionStart,
          endTime: sessionEnd,
          duration,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        })
      );
    }

    await Promise.all(sessionPromises);
    console.log('✅ Created sample user sessions');

    // Generate sample activity logs
    const pages = ['/', '/dashboard', '/pricing', '/settings', '/team', '/analytics', '/ai-insights', '/integrations'];
    const activityPromises = [];
    
    for (let i = 0; i < 300; i++) {
      const activityTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const randomPage = pages[Math.floor(Math.random() * pages.length)];
      
      activityPromises.push(
        db.insert(activityLogs).values({
          action: `PAGE_VIEW_${randomPage.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
          userId: user.id,
          teamId: team.id,
          timestamp: activityTime,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        })
      );
    }

    await Promise.all(activityPromises);
    console.log('✅ Created sample activity logs');

    console.log('🎉 Test data initialized successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Test data initialized successfully!',
      user: {
        email: 'admin@test.com',
        password: 'password123'
      }
    });
    
  } catch (error) {
    console.error('❌ Error initializing test data:', error);
    return NextResponse.json(
      { error: 'Failed to initialize test data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
