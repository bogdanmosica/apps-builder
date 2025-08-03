import { db } from './lib/db/drizzle';

async function addPropertyInfoColumns() {
  try {
    console.log('Adding property info columns to evaluation_sessions...');
    
    // Add the new columns
    await db.execute(`
      ALTER TABLE evaluation_sessions 
      ADD COLUMN IF NOT EXISTS property_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS property_location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS property_surface INTEGER,
      ADD COLUMN IF NOT EXISTS property_floors VARCHAR(20),
      ADD COLUMN IF NOT EXISTS property_construction_year INTEGER
    `);
    
    console.log('✅ Property info columns added successfully!');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    process.exit(0);
  }
}

addPropertyInfoColumns();
