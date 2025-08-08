import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

dotenv.config();

const isDevelopment =
  process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
const isProduction = process.env.NODE_ENV === "production";

// Create a singleton connection with proper pooling
let connectionSingleton: postgres.Sql<{}> | null = null;

// For development, we'll make the database connection optional
// This allows the app to run even without a database for the landing page
let db: any;
let client: postgres.Sql<{}> | null = null;

try {
  // Check for database URL in order of preference
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    if (isDevelopment) {
      console.warn(
        "⚠️  No DATABASE_URL or POSTGRES_URL found. Landing page will work, but user features disabled.",
      );

      // Create a mock database for development when no DB is available
      db = createMockDatabase();
    } else {
      throw new Error(
        "DATABASE_URL or POSTGRES_URL environment variable is not set",
      );
    }
  } else {
    if (isProduction || process.env.USE_NEON === "true") {
      // Use Neon for production or when explicitly configured
      const sql = neon(databaseUrl);
      db = drizzleNeon({ client: sql, schema: schema });
      console.log("🗄️  Database connected via Neon (serverless)");
    } else {
      // Use local postgres connection for development
      client =
        connectionSingleton ||
        postgres(databaseUrl, {
          max: 1, // Limit to 1 connection for development
          idle_timeout: 20, // Close idle connections after 20 seconds
          max_lifetime: 60 * 30, // Close connections after 30 minutes
        });

      if (!connectionSingleton) {
        connectionSingleton = client;
      }

      db = drizzle(client, { schema });
      console.log("🗄️  Database connected via PostgreSQL (local)");
    }
  }
} catch (error) {
  console.error("❌ Database connection failed:", error);

  if (isDevelopment) {
    console.log("🔄 Using mock database for development...");
    db = createMockDatabase();
  } else {
    throw error;
  }
}

// Mock database for graceful degradation
function createMockDatabase() {
  const mockResult = Promise.resolve([]);

  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => mockResult,
          execute: () => mockResult,
        }),
        limit: () => mockResult,
        execute: () => mockResult,
      }),
      execute: () => mockResult,
    }),
    insert: () => ({
      into: () => ({
        values: () => ({
          returning: () => mockResult,
          execute: () => mockResult,
        }),
        execute: () => mockResult,
      }),
      execute: () => mockResult,
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => mockResult,
          execute: () => mockResult,
        }),
        execute: () => mockResult,
      }),
      execute: () => mockResult,
    }),
    delete: () => ({
      from: () => ({
        where: () => ({
          execute: () => mockResult,
        }),
        execute: () => mockResult,
      }),
      execute: () => mockResult,
    }),
  };
}

export { db, client };
