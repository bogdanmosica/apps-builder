const { Pool } = require('pg');

async function testMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Testing migration...');
    
    // Check if property columns exist
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'evaluation_sessions' 
      AND column_name IN ('property_name', 'property_location', 'property_surface', 'property_floors', 'property_construction_year')
      ORDER BY column_name;
    `);
    
    console.log('Found property columns:', result.rows.map(r => r.column_name));
    
    if (result.rows.length === 5) {
      console.log('✅ All property columns exist!');
    } else {
      console.log('❌ Missing property columns:', 5 - result.rows.length);
    }
    
  } catch (error) {
    console.error('Migration test failed:', error);
  } finally {
    await pool.end();
  }
}

testMigration();
