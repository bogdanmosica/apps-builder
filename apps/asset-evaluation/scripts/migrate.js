#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { migrate } = require('drizzle-orm/neon-http/migrator');
const path = require('path');

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
    process.exit(1);
  }

  console.log('🗄️ Connecting to database...');
  const sql = neon(databaseUrl);
  const db = drizzle({ client: sql });

  try {
    console.log('🚀 Running database migrations...');
    
    await migrate(db, { 
      migrationsFolder: path.join(__dirname, 'lib', 'db', 'migrations')
    });
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations().catch(console.error);
}

module.exports = { runMigrations };
