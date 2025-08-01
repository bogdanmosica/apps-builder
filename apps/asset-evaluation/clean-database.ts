import { sql } from 'drizzle-orm';
import { db } from './lib/db/drizzle';

async function cleanDatabase() {
  try {
    console.log('🧹 Cleaning database...');
    
    // Drop all tables in the correct order (considering foreign key constraints)
    const dropQueries = [
      'DROP TABLE IF EXISTS content_comments CASCADE',
      'DROP TABLE IF EXISTS content_posts CASCADE', 
      'DROP TABLE IF EXISTS content_categories CASCADE',
      'DROP TABLE IF EXISTS content_media CASCADE',
      'DROP TABLE IF EXISTS communication_stats CASCADE',
      'DROP TABLE IF EXISTS notifications CASCADE',
      'DROP TABLE IF EXISTS campaigns CASCADE',
      'DROP TABLE IF EXISTS communication_templates CASCADE',
      'DROP TABLE IF EXISTS messages CASCADE',
      'DROP TABLE IF EXISTS conversations CASCADE',
      'DROP TABLE IF EXISTS webhook_deliveries CASCADE',
      'DROP TABLE IF EXISTS webhooks CASCADE',
      'DROP TABLE IF EXISTS api_requests CASCADE',
      'DROP TABLE IF EXISTS api_keys CASCADE',
      'DROP TABLE IF EXISTS integrations CASCADE',
      'DROP TABLE IF EXISTS pricing_plans CASCADE',
      'DROP TABLE IF EXISTS products CASCADE',
      'DROP TABLE IF EXISTS user_sessions CASCADE',
      'DROP TABLE IF EXISTS payments CASCADE',
      'DROP TABLE IF EXISTS subscriptions CASCADE',
      'DROP TABLE IF EXISTS invitations CASCADE',
      'DROP TABLE IF EXISTS activity_logs CASCADE',
      'DROP TABLE IF EXISTS team_members CASCADE',
      'DROP TABLE IF EXISTS teams CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP TABLE IF EXISTS __drizzle_migrations CASCADE',
    ];

    for (const query of dropQueries) {
      try {
        await db.execute(sql.raw(query));
        console.log(`✓ ${query}`);
      } catch (error) {
        // Ignore errors for tables that don't exist
        console.log(`- ${query} (table doesn't exist)`);
      }
    }

    console.log('✅ Database cleaned successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: pnpm db:migrate');
    console.log('2. Run: pnpm db:seed'); 
    console.log('3. Run: pnpm dev');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase()
  .then(() => {
    console.log('Database cleaning completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database cleaning failed:', error);
    process.exit(1);
  });
