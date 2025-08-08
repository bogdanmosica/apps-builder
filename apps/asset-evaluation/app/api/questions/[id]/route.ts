import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { questions } from "@/lib/db/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid question ID" },
        { status: 400 },
      );
    }

    const question = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (question.length === 0) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: question[0],
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch question" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();

    // Only admin/owner users can update questions
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid question ID" },
        { status: 400 },
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

    // Check if question exists
    const existingQuestion = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (existingQuestion.length === 0) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 },
      );
    }

    // Update question
    const [updatedQuestion] = await db
      .update(questions)
      .set({
        text_ro: body.text_ro.trim(),
        text_en: body.text_en ? body.text_en.trim() : null,
        weight: body.weight,
        categoryId: body.categoryId,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update question" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();

    // Only admin/owner users can delete questions
    if (!user || !["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid question ID" },
        { status: 400 },
      );
    }

    // Check if question exists
    const existingQuestion = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (existingQuestion.length === 0) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 },
      );
    }

    // TODO: Check if there are any answers or evaluations using this question
    // and possibly prevent deletion if it's in use

    // Delete question
    await db.delete(questions).where(eq(questions.id, id));

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete question" },
      { status: 500 },
    );
  }
}
