import { eq, gte } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { activityLogs, payments, userSessions } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Generating recent data for last 7 days...");

    // Get existing user and team from test data
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Delete existing recent data to avoid duplicates
    await db.delete(userSessions).where(gte(userSessions.startTime, last7Days));
    await db.delete(payments).where(gte(payments.createdAt, last7Days));
    await db.delete(activityLogs).where(gte(activityLogs.timestamp, last7Days));

    // Generate data for each of the last 7 days
    const recentSessionsData = [];
    const recentPaymentsData = [];
    const recentActivitiesData = [];

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - dayOffset);
      targetDate.setHours(0, 0, 0, 0);

      // Generate 5-15 sessions per day
      const sessionsPerDay = Math.floor(Math.random() * 11) + 5;

      for (
        let sessionIndex = 0;
        sessionIndex < sessionsPerDay;
        sessionIndex++
      ) {
        const sessionStart = new Date(targetDate);
        sessionStart.setHours(
          Math.floor(Math.random() * 16) + 6, // Between 6 AM and 10 PM
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60),
        );

        const duration = Math.floor(Math.random() * 45) + 5; // 5-50 minutes
        const sessionEnd = new Date(
          sessionStart.getTime() + duration * 60 * 1000,
        );

        recentSessionsData.push({
          userId: 1, // Assuming user ID 1 exists from test data
          teamId: 1, // Assuming team ID 1 exists from test data
          startTime: sessionStart,
          endTime: sessionEnd,
          duration,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        });

        // 30% chance of generating a payment for this session
        if (Math.random() < 0.3) {
          recentPaymentsData.push({
            teamId: 1,
            userId: 1,
            subscriptionId: 1,
            amount: Math.floor(Math.random() * 3000) + 1000, // $10-40
            currency: "usd",
            status: "completed" as const,
            description: "Test payment",
            createdAt: sessionStart,
          });
        }

        // Generate activity logs
        const pages = [
          "/",
          "/dashboard",
          "/pricing",
          "/settings",
          "/analytics",
        ];
        const randomPage = pages[Math.floor(Math.random() * pages.length)];

        recentActivitiesData.push({
          teamId: 1,
          userId: 1,
          action: `PAGE_VIEW_${randomPage.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`,
          timestamp: sessionStart,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        });
      }
    }

    // Insert all the recent data
    if (recentSessionsData.length > 0) {
      await db.insert(userSessions).values(recentSessionsData);
      console.log(`✅ Created ${recentSessionsData.length} recent sessions`);
    }

    if (recentPaymentsData.length > 0) {
      await db.insert(payments).values(recentPaymentsData);
      console.log(`✅ Created ${recentPaymentsData.length} recent payments`);
    }

    if (recentActivitiesData.length > 0) {
      await db.insert(activityLogs).values(recentActivitiesData);
      console.log(
        `✅ Created ${recentActivitiesData.length} recent activities`,
      );
    }

    console.log("🎉 Recent data generated successfully!");

    return NextResponse.json({
      success: true,
      message: "Recent data generated successfully!",
      data: {
        sessions: recentSessionsData.length,
        payments: recentPaymentsData.length,
        activities: recentActivitiesData.length,
      },
    });
  } catch (error) {
    console.error("❌ Error generating recent data:", error);
    return NextResponse.json(
      {
        error: "Failed to generate recent data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
