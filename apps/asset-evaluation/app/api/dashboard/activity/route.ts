import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { 
  activityLogs, 
  users, 
  teamMembers, 
  payments, 
  subscriptions 
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc, sql } from 'drizzle-orm';

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

    // Get recent activity logs with user info
    const recentActivityLogs = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        timestamp: activityLogs.timestamp,
        userName: users.name,
        userEmail: users.email,
      })
      .from(activityLogs)
      .innerJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.teamId, teamId))
      .orderBy(desc(activityLogs.timestamp))
      .limit(10);

    // Get recent payments
    const recentPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        currency: payments.currency,
        description: payments.description,
        createdAt: payments.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .where(and(
        eq(payments.teamId, teamId),
        eq(payments.status, 'completed')
      ))
      .orderBy(desc(payments.createdAt))
      .limit(5);

    // Get recent subscriptions
    const recentSubscriptions = await db
      .select({
        id: subscriptions.id,
        planName: subscriptions.planName,
        amount: subscriptions.amount,
        status: subscriptions.status,
        createdAt: subscriptions.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .where(eq(subscriptions.teamId, teamId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(5);

    // Helper function to format time ago
    const getTimeAgo = (date: Date): string => {
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    };

    // Helper function to format currency
    const formatCurrency = (cents: number, currency: string = 'usd'): string => {
      return `$${(cents / 100).toFixed(2)}`;
    };

    // Combine and format all activities
    interface ActivityItem {
      id: string;
      type: string;
      user: string;
      action: string;
      time: string;
      value: string;
      timestamp: Date;
    }

    const activities: ActivityItem[] = [];

    // Add activity logs
    recentActivityLogs.forEach(log => {
      activities.push({
        id: `activity-${log.id}`,
        type: 'activity',
        user: log.userName || log.userEmail || 'Unknown User',
        action: log.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        time: getTimeAgo(log.timestamp),
        value: '',
        timestamp: log.timestamp,
      });
    });

    // Add payments
    recentPayments.forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        user: payment.userName || payment.userEmail || 'Unknown User',
        action: 'Payment received',
        time: getTimeAgo(payment.createdAt),
        value: formatCurrency(payment.amount, payment.currency),
        timestamp: payment.createdAt,
      });
    });

    // Add subscriptions
    recentSubscriptions.forEach(subscription => {
      activities.push({
        id: `subscription-${subscription.id}`,
        type: 'subscription',
        user: subscription.userName || subscription.userEmail || 'Unknown User',
        action: subscription.status === 'active' ? `Upgraded to ${subscription.planName}` : `Subscription ${subscription.status}`,
        time: getTimeAgo(subscription.createdAt),
        value: formatCurrency(subscription.amount),
        timestamp: subscription.createdAt,
      });
    });

    // Sort by timestamp and take the most recent 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivity = activities.slice(0, 10);

    return NextResponse.json({ recentActivity });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
