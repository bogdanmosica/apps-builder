import { db } from './drizzle';
import {
  evaluationQuestions,
  evaluationAnswerChoices,
  type NewEvaluationQuestion,
  type NewEvaluationAnswerChoice,
} from './schema';

const defaultQuestions: Array<{
  question: NewEvaluationQuestion;
  choices: Array<Omit<NewEvaluationAnswerChoice, 'questionId'>>;
}> = [
  {
    question: {
      question: 'How would you rate the proximity to city center/downtown?',
      description: 'Consider accessibility to business districts, entertainment, and major amenities',
      category: 'location',
      weight: 25,
      sortOrder: 1,
    },
    choices: [
      { answerText: 'Very close (0-5 km)', answerValue: 100, sortOrder: 1 },
      { answerText: 'Close (5-15 km)', answerValue: 80, sortOrder: 2 },
      { answerText: 'Moderate distance (15-30 km)', answerValue: 60, sortOrder: 3 },
      { answerText: 'Far (30-50 km)', answerValue: 40, sortOrder: 4 },
      { answerText: 'Very far (50+ km)', answerValue: 20, sortOrder: 5 },
    ],
  },
  {
    question: {
      question: 'How would you rate the neighborhood safety and security?',
      description: 'Consider crime rates, lighting, security measures, and overall feeling of safety',
      category: 'location',
      weight: 20,
      sortOrder: 2,
    },
    choices: [
      { answerText: 'Excellent - Very safe area', answerValue: 100, sortOrder: 1 },
      { answerText: 'Good - Generally safe', answerValue: 80, sortOrder: 2 },
      { answerText: 'Average - Some safety concerns', answerValue: 60, sortOrder: 3 },
      { answerText: 'Poor - Notable safety issues', answerValue: 40, sortOrder: 4 },
      { answerText: 'Very poor - Unsafe area', answerValue: 20, sortOrder: 5 },
    ],
  },
  {
    question: {
      question: 'How would you rate access to public transportation?',
      description: 'Consider proximity to bus stops, metro stations, train stations, and frequency of service',
      category: 'location',
      weight: 15,
      sortOrder: 3,
    },
    choices: [
      { answerText: 'Excellent - Multiple options within walking distance', answerValue: 100, sortOrder: 1 },
      { answerText: 'Good - Several options nearby', answerValue: 80, sortOrder: 2 },
      { answerText: 'Average - Limited options', answerValue: 60, sortOrder: 3 },
      { answerText: 'Poor - Few transportation options', answerValue: 40, sortOrder: 4 },
      { answerText: 'Very poor - No public transportation', answerValue: 20, sortOrder: 5 },
    ],
  },
  {
    question: {
      question: 'What is the overall structural condition of the property?',
      description: 'Consider foundation, walls, roof, windows, and general structural integrity',
      category: 'condition',
      weight: 30,
      sortOrder: 4,
    },
    choices: [
      { answerText: 'Excellent - Recently built or fully renovated', answerValue: 100, sortOrder: 1 },
      { answerText: 'Good - Well maintained with minor wear', answerValue: 80, sortOrder: 2 },
      { answerText: 'Average - Some maintenance needed', answerValue: 60, sortOrder: 3 },
      { answerText: 'Poor - Significant maintenance required', answerValue: 40, sortOrder: 4 },
      { answerText: 'Very poor - Major structural issues', answerValue: 20, sortOrder: 5 },
    ],
  },
  {
    question: {
      question: 'How would you rate the interior condition and finishes?',
      description: 'Consider flooring, paint, fixtures, kitchen, bathroom quality, and overall interior state',
      category: 'condition',
      weight: 25,
      sortOrder: 5,
    },
    choices: [
      { answerText: 'Excellent - High-end finishes, like new', answerValue: 100, sortOrder: 1 },
      { answerText: 'Good - Quality finishes, well maintained', answerValue: 80, sortOrder: 2 },
      { answerText: 'Average - Standard finishes, some wear', answerValue: 60, sortOrder: 3 },
      { answerText: 'Poor - Outdated or damaged finishes', answerValue: 40, sortOrder: 4 },
      { answerText: 'Very poor - Significant renovation needed', answerValue: 20, sortOrder: 5 },
    ],
  },
  {
    question: {
      question: 'What is the energy efficiency rating of the property?',
      description: 'Consider insulation, windows, heating system, and overall energy performance',
      category: 'efficiency',
      weight: 20,
      sortOrder: 6,
    },
    choices: [
      { answerText: 'A - Highly energy efficient', answerValue: 100, sortOrder: 1 },
      { answerText: 'B - Good energy efficiency', answerValue: 80, sortOrder: 2 },
      { answerText: 'C - Average energy efficiency', answerValue: 60, sortOrder: 3 },
      { answerText: 'D - Below average efficiency', answerValue: 40, sortOrder: 4 },
      { answerText: 'E or lower - Poor energy efficiency', answerValue: 20, sortOrder: 5 },
    ],
  },
  {
    question: {
      question: 'How would you rate the heating and cooling systems?',
      description: 'Consider type of system, age, efficiency, and coverage throughout the property',
      category: 'efficiency',
      weight: 15,
      sortOrder: 7,
    },
    choices: [
      { answerText: 'Excellent - Modern, efficient system', answerValue: 100, sortOrder: 1 },
      { answerText: 'Good - Reliable system in good condition', answerValue: 80, sortOrder: 2 },
      { answerText: 'Average - Functional but aging system', answerValue: 60, sortOrder: 3 },
      { answerText: 'Poor - Old or inefficient system', answerValue: 40, sortOrder: 4 },
      { answerText: 'Very poor - System needs replacement', answerValue: 20, sortOrder: 5 },
    ],
  },
  {
    question: {
      question: 'How would you rate the available amenities and features?',
      description: 'Consider parking, storage, outdoor space, building amenities, and special features',
      category: 'amenities',
      weight: 15,
      sortOrder: 8,
    },
    choices: [
      { answerText: 'Excellent - Comprehensive amenities', answerValue: 100, sortOrder: 1 },
      { answerText: 'Good - Several useful amenities', answerValue: 80, sortOrder: 2 },
      { answerText: 'Average - Basic amenities available', answerValue: 60, sortOrder: 3 },
      { answerText: 'Poor - Limited amenities', answerValue: 40, sortOrder: 4 },
      { answerText: 'Very poor - No notable amenities', answerValue: 20, sortOrder: 5 },
    ],
  },
];

export async function seedEvaluationQuestions() {
  console.log('🌱 Seeding evaluation questions...');

  // Clear existing questions
  await db.delete(evaluationAnswerChoices);
  await db.delete(evaluationQuestions);

  // Insert questions and their choices
  for (const { question, choices } of defaultQuestions) {
    console.log(`Adding question: ${question.question}`);
    
    const [insertedQuestion] = await db
      .insert(evaluationQuestions)
      .values(question)
      .returning();

    console.log(`Adding ${choices.length} answer choices...`);
    
    for (const choice of choices) {
      await db.insert(evaluationAnswerChoices).values({
        ...choice,
        questionId: insertedQuestion.id,
      });
    }
  }

  console.log('✅ Evaluation questions seeded successfully!');
}

// Run seeding if called directly
if (require.main === module) {
  seedEvaluationQuestions()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
