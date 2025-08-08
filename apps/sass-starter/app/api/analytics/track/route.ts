import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { trackActivity, trackPageView } from "@/lib/analytics";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { teamMembers } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, path, data, timestamp } = body;

    const user = await getUser();
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (user) {
      // Authenticated user tracking
      const userWithTeam = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
        .limit(1);

      if (userWithTeam.length > 0) {
        const teamId = userWithTeam[0].teamId;

        // Track the event using existing functions
        if (action === "page_view") {
          await trackPageView(path, user.id, teamId, ipAddress);
        } else {
          await trackActivity(action, user.id, teamId, ipAddress);
        }
      }
    }
    // Skip anonymous tracking for now since schema requires teamId

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
