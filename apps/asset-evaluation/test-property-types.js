const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { propertyTypes, questionCategories, questions, answers } = require('./lib/db/schema.ts');

async function testPropertyTypes() {
  try {
    const connectionString = process.env.POSTGRES_URL || 'postgresql://localhost:5432/test';
    console.log('Connecting to:', connectionString.split('@')[1] || 'local database');
    
    const sql = neon(connectionString);
    const db = drizzle(sql);
    
    // Test if we can query property types
    const types = await db.select().from(propertyTypes);
    console.log('\n✅ Property types found:', types.length);
    
    if (types.length > 0) {
      console.log('First property type:', types[0]);
      
      // Check categories for first property type
      const categories = await db.select().from(questionCategories).where(eq(questionCategories.propertyTypeId, types[0].id));
      console.log('Categories for first property type:', categories.length);
      
      if (categories.length > 0) {
        console.log('First category:', categories[0]);
        
        // Check questions for first category
        const questionsData = await db.select().from(questions).where(eq(questions.categoryId, categories[0].id));
        console.log('Questions for first category:', questionsData.length);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPropertyTypes();
