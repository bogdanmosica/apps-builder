import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Create a singleton connection with proper pooling
let connectionSingleton: postgres.Sql<{}> | null = null;

export const client = connectionSingleton || postgres(process.env.POSTGRES_URL, {
  max: 1, // Limit to 1 connection for development
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 30, // Close connections after 30 minutes
});

if (!connectionSingleton) {
  connectionSingleton = client;
}

export const db = drizzle(client, { schema });
