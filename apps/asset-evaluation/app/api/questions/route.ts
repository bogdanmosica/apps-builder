import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { questions } from "@/lib/db/schema";

export async function GET() {
  try {
    const user = await getUser();

    // Only admin and owner users can view questions
    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const allQuestions = await db
      .select()
      .from(questions)
      .orderBy(asc(questions.createdAt));

    return NextResponse.json({
      success: true,
      data: allQuestions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    // Only admin/owner users can create questions
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate request body
    if (!body.text_ro || typeof body.text_ro !== "string") {
      return NextResponse.json(
        { success: false, error: "Question text (Romanian) is required" },
        { status: 400 },
      );
    }

    if (
      typeof body.weight !== "number" ||
      body.weight < 1 ||
      body.weight > 10
    ) {
      return NextResponse.json(
        { success: false, error: "Weight must be a number between 1 and 10" },
        { status: 400 },
      );
    }

    if (typeof body.categoryId !== "number") {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 },
      );
    }

    // Create new question
    const [newQuestion] = await db
      .insert(questions)
      .values({
        text_ro: body.text_ro.trim(),
        text_en: body.text_en ? body.text_en.trim() : null,
        weight: body.weight,
        categoryId: body.categoryId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newQuestion,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create question" },
      { status: 500 },
    );
  }
}
