"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { Textarea } from "@workspace/ui/components/textarea";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  EvaluationQuestionWithChoices,
  PropertyEvaluationData,
} from "@/lib/evaluation/service";

interface PropertyEvaluationFormProps {
  propertyId: number;
  propertyTitle: string;
  onComplete?: () => void;
}

export function PropertyEvaluationForm({
  propertyId,
  propertyTitle,
  onComplete,
}: PropertyEvaluationFormProps) {
  const [questions, setQuestions] = useState<EvaluationQuestionWithChoices[]>(
    [],
  );
  const [answers, setAnswers] = useState<
    Record<number, PropertyEvaluationData>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Group questions by category
  const questionsByCategory = questions.reduce(
    (acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    },
    {} as Record<string, EvaluationQuestionWithChoices[]>,
  );

  const categoryTitles: Record<string, string> = {
    location: "Location & Accessibility",
    condition: "Property Condition",
    efficiency: "Energy Efficiency",
    amenities: "Amenities & Features",
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/evaluation/questions");
      if (!response.ok) throw new Error("Failed to fetch questions");

      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load evaluation questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answerChoiceId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answerChoiceId,
      },
    }));
  };

  const handleCustomAnswerChange = (
    questionId: number,
    customAnswer: string,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        customAnswer,
      },
    }));
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    const unansweredQuestions = questions.filter((q) => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      toast.error(
        `Please answer all questions. ${unansweredQuestions.length} questions remaining.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const evaluationData = Object.values(answers);

      const response = await fetch("/api/evaluation/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          evaluations: evaluationData,
        }),
      });

      if (!response.ok) throw new Error("Failed to save evaluation");

      const result = await response.json();

      toast.success(
        `Evaluation Complete! Property rated ${result.starRating} stars with a score of ${result.totalScore}/100`,
      );

      onComplete?.();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error("Failed to save evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCompletionProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;
    return { answered: answeredQuestions, total: totalQuestions };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading evaluation questions...</span>
      </div>
    );
  }

  const progress = getCompletionProgress();
  const isComplete = progress.answered === progress.total;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            Property Evaluation
            {isComplete && <CheckCircle className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription>
            Evaluate "{propertyTitle}" to generate a quality rating
          </CardDescription>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(progress.answered / progress.total) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium">
              {progress.answered}/{progress.total}
            </span>
          </div>
        </CardHeader>
      </Card>

      {Object.entries(questionsByCategory).map(
        ([category, categoryQuestions]) => (
          <Card key={category} className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 p-4">
              <CardTitle className="text-base font-semibold">
                {categoryTitles[category] || category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6 bg-gray-50">
              {categoryQuestions.map((question) => (
                <div
                  key={question.id}
                  className="space-y-4 pb-5 border-b-2 border-gray-200 last:border-b-0 last:pb-0 bg-white p-4 rounded-lg shadow-sm"
                >
                  <div>
                    <Label className="text-base font-medium text-gray-900 leading-relaxed">
                      {question.question}
                    </Label>
                  </div>

                  {question.answerChoices.length > 0 ? (
                    <RadioGroup
                      value={
                        answers[question.id]?.answerChoiceId?.toString() || ""
                      }
                      onValueChange={(value) =>
                        handleAnswerChange(question.id, parseInt(value))
                      }
                      className="space-y-2"
                    >
                      {question.answerChoices.map((choice) => {
                        const isSelected =
                          answers[question.id]?.answerChoiceId === choice.id;
                        return (
                          <div
                            key={choice.id}
                            className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm ${
                              isSelected
                                ? "border-blue-500 bg-blue-100 ring-2 ring-blue-200 shadow-md"
                                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
                            }`}
                            onClick={() =>
                              handleAnswerChange(question.id, choice.id)
                            }
                          >
                            <RadioGroupItem
                              value={choice.id.toString()}
                              id={`q${question.id}-${choice.id}`}
                              className={`pointer-events-none w-5 h-5 ${isSelected ? "text-blue-600 border-blue-600" : "border-gray-400"}`}
                            />
                            <Label
                              htmlFor={`q${question.id}-${choice.id}`}
                              className="flex-1 cursor-pointer text-sm font-medium pointer-events-none"
                            >
                              {choice.answerText}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  ) : (
                    <Textarea
                      placeholder="Please provide your assessment..."
                      value={answers[question.id]?.customAnswer || ""}
                      onChange={(e) =>
                        handleCustomAnswerChange(question.id, e.target.value)
                      }
                      className="w-full min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ),
      )}

      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-blue-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {isComplete
                    ? "Evaluation Complete!"
                    : "Evaluation In Progress"}
                </p>
                <p className="text-sm text-gray-600">
                  {isComplete
                    ? "Ready to submit your property evaluation"
                    : `${progress.total - progress.answered} questions remaining`}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!isComplete || submitting}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Submit Evaluation"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
