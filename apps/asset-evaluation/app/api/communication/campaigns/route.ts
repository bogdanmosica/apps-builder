import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { campaigns, users } from "@/lib/db/schema";

// Type for campaign data from database
type CampaignData = typeof campaigns.$inferSelect;

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

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

    // Build query conditions
    const conditions = [eq(campaigns.teamId, teamId)];

    if (type && type !== "all") {
      conditions.push(eq(campaigns.type, type));
    }

    if (status && status !== "all") {
      conditions.push(eq(campaigns.status, status));
    }

    // Get campaigns
    const campaignList = await db
      .select()
      .from(campaigns)
      .where(and(...conditions))
      .orderBy(desc(campaigns.createdAt))
      .limit(50);

    return NextResponse.json({
      campaigns: campaignList.map((campaign: CampaignData) => ({
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        recipients: campaign.recipientCount,
        openRate: parseFloat(campaign.openRate || "0"),
        clickRate: parseFloat(campaign.clickRate || "0"),
        responseRate: parseFloat(campaign.responseRate || "0"),
        sentDate:
          campaign.sentAt?.toISOString().split("T")[0] ||
          campaign.createdAt.toISOString().split("T")[0],
        template: "Custom", // Default template name
      })),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
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
    const { name, description, type = "email", recipientCount = 0 } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
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

    // Create new campaign
    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        teamId,
        name,
        description,
        type,
        recipientCount,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json(
      {
        campaign: {
          id: newCampaign.id,
          name: newCampaign.name,
          type: newCampaign.type,
          status: newCampaign.status,
          recipients: newCampaign.recipientCount,
          openRate: parseFloat(newCampaign.openRate || "0"),
          clickRate: parseFloat(newCampaign.clickRate || "0"),
          responseRate: parseFloat(newCampaign.responseRate || "0"),
          sentDate: newCampaign.createdAt.toISOString().split("T")[0],
          template: "Custom",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
