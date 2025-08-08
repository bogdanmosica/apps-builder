import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { evaluationSessions, propertyTypes, users } from "@/lib/db/schema";

export async function GET() {
  try {
    console.log("🔍 Starting database debug check...");

    // Check if user is authenticated
    const session = await getSession();
    console.log(
      "Session check:",
      session ? "authenticated" : "not authenticated",
      session?.user?.id,
    );

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Authentication required for debug endpoint",
          authenticated: false,
        },
        { status: 401 },
      );
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      useNeon: process.env.USE_NEON,
      userId: session.user.id,
      checks: {},
    };

    // Test database connection
    try {
      console.log("Testing basic database connection...");
      await db.select().from(evaluationSessions).limit(1);
      results.checks.databaseConnection = "OK";
    } catch (error) {
      console.error("Database connection failed:", error);
      results.checks.databaseConnection = `FAILED: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    // Test user exists
    try {
      console.log("Checking if user exists...");
      const userCheck = await db
        .select()
        .from(users)
        .where({ id: session.user.id } as any)
        .limit(1);
      results.checks.userExists = userCheck.length > 0 ? "OK" : "NOT_FOUND";
      results.checks.userCount = userCheck.length;
    } catch (error) {
      console.error("User check failed:", error);
      results.checks.userExists = `FAILED: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    // Test property types exist
    try {
      console.log("Checking property types...");
      const propertyTypeCheck = await db.select().from(propertyTypes).limit(5);
      results.checks.propertyTypes = "OK";
      results.checks.propertyTypeCount = propertyTypeCheck.length;
    } catch (error) {
      console.error("Property types check failed:", error);
      results.checks.propertyTypes = `FAILED: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    // Test simple insert (without foreign keys)
    try {
      console.log("Testing simple insert operation...");
      const testData = {
        userId: session.user.id,
        propertyTypeId: 1, // Assuming property type 1 exists
        totalScore: 8500,
        maxPossibleScore: 10000,
        percentage: 85,
        level: "Good",
        badge: "Test Badge",
        completionRate: 100,
      };

      // Try to insert and immediately delete
      const [inserted] = await db
        .insert(evaluationSessions)
        .values(testData)
        .returning({ id: evaluationSessions.id });

      if (inserted?.id) {
        // Clean up test data
        await db.delete(evaluationSessions).where({ id: inserted.id } as any);
        results.checks.insertTest = "OK";
        results.checks.testSessionId = inserted.id;
      } else {
        results.checks.insertTest = "FAILED: No ID returned";
      }
    } catch (error) {
      console.error("Insert test failed:", error);
      results.checks.insertTest = `FAILED: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    console.log("Debug check completed:", results);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Debug check failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
