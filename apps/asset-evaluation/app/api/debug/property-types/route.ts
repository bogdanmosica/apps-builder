import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { propertyTypes, questionCategories, questions, answers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking property types in database...');
    
    // Get all property types
    const allPropertyTypes = await db.select().from(propertyTypes);
    console.log('📋 Property types found:', allPropertyTypes);
    
    // Get categories for each property type
    const propertyTypesWithCategories = [];
    for (const propertyType of allPropertyTypes) {
      const categories = await db
        .select()
        .from(questionCategories)
        .where(eq(questionCategories.propertyTypeId, propertyType.id));
      
      const categoriesWithQuestions = [];
      for (const category of categories) {
        const questionsData = await db
          .select()
          .from(questions)
          .where(eq(questions.categoryId, category.id));
        
        const questionsWithAnswers = [];
        for (const question of questionsData) {
          const answersData = await db
            .select()
            .from(answers)
            .where(eq(answers.questionId, question.id));
          
          questionsWithAnswers.push({
            ...question,
            answers: answersData
          });
        }
        
        categoriesWithQuestions.push({
          ...category,
          questions: questionsWithAnswers
        });
      }
      
      propertyTypesWithCategories.push({
        ...propertyType,
        categories: categoriesWithQuestions
      });
    }
    
    return NextResponse.json({
      success: true,
      propertyTypes: allPropertyTypes,
      propertyTypesWithCategories,
      summary: {
        totalPropertyTypes: allPropertyTypes.length,
        propertyTypeIds: allPropertyTypes.map((pt: any) => pt.id)
      }
    });
  } catch (error) {
    console.error('❌ Error checking property types:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
