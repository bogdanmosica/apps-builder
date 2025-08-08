import { and, desc, eq, gte, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import {
  payments,
  subscriptions,
  teamMembers,
  teams,
  userSessions,
  users,
} from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team
    const userWithTeam = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userWithTeam.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const teamId = userWithTeam[0].teamId;

    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get total revenue (current month vs previous month)
    const [currentRevenue, previousRevenue] = await Promise.all([
      db
        .select({ total: sql<number>`sum(amount)` })
        .from(payments)
        .where(
          and(
            eq(payments.teamId, teamId),
            eq(payments.status, "completed"),
            gte(payments.createdAt, thirtyDaysAgo),
          ),
        ),
      db
        .select({ total: sql<number>`sum(amount)` })
        .from(payments)
        .where(
          and(
            eq(payments.teamId, teamId),
            eq(payments.status, "completed"),
            gte(payments.createdAt, sixtyDaysAgo),
            sql`created_at < ${thirtyDaysAgo.toISOString()}`,
          ),
        ),
    ]);

    // Get subscription count (active subscriptions current vs previous month)
    const [currentSubs, previousSubs] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.teamId, teamId),
            eq(subscriptions.status, "active"),
            gte(subscriptions.createdAt, thirtyDaysAgo),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.teamId, teamId),
            eq(subscriptions.status, "active"),
            gte(subscriptions.createdAt, sixtyDaysAgo),
            sql`created_at < ${thirtyDaysAgo.toISOString()}`,
          ),
        ),
    ]);

    // Get active users (users with sessions in last 30 days)
    const [currentActiveUsers, previousActiveUsers] = await Promise.all([
      db
        .select({ count: sql<number>`count(distinct user_id)` })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.teamId, teamId),
            gte(userSessions.startTime, thirtyDaysAgo),
          ),
        ),
      db
        .select({ count: sql<number>`count(distinct user_id)` })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.teamId, teamId),
            gte(userSessions.startTime, sixtyDaysAgo),
            sql`start_time < ${thirtyDaysAgo.toISOString()}`,
          ),
        ),
    ]);

    // Helper function to safely get numeric value from query result
    const safeNumber = (value: any): number => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    // Calculate conversion rate (subscriptions vs total users) with historical comparison
    const [
      totalUsers,
      subscribedUsers,
      previousTotalUsers,
      previousSubscribedUsers,
    ] = await Promise.all([
      // Current month
      db
        .select({ count: sql<number>`count(*)` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, teamId)),
      db
        .select({ count: sql<number>`count(distinct user_id)` })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.teamId, teamId),
            eq(subscriptions.status, "active"),
          ),
        ),
      // Previous month
      db
        .select({ count: sql<number>`count(*)` })
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            sql`joined_at < ${thirtyDaysAgo.toISOString()}`,
          ),
        ),
      db
        .select({ count: sql<number>`count(distinct user_id)` })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.teamId, teamId),
            eq(subscriptions.status, "active"),
            sql`created_at < ${thirtyDaysAgo.toISOString()}`,
          ),
        ),
    ]);

    // Helper function to calculate percentage change
    const calculateChange = (current: number, previous: number): string => {
      // Ensure we have valid numbers
      const curr = Number(current) || 0;
      const prev = Number(previous) || 0;

      if (prev === 0) return curr > 0 ? "+100%" : "0%";
      const change = ((curr - prev) / prev) * 100;
      return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    };

    // Calculate conversion rates
    const currentConversionRate =
      safeNumber(totalUsers[0]?.count) > 0
        ? (safeNumber(subscribedUsers[0]?.count) /
            safeNumber(totalUsers[0]?.count)) *
          100
        : 0;

    const previousConversionRate =
      safeNumber(previousTotalUsers[0]?.count) > 0
        ? (safeNumber(previousSubscribedUsers[0]?.count) /
            safeNumber(previousTotalUsers[0]?.count)) *
          100
        : 0;

    // Format currency
    const formatCurrency = (cents: number): string => {
      const amount = Number(cents) || 0;
      return `$${(amount / 100).toLocaleString()}`;
    };

    const metrics = [
      {
        title: "Total Revenue",
        value: formatCurrency(safeNumber(currentRevenue[0]?.total)),
        change: calculateChange(
          safeNumber(currentRevenue[0]?.total),
          safeNumber(previousRevenue[0]?.total),
        ),
        trend:
          safeNumber(currentRevenue[0]?.total) >=
          safeNumber(previousRevenue[0]?.total)
            ? "up"
            : "down",
        icon: "DollarSign",
      },
      {
        title: "Subscriptions",
        value: safeNumber(currentSubs[0]?.count).toLocaleString(),
        change: calculateChange(
          safeNumber(currentSubs[0]?.count),
          safeNumber(previousSubs[0]?.count),
        ),
        trend:
          safeNumber(currentSubs[0]?.count) >=
          safeNumber(previousSubs[0]?.count)
            ? "up"
            : "down",
        icon: "Users",
      },
      {
        title: "Active Users",
        value: safeNumber(currentActiveUsers[0]?.count).toLocaleString(),
        change: calculateChange(
          safeNumber(currentActiveUsers[0]?.count),
          safeNumber(previousActiveUsers[0]?.count),
        ),
        trend:
          safeNumber(currentActiveUsers[0]?.count) >=
          safeNumber(previousActiveUsers[0]?.count)
            ? "up"
            : "down",
        icon: "Activity",
      },
      {
        title: "Conversion Rate",
        value: `${currentConversionRate.toFixed(1)}%`,
        change: calculateChange(currentConversionRate, previousConversionRate),
        trend: currentConversionRate >= previousConversionRate ? "up" : "down",
        icon: "TrendingUp",
      },
    ];

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
