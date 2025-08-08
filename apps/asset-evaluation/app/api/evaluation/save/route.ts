import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { saveEvaluationResults } from "@/lib/evaluation-server";
import type {
  PropertyTypeWithCategories,
  UserAnswer,
} from "@/lib/evaluation-utils";
import { calculateEvaluationResult } from "@/lib/evaluation-utils";

export async function POST(request: NextRequest) {
  let session: any = null;
  let userAnswers: UserAnswer[] = [];
  let propertyData: PropertyTypeWithCategories | null = null;

  try {
    // Get the current user session
    session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse the request body
    const body = await request.json();
    const requestData: {
      userAnswers: UserAnswer[];
      propertyData: PropertyTypeWithCategories;
      propertyInfo?: {
        name?: string;
        location?: string;
        surface?: number;
        floors?: string;
        constructionYear?: number;
      };
    } = body;

    userAnswers = requestData.userAnswers;
    propertyData = requestData.propertyData;
    const propertyInfo = requestData.propertyInfo;

    // Debug logging
    console.log("📝 Saving evaluation with propertyInfo:", propertyInfo);

    // Validate required data
    if (
      !userAnswers ||
      !Array.isArray(userAnswers) ||
      userAnswers.length === 0
    ) {
      return NextResponse.json(
        { error: "User answers are required" },
        { status: 400 },
      );
    }

    if (!propertyData || !propertyData.id) {
      return NextResponse.json(
        { error: "Property data is required" },
        { status: 400 },
      );
    }

    // Calculate evaluation result
    const evaluationResult = calculateEvaluationResult(
      userAnswers,
      propertyData,
    );

    // Save to database
    const evaluationSessionId = await saveEvaluationResults(
      session.user.id,
      propertyData.id,
      userAnswers,
      evaluationResult,
      propertyInfo,
    );

    return NextResponse.json({
      success: true,
      evaluationSessionId,
      result: evaluationResult,
    });
  } catch (error) {
    console.error("Error saving evaluation results:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to save evaluation results";
    let statusCode = 500;
    let details = error instanceof Error ? error.message : "Unknown error";

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("foreign key constraint") ||
        message.includes("violates foreign key")
      ) {
        if (message.includes("property_type_id")) {
          errorMessage = "Invalid property type";
          details =
            "The selected property type does not exist in the database. Please refresh the page and try again.";
          statusCode = 400;
        } else if (message.includes("user_id")) {
          errorMessage = "User authentication error";
          details = "Your user session is invalid. Please log in again.";
          statusCode = 401;
        } else {
          errorMessage = "Data integrity error";
          details = "Please check that all referenced data exists.";
          statusCode = 400;
        }
      } else if (
        message.includes("connect") ||
        message.includes("econnrefused")
      ) {
        errorMessage = "Database connection error";
        details = "Unable to connect to the database. Please try again later.";
        statusCode = 503;
      } else if (
        message.includes("authentication") ||
        message.includes("unauthorized")
      ) {
        errorMessage = "Authentication required";
        details = "Please log in to save evaluation results.";
        statusCode = 401;
      } else if (
        message.includes("relation") ||
        message.includes("does not exist")
      ) {
        errorMessage = "Database configuration error";
        details = "Database tables are missing. Please contact support.";
        statusCode = 500;
      }
    }

    // Log detailed error for debugging
    console.error("Detailed error info:", {
      originalError: error,
      userAnswersCount: userAnswers?.length,
      propertyTypeId: propertyData?.id,
      userId: session?.user?.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: errorMessage, details },
      { status: statusCode },
    );
  }
}
