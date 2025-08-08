import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";

export async function GET() {
  try {
    console.log("🔍 Checking database schema...");

    // Check if evaluation_sessions table exists and get its columns
    const tableCheck = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'evaluation_sessions' 
      ORDER BY ordinal_position
    `);

    const columns = tableCheck.rows || [];

    // Check if user_evaluation_answers table exists
    const answersTableCheck = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'user_evaluation_answers' 
      ORDER BY ordinal_position
    `);

    const answersColumns = answersTableCheck.rows || [];

    // Required columns for evaluation_sessions
    const requiredColumns = [
      "id",
      "user_id",
      "property_type_id",
      "property_name",
      "property_location",
      "property_surface",
      "property_floors",
      "property_construction_year",
      "total_score",
      "max_possible_score",
      "percentage",
      "level",
      "badge",
      "completion_rate",
      "completed_at",
      "created_at",
    ];

    const missingColumns = requiredColumns.filter(
      (col) => !columns.some((dbCol: any) => dbCol.column_name === col),
    );

    const result = {
      timestamp: new Date().toISOString(),
      evaluationSessionsTable: {
        exists: columns.length > 0,
        columnCount: columns.length,
        columns: columns.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === "YES",
        })),
        missingColumns,
      },
      userEvaluationAnswersTable: {
        exists: answersColumns.length > 0,
        columnCount: answersColumns.length,
        columns: answersColumns.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === "YES",
        })),
      },
      schemaStatus: missingColumns.length === 0 ? "COMPLETE" : "INCOMPLETE",
    };

    console.log("Schema check result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Schema check failed:", error);
    return NextResponse.json(
      {
        error: "Schema check failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
