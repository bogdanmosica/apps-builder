import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import {
  answers,
  propertyTypes,
  questionCategories,
  questions,
} from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const propertyTypeId = url.searchParams.get("propertyTypeId");
    const format = url.searchParams.get("format") || "excel"; // 'excel' or 'markdown'
    const type = url.searchParams.get("type") || "template"; // 'template' or 'export'

    if (format === "markdown") {
      return await generateMarkdownTemplate(propertyTypeId, type);
    } else {
      return await generateExcelTemplate(propertyTypeId, type);
    }
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function generateExcelTemplate(
  propertyTypeId: string | null,
  type: string,
) {
  const workbook = XLSX.utils.book_new();

  if (type === "export" && propertyTypeId) {
    // Export existing data with IDs
    return await generateDataExport(propertyTypeId);
  }

  // Get property type info for context
  let selectedPropertyType = null;
  const allPropertyTypes = await db.select().from(propertyTypes);

  if (propertyTypeId) {
    selectedPropertyType = allPropertyTypes.find(
      (pt: any) => pt.id === parseInt(propertyTypeId),
    );
  }

  // Template headers
  const headers = [
    "property_type_id",
    "category_id",
    "category_name_ro",
    "category_name_en",
    "question_id",
    "question_ro",
    "question_en",
    "question_weight",
    "answer_id",
    "answer_ro",
    "answer_en",
    "answer_weight",
  ];

  // Instructions row
  const instructions = [
    selectedPropertyType
      ? selectedPropertyType.id.toString()
      : "Property Type ID (required)",
    "0 for new, existing ID to update",
    "Category name in Romanian (required)",
    "Category name in English (optional)",
    "0 for new, existing ID to update",
    "Question text in Romanian (required)",
    "Question text in English (optional)",
    "Weight 1-10 (importance)",
    "0 for new, existing ID to update",
    "Answer text in Romanian (required)",
    "Answer text in English (optional)",
    "Weight 1-10 (answer value)",
  ];

  let templateData = [headers, instructions];

  // Add existing data if property type is selected
  if (selectedPropertyType) {
    const existingData = await getExistingDataForPropertyType(
      selectedPropertyType.id,
    );
    templateData = [...templateData, ...existingData];
  } else {
    // Add sample rows
    templateData.push([
      allPropertyTypes.length > 0 ? allPropertyTypes[0].id.toString() : "1",
      "0",
      "Utilități",
      "Utilities",
      "0",
      "Este terenul racordat la apă, canal, curent și gaz?",
      "Is the land connected to water, sewage, electricity and gas?",
      "10",
      "0",
      "Da, integral racordat",
      "Yes, fully connected",
      "10",
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths
  worksheet["!cols"] = [
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
    { wch: 15 }, // answer_weight
  ];

  // Style header and instruction rows
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "366092" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const instructionStyle = {
    font: { italic: true, color: { rgb: "666666" } },
    fill: { fgColor: { rgb: "F0F0F0" } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  // Apply styles
  for (let col = 0; col < headers.length; col++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
    const instrCell = XLSX.utils.encode_cell({ r: 1, c: col });

    if (!worksheet[headerCell]) worksheet[headerCell] = { v: "", t: "s" };
    if (!worksheet[instrCell]) worksheet[instrCell] = { v: "", t: "s" };

    worksheet[headerCell].s = headerStyle;
    worksheet[instrCell].s = instructionStyle;
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Questions Template");

  // Add instructions sheet
  const instructionsSheet = createInstructionsSheet(
    allPropertyTypes,
    selectedPropertyType,
  );
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  const filename = selectedPropertyType
    ? `questions-template-${selectedPropertyType.name_ro.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.xlsx`
    : `questions-template-${new Date().toISOString().split("T")[0]}.xlsx`;

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": excelBuffer.length.toString(),
    },
  });
}

async function generateMarkdownTemplate(
  propertyTypeId: string | null,
  type: string,
) {
  let selectedPropertyType = null;
  const allPropertyTypes = await db.select().from(propertyTypes);

  if (propertyTypeId) {
    selectedPropertyType = allPropertyTypes.find(
      (pt: any) => pt.id === parseInt(propertyTypeId),
    );
  }

  const markdown = `# Questions Import Template

## Property Type: ${selectedPropertyType ? selectedPropertyType.name_ro : "All Types"}

### Instructions:
- Use ID = 0 for new entries
- Existing IDs will update those entries
- Romanian text is required, English is optional
- Weights should be 1-10

### Available Property Types:
${allPropertyTypes.map((pt: any) => `- ID: ${pt.id} - ${pt.name_ro}`).join("\n")}

### Template Format:

\`\`\`csv
property_type_id,category_id,category_name_ro,category_name_en,question_id,question_ro,question_en,question_weight,answer_id,answer_ro,answer_en,answer_weight
${selectedPropertyType ? selectedPropertyType.id : "1"},0,Utilități,Utilities,0,Este terenul racordat la apă canal curent și gaz?,Is the land connected to water sewage electricity and gas?,10,0,Da integral racordat,Yes fully connected,10
${selectedPropertyType ? selectedPropertyType.id : "1"},0,Utilități,Utilities,0,Este terenul racordat la apă canal curent și gaz?,Is the land connected to water sewage electricity and gas?,10,0,Parțial racordat,Partially connected,5
\`\`\`

### Notes:
- Save this as a CSV file for import
- Multiple answers for the same question should use the same question details but different answer details
- Category names will be linked automatically when category_id = 0 and names match
`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="questions-template-${new Date().toISOString().split("T")[0]}.md"`,
    },
  });
}

async function generateDataExport(propertyTypeId: string) {
  const exportData = await getExistingDataForPropertyType(
    parseInt(propertyTypeId),
  );

  const workbook = XLSX.utils.book_new();

  const headers = [
    "property_type_id",
    "category_id",
    "category_name_ro",
    "category_name_en",
    "question_id",
    "question_ro",
    "question_en",
    "question_weight",
    "answer_id",
    "answer_ro",
    "answer_en",
    "answer_weight",
  ];

  const worksheetData = [headers, ...exportData];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
    { wch: 25 },
    { wch: 12 },
    { wch: 50 },
    { wch: 50 },
    { wch: 15 },
    { wch: 10 },
    { wch: 40 },
    { wch: 40 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Questions Export");

  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  const filename = `questions-export-property-${propertyTypeId}-${new Date().toISOString().split("T")[0]}.xlsx`;

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": excelBuffer.length.toString(),
    },
  });
}

async function getExistingDataForPropertyType(propertyTypeId: number) {
  const categories = await db
    .select()
    .from(questionCategories)
    .where(eq(questionCategories.propertyTypeId, propertyTypeId));

  const data = [];

  for (const category of categories) {
    const categoryQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.categoryId, category.id));

    for (const question of categoryQuestions) {
      const questionAnswers = await db
        .select()
        .from(answers)
        .where(eq(answers.questionId, question.id));

      for (const answer of questionAnswers) {
        data.push([
          propertyTypeId.toString(),
          category.id.toString(),
          category.name_ro,
          category.name_en || category.name_ro,
          question.id.toString(),
          question.text_ro,
          question.text_en || question.text_ro,
          (question.weight || 5).toString(),
          answer.id.toString(),
          answer.text_ro,
          answer.text_en || answer.text_ro,
          (answer.weight || 5).toString(),
        ]);
      }
    }
  }

  return data;
}

function createInstructionsSheet(
  allPropertyTypes: any[],
  selectedPropertyType: any,
) {
  const instructions = [
    ["Questions Import/Export Template Instructions"],
    [""],
    ["COLUMN DESCRIPTIONS:"],
    ["property_type_id", "ID of the property type (required)"],
    ["category_id", "0 = new category, existing ID = update category"],
    ["category_name_ro", "Category name in Romanian (required)"],
    ["category_name_en", "Category name in English (optional)"],
    ["question_id", "0 = new question, existing ID = update question"],
    ["question_ro", "Question text in Romanian (required)"],
    ["question_en", "Question text in English (optional)"],
    ["question_weight", "Question importance weight (1-10)"],
    ["answer_id", "0 = new answer, existing ID = update answer"],
    ["answer_ro", "Answer text in Romanian (required)"],
    ["answer_en", "Answer text in English (optional)"],
    ["answer_weight", "Answer value weight (1-10)"],
    [""],
    ["AVAILABLE PROPERTY TYPES:"],
    ...allPropertyTypes.map((pt) => [
      `ID: ${pt.id}`,
      pt.name_ro,
      pt.name_en || "",
    ]),
    [""],
    ["SMART LINKING (ID = 0):"],
    ["• Categories with same name_ro and ID=0 → linked to same category"],
    ["• Questions with same text_ro and ID=0 → linked to same question"],
    ["• Each answer gets unique ID even if answer_id=0"],
    [""],
    ["IMPORT MODES:"],
    ["Replace Mode: Deletes existing data before import"],
    ["Append Mode: Adds to existing data (default)"],
    [""],
    ["VALIDATION RULES:"],
    ["• property_type_id must exist"],
    ["• Romanian text fields are required"],
    ["• Weights must be 1-10"],
    ["• File formats: .xlsx, .xls, .csv"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(instructions);
  worksheet["!cols"] = [{ wch: 30 }, { wch: 40 }, { wch: 20 }];

  return worksheet;
}
