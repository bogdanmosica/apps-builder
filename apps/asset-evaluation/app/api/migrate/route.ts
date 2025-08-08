import { sql } from "drizzle-orm";
import fs from "fs";
import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import { db } from "../../../lib/db/drizzle";

export async function POST(request: NextRequest) {
  try {
    console.log("Starting migration process...");

    // Read the migration file
    const migrationPath = path.join(
      process.cwd(),
      "lib/db/migrations/0012_dark_wildside.sql",
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("Migration SQL:", migrationSQL);

    // Execute each line of the migration
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log("Executing:", statement);
      await db.execute(sql.raw(statement));
    }

    // Verify the columns exist
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'evaluation_sessions' 
      AND column_name IN ('property_name', 'property_location', 'property_surface', 'property_floors', 'property_construction_year')
      ORDER BY column_name
    `);

    console.log("Found columns:", result.rows);

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      columns: result.rows,
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
