import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '../../../../../lib/db/queries';
import { db } from '../../../../../lib/db/drizzle';
import { questionCategories, questions, answers } from '../../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface ImportData {
  property_type: string;
  category_name: string;
  question_ro: string;
  question_en: string;
  question_weight: number;
  answer_ro: string;
  answer_en: string;
  answer_weight: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'superuser') {
      return NextResponse.json(
        { error: 'Unauthorized. Superuser access required.' },
        { status: 403 }
      );
    }

    const { propertyTypeId, data }: { propertyTypeId: number; data: ImportData[] } = await request.json();

    if (!propertyTypeId || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Group data by question to handle multiple answers per question
    const questionGroups: Record<string, ImportData[]> = {};
    
    data.forEach(row => {
      const questionKey = `${row.question_ro}|${row.question_en}`;
      if (!questionGroups[questionKey]) {
        questionGroups[questionKey] = [];
      }
      questionGroups[questionKey].push(row);
    });

    let questionsCreated = 0;
    let answersCreated = 0;
    let categoriesCreated = 0;

    // Process each question group
    for (const [questionKey, questionRows] of Object.entries(questionGroups)) {
      const firstRow = questionRows[0];
      
      // Find or create category
      let category = await db
        .select()
        .from(questionCategories)
        .where(
          and(
            eq(questionCategories.propertyTypeId, propertyTypeId),
            eq(questionCategories.name_ro, firstRow.category_name)
          )
        )
        .limit(1);

      if (category.length === 0) {
        // Create category
        const newCategory = await db
          .insert(questionCategories)
          .values({
            name_ro: firstRow.category_name,
            name_en: firstRow.category_name, // Use same name for both languages if not provided separately
            propertyTypeId: propertyTypeId,
          })
          .returning();
        
        category = newCategory;
        categoriesCreated++;
      }

      const categoryId = category[0].id;

      // Check if question already exists
      const existingQuestion = await db
        .select()
        .from(questions)
        .where(
          and(
            eq(questions.categoryId, categoryId),
            eq(questions.text_ro, firstRow.question_ro)
          )
        )
        .limit(1);

      let questionId: number;

      if (existingQuestion.length === 0) {
        // Create new question
        const newQuestion = await db
          .insert(questions)
          .values({
            text_ro: firstRow.question_ro,
            text_en: firstRow.question_en,
            weight: firstRow.question_weight,
            categoryId: categoryId,
          })
          .returning();
        
        questionId = newQuestion[0].id;
        questionsCreated++;
      } else {
        questionId = existingQuestion[0].id;
        
        // Update existing question
        await db
          .update(questions)
          .set({
            text_en: firstRow.question_en,
            weight: firstRow.question_weight,
          })
          .where(eq(questions.id, questionId));
      }

      // Create answers for this question
      for (const row of questionRows) {
        // Check if answer already exists
        const existingAnswer = await db
          .select()
          .from(answers)
          .where(
            and(
              eq(answers.questionId, questionId),
              eq(answers.text_ro, row.answer_ro)
            )
          )
          .limit(1);

        if (existingAnswer.length === 0) {
          // Create new answer
          await db
            .insert(answers)
            .values({
              text_ro: row.answer_ro,
              text_en: row.answer_en,
              weight: row.answer_weight,
              questionId: questionId,
            });
          
          answersCreated++;
        } else {
          // Update existing answer
          await db
            .update(answers)
            .set({
              text_en: row.answer_en,
              weight: row.answer_weight,
            })
            .where(eq(answers.id, existingAnswer[0].id));
        }
      }
    }

    return NextResponse.json({
      success: true,
      questionsCreated,
      answersCreated,
      categoriesCreated,
      message: `Successfully imported ${questionsCreated} questions, ${answersCreated} answers, and created ${categoriesCreated} new categories.`
    });

  } catch (error) {
    console.error('Error importing questions:', error);
    return NextResponse.json(
      { error: 'Failed to import questions' },
      { status: 500 }
    );
  }
}
