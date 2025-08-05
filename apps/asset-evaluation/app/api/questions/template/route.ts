import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '../../../../lib/db/drizzle';
import { propertyTypes, questionCategories, questions, answers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const exportType = url.searchParams.get('type') || 'template'; // 'template' or 'export'
    const propertyTypeId = url.searchParams.get('propertyTypeId');

    if (exportType === 'export') {
      return await handleDataExport(propertyTypeId);
    } else {
      return await handleTemplateGeneration();
    }
  } catch (error) {
    console.error('Template/Export error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate template/export',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleDataExport(propertyTypeId: string | null) {
  // Export existing data with IDs
  let whereClause = {};
  if (propertyTypeId) {
    whereClause = eq(propertyTypes.id, parseInt(propertyTypeId));
  }

  // Get all data with relationships
  const exportData: any[] = [];
  
  // Get property types
  const allPropertyTypes = propertyTypeId 
    ? await db.select().from(propertyTypes).where(eq(propertyTypes.id, parseInt(propertyTypeId)))
    : await db.select().from(propertyTypes);

  for (const propertyType of allPropertyTypes) {
    // Get categories for this property type
    const categories = await db
      .select()
      .from(questionCategories)
      .where(eq(questionCategories.propertyTypeId, propertyType.id));

    for (const category of categories) {
      // Get questions for this category
      const categoryQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.categoryId, category.id));

      for (const question of categoryQuestions) {
        // Get answers for this question
        const questionAnswers = await db
          .select()
          .from(answers)
          .where(eq(answers.questionId, question.id));

        // Create rows for each answer
        for (const answer of questionAnswers) {
          exportData.push([
            propertyType.id,
            category.id,
            category.name_ro,
            category.name_en || category.name_ro,
            question.id,
            question.text_ro,
            question.text_en || question.text_ro,
            question.weight || 5, // Default to 5 if 0 or null
            answer.id,
            answer.text_ro,
            answer.text_en || answer.text_ro,
            answer.weight || 5 // Default to 5 if 0 or null
          ]);
        }
      }
    }
  }

  // Create workbook with export data
  const workbook = XLSX.utils.book_new();
  
  // Add headers
  const headers = [
    'property_type_id',
    'category_id', 
    'category_name_ro',
    'category_name_en',
    'question_id',
    'question_ro',
    'question_en',
    'question_weight',
    'answer_id',
    'answer_ro',
    'answer_en',
    'answer_weight'
  ];
  
  const worksheetData = [headers, ...exportData];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // property_type_id
    { wch: 12 }, // category_id
    { wch: 25 }, // category_name_ro
    { wch: 25 }, // category_name_en
    { wch: 12 }, // question_id
    { wch: 50 }, // question_ro
    { wch: 50 }, // question_en
    { wch: 15 }, // question_weight
    { wch: 10 }, // answer_id
    { wch: 40 }, // answer_ro
    { wch: 40 }, // answer_en
    { wch: 15 }  // answer_weight
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions Export');

  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Create filename
  const currentDate = new Date().toISOString().split('T')[0];
  const filename = propertyTypeId 
    ? `questions-export-property-${propertyTypeId}-${currentDate}.xlsx`
    : `questions-export-all-${currentDate}.xlsx`;

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length.toString(),
    },
  });
}

interface ExistingQuestionData {
  property_type_id: number;
  category_id: number;
  category_name_ro: string;
  category_name_en: string | null;
  question_id: number;
  question_ro: string;
  question_en: string | null;
  question_weight: number;
  answer_id: number;
  answer_ro: string;
  answer_en: string | null;
  answer_weight: number;
}

async function getExistingQuestionsForTemplate(): Promise<ExistingQuestionData[]> {
  try {
    // Get existing questions with all relationships using joins
    const allPropertyTypes = await db.select().from(propertyTypes);
    const result: ExistingQuestionData[] = [];

    for (const propertyType of allPropertyTypes) {
      // Get categories for this property type
      const categories = await db
        .select()
        .from(questionCategories)
        .where(eq(questionCategories.propertyTypeId, propertyType.id));

      for (const category of categories) {
        // Get questions for this category
        const categoryQuestions = await db
          .select()
          .from(questions)
          .where(eq(questions.categoryId, category.id));

        for (const question of categoryQuestions) {
          // Get answers for this question
          const questionAnswers = await db
            .select()
            .from(answers)
            .where(eq(answers.questionId, question.id));

          // Add each answer as a row (maintaining the flat structure)
          for (const answer of questionAnswers) {
            result.push({
              property_type_id: propertyType.id,
              category_id: category.id,
              category_name_ro: category.name_ro,
              category_name_en: category.name_en,
              question_id: question.id,
              question_ro: question.text_ro,
              question_en: question.text_en,
              question_weight: question.weight || 5, // Default to 5 if 0 or null
              answer_id: answer.id,
              answer_ro: answer.text_ro,
              answer_en: answer.text_en,
              answer_weight: answer.weight || 5 // Default to 5 if 0 or null
            });
          }
        }
      }
    }
    
    return result.slice(0, 20); // Limit to first 20 for template
  } catch (error) {
    console.error('Error fetching existing questions for template:', error);
    return [];
  }
}

async function handleTemplateGeneration() {
  // Get property types for the template
  const existingPropertyTypes = await db.select().from(propertyTypes);
  
  const propertyTypesList = existingPropertyTypes.length > 0 
    ? existingPropertyTypes.map((pt: any) => `ID: ${pt.id} - ${pt.name_ro}`).join(', ')
    : 'Example: ID: 1 - Apartament, ID: 2 - Casa, ID: 3 - Vila';

  // Get existing questions to populate template
  const existingQuestions = await getExistingQuestionsForTemplate();

  // Create template data with headers and real data
  const templateData = [
    // Headers row
    [
      'property_type_id',
      'category_id',
      'category_name_ro',
      'category_name_en',
      'question_id',
      'question_ro',
      'question_en',
      'question_weight',
      'answer_id',
      'answer_ro',
      'answer_en',
      'answer_weight'
    ],
    // Instructions row
    [
      'ID from property types below, or new ID',
      '0 for new category, existing ID to update',
      'Required - category name in Romanian',
      'Optional - category name in English',
      '0 for new question, existing ID to update',
      'Required - question text in Romanian',
      'Optional - question text in English',
      'Number 1-10 (importance weight)',
      '0 for new answer, existing ID to update',
      'Required - answer text in Romanian',
      'Optional - answer text in English',
      'Number 1-10 (answer value)'
    ]
  ];

  // Add existing questions as examples
  if (existingQuestions.length > 0) {
    existingQuestions.forEach((questionData: ExistingQuestionData) => {
      templateData.push([
        String(questionData.property_type_id),
        String(questionData.category_id),
        questionData.category_name_ro,
        questionData.category_name_en || questionData.category_name_ro,
        String(questionData.question_id),
        questionData.question_ro,
        questionData.question_en || questionData.question_ro,
        String(questionData.question_weight),
        String(questionData.answer_id),
        questionData.answer_ro,
        questionData.answer_en || questionData.answer_ro,
        String(questionData.answer_weight)
      ]);
    });
  } else {
    // Add sample rows if no existing questions
    const samplePropertyTypeId = existingPropertyTypes.length > 0 ? existingPropertyTypes[0].id : 1;
    
    // Example row 1 - New category and question
    templateData.push([
      String(samplePropertyTypeId),
      '0', // New category
      'Structura si Constructie',
      'Structure and Construction',
      '0', // New question
      'Care este starea generala a structurii cladiri?',
      'What is the general condition of the building structure?',
      '8',
      '0', // New answer
      'Excelenta - fara fisuri sau probleme vizibile',
      'Excellent - no cracks or visible issues',
      '10'
    ]);
    
    // Example row 2 - Same question, additional answer
    templateData.push([
      String(samplePropertyTypeId),
      '0', // Same new category (will be linked)
      'Structura si Constructie',
      'Structure and Construction',
      '0', // Same new question (will be linked)
      'Care este starea generala a structurii cladiri?',
      'What is the general condition of the building structure?',
      '8',
      '0', // New answer
      'Buna - fisuri minore, fara impact structural',
      'Good - minor cracks, no structural impact',
      '7'
    ]);
  }

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 }, // property_type_id
    { wch: 12 }, // category_id
    { wch: 25 }, // category_name_ro
    { wch: 25 }, // category_name_en
    { wch: 12 }, // question_id
    { wch: 50 }, // question_ro
    { wch: 50 }, // question_en
    { wch: 15 }, // question_weight
    { wch: 10 }, // answer_id
    { wch: 40 }, // answer_ro
    { wch: 40 }, // answer_en
    { wch: 15 }  // answer_weight
  ];
  worksheet['!cols'] = columnWidths;

  // Style the header row
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "366092" } },
    alignment: { horizontal: "center", vertical: "center" }
  };

  const instructionStyle = {
    font: { italic: true, color: { rgb: "666666" } },
    fill: { fgColor: { rgb: "F0F0F0" } },
    alignment: { horizontal: "left", vertical: "center" }
  };

  // Apply styles to header row (row 1)
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:L1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: '', t: 's' };
    worksheet[cellAddress].s = headerStyle;
  }

  // Apply styles to instruction row (row 2)
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
    if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: '', t: 's' };
    worksheet[cellAddress].s = instructionStyle;
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions Template');

  // Create additional info sheet
  const infoData = [
    ['ID-Based Questions Import Template'],
    [''],
    ['Instructions:'],
    ['1. Use IDs for precise data management and conflict resolution'],
    ['2. property_type_id: Use existing property type ID'],
    ['3. category_id: 0 = new category, existing ID = update category'],
    ['4. question_id: 0 = new question, existing ID = update question'],
    ['5. answer_id: 0 = new answer, existing ID = update answer'],
    ['6. Question Weight: 1-10 (10 = most important)'],
    ['7. Answer Weight: 1-10 (10 = best answer, 1 = worst answer)'],
    ['8. Romanian text is required, English is optional'],
    ['9. New entries with ID=0 will get real IDs assigned automatically'],
    ['10. Save as .xlsx file and upload'],
    [''],
    ['Property Types Available:'],
    [propertyTypesList],
    [''],
    ['ID=0 Smart Linking:'],
    ['• Multiple rows with same category_name_ro and ID=0 → same category'],
    ['• Multiple rows with same question_ro and ID=0 → same question'],
    ['• Each answer gets a unique ID even if answer_id=0'],
    [''],
    ['Benefits of ID-Based Approach:'],
    ['✅ No mismatches or duplicates on re-import'],
    ['✅ Faster validation on upload'],
    ['✅ Easier merging or updating of partial data'],
    ['✅ Consistent referential integrity']
  ];

  const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
  
  // Style the info sheet
  const titleStyle = {
    font: { bold: true, size: 16, color: { rgb: "366092" } },
    alignment: { horizontal: "center" }
  };

  const sectionStyle = {
    font: { bold: true, color: { rgb: "366092" } }
  };

  // Apply title style
  if (infoSheet['A1']) infoSheet['A1'].s = titleStyle;

  // Apply section styles
  ['A3', 'A15', 'A18', 'A23'].forEach(cell => {
    if (infoSheet[cell]) infoSheet[cell].s = sectionStyle;
  });

  // Set column width for info sheet
  infoSheet['!cols'] = [{ wch: 60 }];

  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Instructions');

  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Create filename with current date
  const currentDate = new Date().toISOString().split('T')[0];
  const filename = `questions-import-template-id-based-${currentDate}.xlsx`;

  // Return Excel file
  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length.toString(),
    },
  });
}
