import { and, desc, eq, isNull, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { notifications, users } from "@/lib/db/schema";

// Type for notification data from database
type NotificationData = typeof notifications.$inferSelect;

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

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
      return NextResponse.json(
        { error: "User not found or not part of a team" },
        { status: 404 },
      );
    }

    const teamId = user.teamMembers[0].teamId;

    // Build query conditions - get notifications for the team or specifically for the user
    const conditions = [
      eq(notifications.teamId, teamId),
      or(
        eq(notifications.userId, session.user.id),
        isNull(notifications.userId), // System notifications
      ),
    ];

    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    // Get notifications
    const notificationList = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return NextResponse.json({
      notifications: notificationList.map((notification: NotificationData) => ({
        id: notification.id,
        title: notification.title,
        description: notification.description,
        type: notification.type,
        timestamp: notification.createdAt.toISOString(),
        read: notification.isRead,
        actionUrl: notification.actionUrl,
      })),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type = "info", actionUrl } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Notification title is required" },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: "User not found or not part of a team" },
        { status: 404 },
      );
    }

    const teamId = user.teamMembers[0].teamId;

    // Create new notification
    const [newNotification] = await db
      .insert(notifications)
      .values({
        teamId,
        userId: session.user.id,
        title,
        description,
        type,
        actionUrl,
      })
      .returning();

    return NextResponse.json(
      {
        notification: {
          id: newNotification.id,
          title: newNotification.title,
          description: newNotification.description,
          type: newNotification.type,
          timestamp: newNotification.createdAt.toISOString(),
          read: newNotification.isRead,
          actionUrl: newNotification.actionUrl,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAsRead = true } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Notification IDs are required" },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: "User not found or not part of a team" },
        { status: 404 },
      );
    }

    const teamId = user.teamMembers[0].teamId;

    // Update notifications
    for (const notificationId of notificationIds) {
      await db
        .update(notifications)
        .set({ isRead: markAsRead })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.teamId, teamId),
            or(
              eq(notifications.userId, session.user.id),
              isNull(notifications.userId),
            ),
          ),
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
