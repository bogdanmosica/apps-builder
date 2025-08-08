import { and, between, desc, eq, gte, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import {
  activityLogs,
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
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    // Calculate date ranges based on time range
    const now = new Date();
    let daysBack = 30;

    switch (timeRange) {
      case "7d":
        daysBack = 7;
        break;
      case "30d":
        daysBack = 30;
        break;
      case "90d":
        daysBack = 90;
        break;
      case "1y":
        daysBack = 365;
        break;
    }

    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(
      now.getTime() - daysBack * 2 * 24 * 60 * 60 * 1000,
    );

    // Helper function to safely get numeric value
    const safeNumber = (value: any): number => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    // Get real-time metrics
    const [
      totalSessions,
      uniqueUsers,
      totalRevenue,
      avgSessionDuration,
      recentSessions,
      conversionData,
    ] = await Promise.all([
      // Total sessions in time range
      db
        .select({ count: sql<number>`count(*)` })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.teamId, teamId),
            gte(userSessions.startTime, startDate),
          ),
        ),

      // Unique users in time range
      db
        .select({ count: sql<number>`count(distinct user_id)` })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.teamId, teamId),
            gte(userSessions.startTime, startDate),
          ),
        ),

      // Total revenue in time range
      db
        .select({ total: sql<number>`sum(amount)` })
        .from(payments)
        .where(
          and(
            eq(payments.teamId, teamId),
            eq(payments.status, "completed"),
            gte(payments.createdAt, startDate),
          ),
        ),

      // Average session duration
      db
        .select({ avgDuration: sql<number>`avg(duration)` })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.teamId, teamId),
            gte(userSessions.startTime, startDate),
            sql`duration IS NOT NULL`,
          ),
        ),

      // Recent sessions (last 24 hours) for real-time active users
      db
        .select({ count: sql<number>`count(distinct user_id)` })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.teamId, teamId),
            gte(
              userSessions.startTime,
              new Date(now.getTime() - 24 * 60 * 60 * 1000),
            ),
          ),
        ),

      // Conversion data (subscriptions vs users)
      Promise.all([
        db
          .select({ count: sql<number>`count(distinct user_id)` })
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
      ]),
    ]);

    const [totalUsersResult, subscribedUsersResult] = conversionData;

    // Get user engagement metrics
    const [newUsers, returningUsers] = await Promise.all([
      // New users (joined in time range)
      db
        .select({ count: sql<number>`count(*)` })
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            gte(teamMembers.joinedAt, startDate),
          ),
        ),

      // Returning users (users with multiple sessions)
      db
        .select({ count: sql<number>`count(distinct user_id)` })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.teamId, teamId),
            gte(userSessions.startTime, startDate),
            sql`user_id IN (
              SELECT user_id 
              FROM user_sessions 
              WHERE team_id = ${teamId}
                AND start_time >= ${startDate.toISOString()}
              GROUP BY user_id 
              HAVING count(*) > 1
            )`,
          ),
        ),
    ]);

    // Calculate bounce rate (sessions with duration < 1 minute)
    const [shortSessionsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userSessions)
      .where(
        and(
          eq(userSessions.teamId, teamId),
          gte(userSessions.startTime, startDate),
          sql`duration < 1 OR duration IS NULL`,
        ),
      );

    const totalSessionsCount = safeNumber(totalSessions[0]?.count);
    const shortSessionsCount = safeNumber(shortSessionsResult?.count);
    const bounceRate =
      totalSessionsCount > 0
        ? (shortSessionsCount / totalSessionsCount) * 100
        : 0;

    // Format average session duration
    const avgDurationMinutes = safeNumber(avgSessionDuration[0]?.avgDuration);
    const formatDuration = (minutes: number): string => {
      const mins = Math.floor(minutes);
      const secs = Math.floor((minutes - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Calculate conversion rate
    const totalUsersCount = safeNumber(totalUsersResult[0]?.count);
    const subscribedUsersCount = safeNumber(subscribedUsersResult[0]?.count);
    const conversionRate =
      totalUsersCount > 0 ? (subscribedUsersCount / totalUsersCount) * 100 : 0;

    // Build the response data structure
    const analyticsData = {
      realTimeMetrics: {
        activeUsers: safeNumber(recentSessions[0]?.count),
        pageViews: totalSessionsCount * 2.5, // Estimated page views per session
        bounceRate: parseFloat(bounceRate.toFixed(1)),
        avgSessionDuration: formatDuration(avgDurationMinutes),
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        revenue: safeNumber(totalRevenue[0]?.total) / 100, // Convert from cents to dollars
      },
      userEngagement: {
        totalSessions: totalSessionsCount,
        newUsers: safeNumber(newUsers[0]?.count),
        returningUsers: safeNumber(returningUsers[0]?.count),
        avgPagesPerSession: 2.5, // This would need additional tracking
        avgSessionDuration: formatDuration(avgDurationMinutes),
        bounceRate: parseFloat(bounceRate.toFixed(1)),
      },
      // For now, these are sample data - would need additional tracking tables for real data
      trafficSources: [
        {
          source: "Direct",
          visitors: Math.floor(totalUsersCount * 0.45),
          percentage: 45,
          change: 2.1,
        },
        {
          source: "Organic Search",
          visitors: Math.floor(totalUsersCount * 0.35),
          percentage: 35,
          change: 8.3,
        },
        {
          source: "Social Media",
          visitors: Math.floor(totalUsersCount * 0.15),
          percentage: 15,
          change: -1.2,
        },
        {
          source: "Referral",
          visitors: Math.floor(totalUsersCount * 0.05),
          percentage: 5,
          change: 12.4,
        },
      ],
      deviceStats: [
        {
          device: "Desktop",
          users: Math.floor(totalUsersCount * 0.6),
          percentage: 60,
          change: -1.5,
        },
        {
          device: "Mobile",
          users: Math.floor(totalUsersCount * 0.35),
          percentage: 35,
          change: 4.2,
        },
        {
          device: "Tablet",
          users: Math.floor(totalUsersCount * 0.05),
          percentage: 5,
          change: -2.1,
        },
      ],
      topPages: [
        {
          page: "/dashboard",
          views: Math.floor(totalSessionsCount * 0.4),
          uniqueViews: Math.floor(totalUsersCount * 0.35),
          avgTime: "3:45",
          bounceRate: 28.4,
        },
        {
          page: "/billing",
          views: Math.floor(totalSessionsCount * 0.25),
          uniqueViews: Math.floor(totalUsersCount * 0.2),
          avgTime: "2:18",
          bounceRate: 35.2,
        },
        {
          page: "/team",
          views: Math.floor(totalSessionsCount * 0.2),
          uniqueViews: Math.floor(totalUsersCount * 0.18),
          avgTime: "4:12",
          bounceRate: 22.1,
        },
        {
          page: "/settings",
          views: Math.floor(totalSessionsCount * 0.15),
          uniqueViews: Math.floor(totalUsersCount * 0.12),
          avgTime: "1:56",
          bounceRate: 45.8,
        },
      ],
      conversionFunnels: [
        { step: "Landing Page", users: totalUsersCount, conversion: 100 },
        {
          step: "Sign Up",
          users: Math.floor(totalUsersCount * 0.25),
          conversion: 25,
        },
        {
          step: "Trial Started",
          users: Math.floor(totalUsersCount * 0.2),
          conversion: 20,
        },
        {
          step: "Subscription",
          users: subscribedUsersCount,
          conversion: conversionRate,
        },
      ],
      geographicData: [
        {
          country: "United States",
          users: Math.floor(totalUsersCount * 0.45),
          percentage: 45,
        },
        {
          country: "Canada",
          users: Math.floor(totalUsersCount * 0.15),
          percentage: 15,
        },
        {
          country: "United Kingdom",
          users: Math.floor(totalUsersCount * 0.12),
          percentage: 12,
        },
        {
          country: "Germany",
          users: Math.floor(totalUsersCount * 0.08),
          percentage: 8,
        },
        {
          country: "Australia",
          users: Math.floor(totalUsersCount * 0.06),
          percentage: 6,
        },
        {
          country: "Others",
          users: Math.floor(totalUsersCount * 0.14),
          percentage: 14,
        },
      ],
      cohortAnalysis: [
        {
          cohort: "Jul 2024",
          users: 120,
          month1: 85,
          month2: 72,
          month3: 65,
          month4: 58,
          month5: 52,
        },
        {
          cohort: "Jun 2024",
          users: 95,
          month1: 78,
          month2: 68,
          month3: 61,
          month4: 55,
        },
        { cohort: "May 2024", users: 110, month1: 82, month2: 71, month3: 64 },
        { cohort: "Apr 2024", users: 87, month1: 76, month2: 65 },
        { cohort: "Mar 2024", users: 134, month1: 79 },
      ],
      goals: [
        {
          id: 1,
          name: "Monthly Subscriptions",
          target: 100,
          current: subscribedUsersCount,
          completion: Math.min((subscribedUsersCount / 100) * 100, 100),
        },
        {
          id: 2,
          name: "Revenue Target",
          target: 50000,
          current: safeNumber(totalRevenue[0]?.total) / 100,
          completion: Math.min(
            (safeNumber(totalRevenue[0]?.total) / 100 / 50000) * 100,
            100,
          ),
        },
        {
          id: 3,
          name: "User Acquisition",
          target: 500,
          current: totalUsersCount,
          completion: Math.min((totalUsersCount / 500) * 100, 100),
        },
        {
          id: 4,
          name: "Session Duration",
          target: 300,
          current: avgDurationMinutes * 60,
          completion: Math.min(((avgDurationMinutes * 60) / 300) * 100, 100),
        },
      ],
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching advanced analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
