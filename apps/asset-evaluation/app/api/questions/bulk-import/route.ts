import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../../../lib/db/drizzle';
import { questions, answers, questionCategories, propertyTypes } from '../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Validation schema for ID-based import question data
const ImportQuestionSchema = z.object({
  propertyTypeId: z.number().int().min(1, 'Property Type ID must be valid'),
  categoryId: z.number().int().min(0, 'Category ID must be 0 or positive'), // 0 = new
  categoryNameRo: z.string().min(1, 'Romanian category name is required'),
  categoryNameEn: z.string().optional(),
  questionId: z.number().int().min(0, 'Question ID must be 0 or positive'), // 0 = new
  questionRo: z.string().min(1, 'Romanian question is required'),
  questionEn: z.string().optional(),
  questionWeight: z.number().int().min(1).max(10),
  answerId: z.number().int().min(0, 'Answer ID must be 0 or positive'), // 0 = new
  answerRo: z.string().min(1, 'Romanian answer is required'),
  answerEn: z.string().optional(),
  answerWeight: z.number().int().min(1).max(10),
});

interface ProcessingContext {
  categoryIdMap: Map<string, number>; // key: "propertyTypeId-categoryNameRo", value: real category ID
  questionIdMap: Map<string, number>; // key: "categoryId-questionRo", value: real question ID
  answerIdMap: Map<string, number>; // key: "questionId-answerRo", value: real answer ID
}

export async function POST(request: NextRequest) {
  try {
    const { questions: questionsData, replaceExisting = false } = await request.json();

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of questions.' },
        { status: 400 }
      );
    }

    // Validate all questions
    const validatedQuestions = [];
    const validationErrors = [];

    for (let i = 0; i < questionsData.length; i++) {
      try {
        // Map old column names to new structure
        const row = questionsData[i];
        const mappedRow = {
          propertyTypeId: parseInt(row.property_type_id || row.propertyTypeId),
          categoryId: parseInt(row.category_id || row.categoryId || 0),
          categoryNameRo: row.category_name_ro || row.categoryNameRo,
          categoryNameEn: row.category_name_en || row.categoryNameEn,
          questionId: parseInt(row.question_id || row.questionId || 0),
          questionRo: row.question_ro || row.questionRo,
          questionEn: row.question_en || row.questionEn,
          questionWeight: parseInt(row.question_weight || row.questionWeight),
          answerId: parseInt(row.answer_id || row.answerId || 0),
          answerRo: row.answer_ro || row.answerRo,
          answerEn: row.answer_en || row.answerEn,
          answerWeight: parseInt(row.answer_weight || row.answerWeight),
        };

        const validated = ImportQuestionSchema.parse(mappedRow);
        validatedQuestions.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          validationErrors.push({
            row: i + 1,
            errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          });
        }
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          validationErrors,
          message: `${validationErrors.length} rows have validation errors`
        },
        { status: 400 }
      );
    }

    // Initialize processing context for ID mapping
    const context: ProcessingContext = {
      categoryIdMap: new Map(),
      questionIdMap: new Map(),
      answerIdMap: new Map()
    };

    // Verify all property types exist
    const propertyTypeIds = [...new Set(validatedQuestions.map(q => q.propertyTypeId))];
    for (const ptId of propertyTypeIds) {
      const exists = await db
        .select({ id: propertyTypes.id })
        .from(propertyTypes)
        .where(eq(propertyTypes.id, ptId))
        .limit(1);
      
      if (exists.length === 0) {
        return NextResponse.json(
          { error: `Property Type ID ${ptId} does not exist` },
          { status: 400 }
        );
      }
    }

    const results = {
      categoriesCreated: 0,
      categoriesUpdated: 0,
      questionsCreated: 0,
      questionsUpdated: 0,
      answersCreated: 0,
      answersUpdated: 0,
      failed: 0,
      details: [] as any[]
    };

    // Process in order: categories, questions, answers
    await processCategories(validatedQuestions, context, results, replaceExisting);
    await processQuestions(validatedQuestions, context, results, replaceExisting);
    await processAnswers(validatedQuestions, context, results, replaceExisting);

    return NextResponse.json({
      message: 'ID-based bulk import completed successfully',
      results: {
        totalProcessed: results.categoriesCreated + results.categoriesUpdated + 
                       results.questionsCreated + results.questionsUpdated + 
                       results.answersCreated + results.answersUpdated + results.failed,
        categoriesCreated: results.categoriesCreated,
        categoriesUpdated: results.categoriesUpdated,
        questionsCreated: results.questionsCreated,
        questionsUpdated: results.questionsUpdated,
        answersCreated: results.answersCreated,
        answersUpdated: results.answersUpdated,
        failed: results.failed,
        details: results.details,
        idMappings: {
          categories: Object.fromEntries(context.categoryIdMap),
          questions: Object.fromEntries(context.questionIdMap),
          answers: Object.fromEntries(context.answerIdMap)
        }
      }
    });

  } catch (error) {
    console.error('ID-based bulk import error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process ID-based bulk import',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function processCategories(
  validatedQuestions: any[], 
  context: ProcessingContext, 
  results: any, 
  replaceExisting: boolean
) {
  // Group unique categories
  const uniqueCategories = new Map<string, any>();
  
  for (const q of validatedQuestions) {
    const key = `${q.propertyTypeId}-${q.categoryNameRo}`;
    if (!uniqueCategories.has(key)) {
      uniqueCategories.set(key, {
        propertyTypeId: q.propertyTypeId,
        categoryId: q.categoryId,
        categoryNameRo: q.categoryNameRo,
        categoryNameEn: q.categoryNameEn
      });
    }
  }

  for (const [key, category] of uniqueCategories) {
    try {
      let realCategoryId: number;

      if (category.categoryId === 0) {
        // Create new category
        const [newCategory] = await db
          .insert(questionCategories)
          .values({
            name_ro: category.categoryNameRo,
            name_en: category.categoryNameEn || category.categoryNameRo,
            propertyTypeId: category.propertyTypeId
          })
          .returning();
        
        realCategoryId = newCategory.id;
        context.categoryIdMap.set(key, realCategoryId);
        results.categoriesCreated++;
      } else {
        // Use existing category ID or update if replaceExisting
        const existingCategory = await db
          .select()
          .from(questionCategories)
          .where(eq(questionCategories.id, category.categoryId))
          .limit(1);

        if (existingCategory.length === 0) {
          throw new Error(`Category ID ${category.categoryId} not found`);
        }

        if (replaceExisting) {
          await db
            .update(questionCategories)
            .set({
              name_ro: category.categoryNameRo,
              name_en: category.categoryNameEn || category.categoryNameRo,
              updatedAt: new Date()
            })
            .where(eq(questionCategories.id, category.categoryId));
          results.categoriesUpdated++;
        }

        realCategoryId = category.categoryId;
        context.categoryIdMap.set(key, realCategoryId);
      }
    } catch (error) {
      console.error('Error processing category:', error);
      results.failed++;
      results.details.push({
        type: 'category',
        name: category.categoryNameRo,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

async function processQuestions(
  validatedQuestions: any[], 
  context: ProcessingContext, 
  results: any, 
  replaceExisting: boolean
) {
  // Group unique questions
  const uniqueQuestions = new Map<string, any>();
  
  for (const q of validatedQuestions) {
    const categoryKey = `${q.propertyTypeId}-${q.categoryNameRo}`;
    const realCategoryId = context.categoryIdMap.get(categoryKey);
    
    if (realCategoryId) {
      const questionKey = `${realCategoryId}-${q.questionRo}`;
      if (!uniqueQuestions.has(questionKey)) {
        uniqueQuestions.set(questionKey, {
          questionId: q.questionId,
          questionRo: q.questionRo,
          questionEn: q.questionEn,
          questionWeight: q.questionWeight,
          categoryId: realCategoryId
        });
      }
    }
  }

  for (const [key, question] of uniqueQuestions) {
    try {
      let realQuestionId: number;

      if (question.questionId === 0) {
        // Create new question
        const [newQuestion] = await db
          .insert(questions)
          .values({
            text_ro: question.questionRo,
            text_en: question.questionEn || question.questionRo,
            weight: question.questionWeight,
            categoryId: question.categoryId
          })
          .returning();
        
        realQuestionId = newQuestion.id;
        context.questionIdMap.set(key, realQuestionId);
        results.questionsCreated++;
      } else {
        // Use existing question ID or update if replaceExisting
        const existingQuestion = await db
          .select()
          .from(questions)
          .where(eq(questions.id, question.questionId))
          .limit(1);

        if (existingQuestion.length === 0) {
          throw new Error(`Question ID ${question.questionId} not found`);
        }

        if (replaceExisting) {
          await db
            .update(questions)
            .set({
              text_ro: question.questionRo,
              text_en: question.questionEn || question.questionRo,
              weight: question.questionWeight,
              updatedAt: new Date()
            })
            .where(eq(questions.id, question.questionId));
          results.questionsUpdated++;
        }

        realQuestionId = question.questionId;
        context.questionIdMap.set(key, realQuestionId);
      }
    } catch (error) {
      console.error('Error processing question:', error);
      results.failed++;
      results.details.push({
        type: 'question',
        text: question.questionRo,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

async function processAnswers(
  validatedQuestions: any[], 
  context: ProcessingContext, 
  results: any, 
  replaceExisting: boolean
) {
  for (const q of validatedQuestions) {
    try {
      const categoryKey = `${q.propertyTypeId}-${q.categoryNameRo}`;
      const realCategoryId = context.categoryIdMap.get(categoryKey);
      
      if (!realCategoryId) {
        throw new Error(`Category not found for ${q.categoryNameRo}`);
      }

      const questionKey = `${realCategoryId}-${q.questionRo}`;
      const realQuestionId = context.questionIdMap.get(questionKey);
      
      if (!realQuestionId) {
        throw new Error(`Question not found for ${q.questionRo}`);
      }

      let realAnswerId: number;

      if (q.answerId === 0) {
        // Create new answer
        const [newAnswer] = await db
          .insert(answers)
          .values({
            text_ro: q.answerRo,
            text_en: q.answerEn || q.answerRo,
            weight: q.answerWeight,
            questionId: realQuestionId
          })
          .returning();
        
        realAnswerId = newAnswer.id;
        const answerKey = `${realQuestionId}-${q.answerRo}`;
        context.answerIdMap.set(answerKey, realAnswerId);
        results.answersCreated++;
      } else {
        // Use existing answer ID or update if replaceExisting
        const existingAnswer = await db
          .select()
          .from(answers)
          .where(eq(answers.id, q.answerId))
          .limit(1);

        if (existingAnswer.length === 0) {
          throw new Error(`Answer ID ${q.answerId} not found`);
        }

        if (replaceExisting) {
          await db
            .update(answers)
            .set({
              text_ro: q.answerRo,
              text_en: q.answerEn || q.answerRo,
              weight: q.answerWeight,
              updatedAt: new Date()
            })
            .where(eq(answers.id, q.answerId));
          results.answersUpdated++;
        }

        realAnswerId = q.answerId;
        const answerKey = `${realQuestionId}-${q.answerRo}`;
        context.answerIdMap.set(answerKey, realAnswerId);
      }
    } catch (error) {
      console.error('Error processing answer:', error);
      results.failed++;
      results.details.push({
        type: 'answer',
        text: q.answerRo,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
