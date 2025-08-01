import { config } from 'dotenv';
import { readFileSync } from 'fs';
import postgres from 'postgres';

// Load environment variables
config();

async function runMigration() {
  const sql = postgres(process.env.POSTGRES_URL!);
  
  try {
    console.log('🔄 Starting database migration...');
    
    // Read the migration file
    const migrationSQL = readFileSync('./manual-migration.sql', 'utf8');
    
    // Split by statement separator and execute each statement
    const statements = migrationSQL
      .split('-- statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await sql.unsafe(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
