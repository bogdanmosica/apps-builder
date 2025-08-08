import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { propertyTypes, users } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Quick diagnostic check...");

    // Check database connection
    await db.select().from(propertyTypes).limit(1);

    // Count property types
    const propertyTypesData = await db.select().from(propertyTypes);

    // Count users
    const usersData = await db.select().from(users);

    // Check session
    const session = await getSession();

    // Environment check
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      isVercel: !!process.env.VERCEL,
      region: process.env.VERCEL_REGION || "unknown",
    };

    const status = {
      success: true,
      timestamp: new Date().toISOString(),
      environment,
      database: {
        connected: true,
        propertyTypes: propertyTypesData.length,
        propertyTypesData: propertyTypesData, // Show actual data for debugging
        users: usersData.length,
        isSeeded: propertyTypesData.length > 0,
      },
      auth: {
        hasSession: !!session,
        userId: session?.user?.id || null,
      },
      buildInfo: {
        buildTime: process.env.VERCEL_GIT_COMMIT_SHA
          ? "Vercel Build"
          : "Local Build",
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
      },
      recommendations: [] as string[],
    };

    // Add recommendations
    if (propertyTypesData.length === 0) {
      status.recommendations.push(
        "❌ Database not seeded. Property types missing.",
      );
      status.recommendations.push(
        "💡 Run: npm run db:seed or check Vercel build logs.",
      );
      status.recommendations.push(
        "🔧 Ensure DATABASE_URL is set in Vercel environment variables.",
      );
    }

    if (usersData.length === 0) {
      status.recommendations.push(
        "❌ No users in database. Run seed script to create admin user.",
      );
    }

    if (!session) {
      status.recommendations.push(
        "⚠️ No active session. Login required to save evaluations.",
      );
    }

    if (!environment.hasDbUrl && !environment.hasPostgresUrl) {
      status.recommendations.push(
        "❌ No database URL configured (DATABASE_URL or POSTGRES_URL).",
      );
    }

    if (!environment.hasNextAuthSecret) {
      status.recommendations.push("⚠️ NEXTAUTH_SECRET not configured.");
    }

    if (status.recommendations.length === 0) {
      status.recommendations.push(
        "✅ All systems operational. Ready to save evaluations!",
      );
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("❌ Diagnostic check failed:", error);

    const errorStatus = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        isVercel: !!process.env.VERCEL,
      },
      recommendations: [
        "❌ System check failed.",
        "Check database connection and environment variables.",
        "Verify DATABASE_URL or POSTGRES_URL is correctly set.",
        "Ensure database is accessible from current environment.",
        "Check if database tables exist (run migrations first).",
      ],
    };

    return NextResponse.json(errorStatus, { status: 500 });
  }
}
