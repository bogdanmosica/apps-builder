import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { payments, subscriptions, teamMembers, users } from "@/lib/db/schema";

// Type for subscription data with user info from custom query
type SubscriptionWithUserData = {
  id: number;
  planName: string;
  status: string;
  amount: number;
  currency: string;
  billingPeriod: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  userName: string | null;
  userEmail: string;
};

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

    // If user has no team, return empty subscriptions array
    if (userWithTeam.length === 0) {
      return NextResponse.json({ subscriptions: [] });
    }

    const teamId = userWithTeam[0].teamId;

    // Get all subscriptions with user info
    const teamSubscriptions = await db
      .select({
        id: subscriptions.id,
        planName: subscriptions.planName,
        status: subscriptions.status,
        amount: subscriptions.amount,
        currency: subscriptions.currency,
        billingPeriod: subscriptions.billingPeriod,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        createdAt: subscriptions.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .where(eq(subscriptions.teamId, teamId))
      .orderBy(desc(subscriptions.createdAt));

    // Format the data for the frontend
    const formattedSubscriptions = teamSubscriptions.map(
      (sub: SubscriptionWithUserData) => ({
        id: sub.id,
        planName: sub.planName,
        status: sub.status,
        amount: sub.amount,
        currency: sub.currency,
        billingPeriod: sub.billingPeriod,
        currentPeriodStart: sub.currentPeriodStart.toISOString(),
        currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        createdAt: sub.createdAt.toISOString(),
        user: {
          name: sub.userName,
          email: sub.userEmail || "",
        },
      }),
    );

    return NextResponse.json({ subscriptions: formattedSubscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
