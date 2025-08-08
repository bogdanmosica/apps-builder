import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { and, eq } from "drizzle-orm";
import {
  ArrowLeft,
  BarChart3,
  Building,
  Calendar,
  Home,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import {
  answers,
  evaluationSessions,
  questionCategories,
  questions,
  userEvaluationAnswers,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface EvaluationDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EvaluationDetailsPage({
  params,
}: EvaluationDetailsPageProps) {
  const user = await getUser();
  if (!user) {
    return notFound();
  }

  const resolvedParams = await params;
  const evaluationId = parseInt(resolvedParams.id);
  if (isNaN(evaluationId)) {
    return notFound();
  }

  // Fetch evaluation details
  const evaluation = await db.query.evaluationSessions.findFirst({
    where: and(
      eq(evaluationSessions.id, evaluationId),
      eq(evaluationSessions.userId, user.id),
    ),
    with: {
      propertyType: true,
      userAnswers: {
        with: {
          question: {
            with: {
              category: true,
            },
          },
          answer: true,
        },
      },
    },
  });

  if (!evaluation) {
    return notFound();
  }

  const getPropertyIcon = (propertyType: string) => {
    switch (propertyType.toLowerCase()) {
      case "house":
      case "casa":
        return <Home className="w-6 h-6" />;
      case "apartment":
      case "apartament":
        return <Building className="w-6 h-6" />;
      default:
        return <MapPin className="w-6 h-6" />;
    }
  };

  const getStarRating = (percentage: number) => {
    const stars = Math.round((percentage / 100) * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "expert":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "novice":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Group answers by category
  const answersByCategory = evaluation.userAnswers.reduce(
    (acc: Record<string, typeof evaluation.userAnswers>, userAnswer: any) => {
      const categoryName = userAnswer.question.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(userAnswer);
      return acc;
    },
    {} as Record<string, typeof evaluation.userAnswers>,
  );

  return (
    <div className="min-h-screen bg-bg-shell">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-bg-base rounded-lg text-primary">
                {getPropertyIcon(evaluation.propertyType.name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-base">
                  {evaluation.propertyType.name} Evaluation #{evaluation.id}
                </h1>
                <p className="text-text-muted">
                  Completed on{" "}
                  {new Date(evaluation.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-4">
                {evaluation.percentage}%
              </div>
              <div className="flex justify-center gap-1 mb-4">
                {getStarRating(evaluation.percentage)}
              </div>
              <Badge
                className={`${getBadgeColor(evaluation.level)} text-lg px-4 py-2 font-semibold`}
              >
                {evaluation.level} Level
              </Badge>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-base">
                    {evaluation.totalScore}
                  </div>
                  <div className="text-sm text-text-muted">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-base">
                    {evaluation.maxPossibleScore}
                  </div>
                  <div className="text-sm text-text-muted">Maximum Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-base">
                    {evaluation.completionRate}%
                  </div>
                  <div className="text-sm text-text-muted">Completion Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results by Category */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-text-base">
            Detailed Results
          </h2>

          {Object.entries(answersByCategory).map(
            ([categoryName, categoryAnswers]) => (
              <Card key={categoryName}>
                <CardHeader>
                  <CardTitle className="text-lg">{categoryName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(categoryAnswers as any[]).map((userAnswer: any) => (
                      <div
                        key={userAnswer.id}
                        className="border-l-4 border-primary/20 pl-4"
                      >
                        <div className="font-medium text-text-base mb-2">
                          {userAnswer.question.text}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-text-muted">
                            Your answer:{" "}
                            <span className="font-medium text-text-base">
                              {userAnswer.answer.text}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-primary">
                              {userAnswer.pointsEarned}
                            </span>
                            <span className="text-text-muted">
                              {" "}
                              / {userAnswer.questionWeight * 5} points
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/test-evaluation" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary-dark">
              Start New Evaluation
            </Button>
          </Link>
          <Button variant="outline" className="flex-1">
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}
