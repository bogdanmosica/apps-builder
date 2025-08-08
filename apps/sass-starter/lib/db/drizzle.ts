import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import postgres from "postgres";
import * as schema from "./schema";

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

// Create a singleton connection with proper pooling
let connectionSingleton: postgres.Sql<{}> | null = null;

export const client =
  connectionSingleton ||
  postgres(process.env.POSTGRES_URL, {
    max: 1, // Limit to 1 connection for development
    idle_timeout: 20, // Close idle connections after 20 seconds
    max_lifetime: 60 * 30, // Close connections after 30 minutes
  });

if (!connectionSingleton) {
  connectionSingleton = client;
}

const sql = neon(process.env.POSTGRES_URL!);
export const db = drizzle({ client: sql, schema: schema });
// export const db = drizzle(client, { schema });
