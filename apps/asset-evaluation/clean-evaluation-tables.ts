import { db } from './lib/db/drizzle';
import {
  answers,
  questions,
  questionCategories,
  propertyTypes,
  evaluationSessions,
  userEvaluationAnswers,
} from './lib/db/schema';

async function cleanEvaluationTables() {
  console.log('🗑️  Cleaning evaluation tables...');
  
  try {
    // Delete in reverse order due to foreign key constraints
    await db.delete(userEvaluationAnswers);
    await db.delete(evaluationSessions);
    await db.delete(answers);
    await db.delete(questions);
    await db.delete(questionCategories);
    await db.delete(propertyTypes);
    
    console.log('✅ All evaluation tables cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning tables:', error);
    throw error;
  }
}

cleanEvaluationTables()
  .catch((error) => {
    console.error('❌ Clean process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Clean process finished. Exiting...');
    process.exit(0);
  });
