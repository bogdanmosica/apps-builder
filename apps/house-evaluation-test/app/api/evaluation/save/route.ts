import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  type PropertyEvaluationData,
  savePropertyEvaluation,
} from "@/lib/evaluation/service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      propertyId,
      evaluations,
    }: {
      propertyId: number;
      evaluations: PropertyEvaluationData[];
    } = body;

    if (!propertyId || !evaluations || !Array.isArray(evaluations)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    await savePropertyEvaluation(propertyId, evaluations, session.user.id);

    // Get the updated quality score
    const scoreResponse = await fetch(
      `${request.nextUrl.origin}/api/evaluation/score/${propertyId}`,
    );
    const scoreData = await scoreResponse.json();

    return NextResponse.json(scoreData);
  } catch (error) {
    console.error("Error saving evaluation:", error);
    return NextResponse.json(
      { error: "Failed to save evaluation" },
      { status: 500 },
    );
  }
}
