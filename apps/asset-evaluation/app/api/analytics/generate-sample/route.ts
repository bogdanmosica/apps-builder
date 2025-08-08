import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { generateSampleData } from "@/lib/analytics";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { teamMembers } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
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

    // Generate sample data
    await generateSampleData(teamId);

    return NextResponse.json({
      success: true,
      message: "Sample analytics data generated successfully",
    });
  } catch (error) {
    console.error("Error generating sample data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
