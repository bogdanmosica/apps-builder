import { db } from '@/lib/db/drizzle';

async function checkTables() {
  try {
    // Try to query the user_security_settings table
    console.log('Checking tables...');
    
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_security_settings', 'user_login_sessions', 'security_events')
      ORDER BY table_name;
    `);
    
    console.log('Security tables found:', result.rows);
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();
