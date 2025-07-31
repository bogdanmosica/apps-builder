import { sql } from 'drizzle-orm';
import { db } from './lib/db/drizzle';

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Query to list all tables
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Tables found:');
    if (result.length === 0) {
      console.log('❌ No tables found in the database!');
    } else {
      result.forEach((row: any) => {
        console.log(`  ✓ ${row.table_name}`);
      });
    }

    // Check migration table specifically
    const migrationResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      );
    `);
    
    console.log(`\nMigration table exists: ${migrationResult[0].exists}`);

    // Check migration records
    try {
      const migrations = await db.execute(sql`
        SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;
      `);
      console.log(`\nMigration records: ${migrations.length}`);
      migrations.forEach((migration: any) => {
        console.log(`  - ${migration.hash} (${migration.created_at})`);
      });
    } catch (error) {
      console.log('Cannot read migration records:', error instanceof Error ? error.message : String(error));
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkTables()
  .then(() => {
    console.log('\nTable check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Table check failed:', error);
    process.exit(1);
  });
