import { and, desc, eq, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "./drizzle";
import {
  activityLogs,
  type EvaluationSession,
  evaluationSessions,
  propertyTypes,
  teamMembers,
  teams,
  userProfiles,
  users,
} from "./schema";

export async function getUser() {
  try {
    const sessionData = await getSession();

    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== "number"
    ) {
      return null;
    }

    if (new Date(sessionData.expires) < new Date()) {
      return null;
    }

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error("Error fetching user:", error);
    // Return null instead of throwing to prevent page crashes
    return null;
  }
}

export async function getUserWithProfile() {
  try {
    const sessionData = await getSession();
    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== "number"
    ) {
      return null;
    }

    if (new Date(sessionData.expires) < new Date()) {
      return null;
    }

    const result = await db.query.users.findFirst({
      where: and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)),
      with: {
        profile: true,
      },
    });

    return result || null;
  } catch (error) {
    console.error("Error fetching user with profile:", error);
    return null;
  }
}

export async function createUserProfile(userId: number, profileData: any) {
  const [profile] = await db
    .insert(userProfiles)
    .values({
      userId,
      ...profileData,
    })
    .returning();

  return profile;
}

export async function updateUserProfile(userId: number, profileData: any) {
  const [profile] = await db
    .update(userProfiles)
    .set({
      ...profileData,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId))
    .returning();

  return profile;
}

export async function updateUserBasicInfo(
  userId: number,
  userData: { name?: string; email?: string },
) {
  const [user] = await db
    .update(users)
    .set({
      ...userData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return user;
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  },
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.team || null;
}

// Property Evaluation Queries
export async function getUserEvaluations() {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const evaluations = await db.query.evaluationSessions.findMany({
      where: eq(evaluationSessions.userId, user.id),
      with: {
        propertyType: true,
      },
      orderBy: desc(evaluationSessions.completedAt),
    });

    return evaluations;
  } catch (error) {
    console.error("Error fetching user evaluations:", error);
    return [];
  }
}

export async function getUserEvaluationStats() {
  try {
    const user = await getUser();
    if (!user) {
      return {
        totalEvaluations: 0,
        averageScore: 0,
        bestScore: 0,
        completionRate: 0,
      };
    }

    const evaluations = await db
      .select()
      .from(evaluationSessions)
      .where(eq(evaluationSessions.userId, user.id));

    if (evaluations.length === 0) {
      return {
        totalEvaluations: 0,
        averageScore: 0,
        bestScore: 0,
        completionRate: 0,
      };
    }

    const totalScore = evaluations.reduce(
      (sum: number, evaluation: EvaluationSession) =>
        sum + evaluation.percentage,
      0,
    );
    const bestScore = Math.max(
      ...evaluations.map(
        (evaluation: EvaluationSession) => evaluation.percentage,
      ),
    );
    const averageCompletionRate = evaluations.reduce(
      (sum: number, evaluation: EvaluationSession) =>
        sum + evaluation.completionRate,
      0,
    );

    return {
      totalEvaluations: evaluations.length,
      averageScore: Math.round(totalScore / evaluations.length),
      bestScore,
      completionRate: Math.round(averageCompletionRate / evaluations.length),
    };
  } catch (error) {
    console.error("Error fetching user evaluation stats:", error);
    return {
      totalEvaluations: 0,
      averageScore: 0,
      bestScore: 0,
      completionRate: 0,
    };
  }
}
