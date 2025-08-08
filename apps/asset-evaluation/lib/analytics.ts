import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { ActivityType, activityLogs, userSessions } from "@/lib/db/schema";

// Track user session start
export async function trackSessionStart(
  userId: number,
  teamId: number,
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    const result = await db
      .insert(userSessions)
      .values({
        userId,
        teamId,
        startTime: new Date(),
        ipAddress,
        userAgent,
      })
      .returning({ id: userSessions.id });

    return result[0]?.id;
  } catch (error) {
    console.error("Error tracking session start:", error);
    return null;
  }
}

// Track user session end
export async function trackSessionEnd(sessionId: number, endTime?: Date) {
  try {
    const end = endTime || new Date();

    // Get session start time to calculate duration
    const session = await db
      .select({
        startTime: userSessions.startTime,
      })
      .from(userSessions)
      .where(eq(userSessions.id, sessionId))
      .limit(1);

    if (session.length > 0) {
      const startTime = session[0].startTime;
      const duration = Math.floor(
        (end.getTime() - startTime.getTime()) / (1000 * 60),
      ); // Duration in minutes

      await db
        .update(userSessions)
        .set({
          endTime: end,
          duration,
        })
        .where(eq(userSessions.id, sessionId));
    }
  } catch (error) {
    console.error("Error tracking session end:", error);
  }
}

// Track activity/page views
export async function trackActivity(
  action: string,
  userId?: number,
  teamId?: number,
  ipAddress?: string,
) {
  try {
    if (!userId || !teamId) {
      const user = await getUser();
      if (!user) return;
      // You'd need to get user's team here
    }

    await db.insert(activityLogs).values({
      action,
      userId,
      teamId: teamId!,
      timestamp: new Date(),
      ipAddress,
    });
  } catch (error) {
    console.error("Error tracking activity:", error);
  }
}

// Track page view
export async function trackPageView(
  path: string,
  userId?: number,
  teamId?: number,
  ipAddress?: string,
) {
  const action = `PAGE_VIEW_${path.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  await trackActivity(action, userId, teamId, ipAddress);
}

// Generate sample analytics data for testing
export async function generateSampleData(teamId: number) {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Generate sample user sessions
    const sampleSessions = [];
    for (let i = 0; i < 50; i++) {
      const randomDate = new Date(
        last30Days.getTime() +
          Math.random() * (now.getTime() - last30Days.getTime()),
      );
      const duration = Math.floor(Math.random() * 60) + 1; // 1-60 minutes
      const endTime = new Date(randomDate.getTime() + duration * 60 * 1000);

      sampleSessions.push({
        userId: 1, // Assuming user ID 1 exists
        teamId,
        startTime: randomDate,
        endTime,
        duration,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      });
    }

    await db.insert(userSessions).values(sampleSessions);

    // Generate sample activity logs
    const pages = [
      "/",
      "/dashboard",
      "/pricing",
      "/settings",
      "/team",
      "/analytics",
    ];
    const sampleActivities = [];

    for (let i = 0; i < 200; i++) {
      const randomDate = new Date(
        last30Days.getTime() +
          Math.random() * (now.getTime() - last30Days.getTime()),
      );
      const randomPage = pages[Math.floor(Math.random() * pages.length)];

      sampleActivities.push({
        action: `PAGE_VIEW_${randomPage.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`,
        userId: 1,
        teamId,
        timestamp: randomDate,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      });
    }

    await db.insert(activityLogs).values(sampleActivities);

    console.log("Sample analytics data generated successfully");
  } catch (error) {
    console.error("Error generating sample data:", error);
  }
}
