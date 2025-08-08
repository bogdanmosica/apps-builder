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
import { Separator } from "@workspace/ui/components/separator";
import { CheckCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { EvaluationQuestionWithChoices } from "@/lib/evaluation/service";

export default function EvaluationPage() {
  const [questions, setQuestions] = useState<EvaluationQuestionWithChoices[]>(
    [],
  );
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState<number>(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/evaluation/questions");

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(
        data.filter((q: EvaluationQuestionWithChoices) => q.isActive),
      );
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load evaluation questions");
      toast.error("Failed to load evaluation questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: number, choiceId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    let totalWeight = 0;

    questions.forEach((question) => {
      if (question.isActive && selectedAnswers[question.id]) {
        const selectedChoice = question.answerChoices.find(
          (choice) => choice.id === selectedAnswers[question.id],
        );
        if (selectedChoice) {
          totalScore += (selectedChoice.answerValue * question.weight) / 100;
          totalWeight += question.weight;
        }
      }
    });

    const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    setEvaluationScore(finalScore);
    setShowResults(true);
  };

  const resetEvaluation = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setEvaluationScore(0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent Property";
    if (score >= 60) return "Good Property";
    if (score >= 40) return "Average Property";
    return "Below Average Property";
  };

  const isEvaluationComplete = () => {
    return questions.every(
      (question) => !question.isActive || selectedAnswers[question.id],
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Property Evaluation</h1>
        <p className="text-gray-600">
          Answer the following questions to evaluate this property
        </p>
      </div>

      {/* Results Card */}
      {showResults && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Evaluation Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div
                className={`text-4xl font-bold ${getScoreColor(evaluationScore)}`}
              >
                {evaluationScore.toFixed(1)}%
              </div>
              <div
                className={`text-lg font-medium ${getScoreColor(evaluationScore)}`}
              >
                {getScoreDescription(evaluationScore)}
              </div>
              <p className="text-gray-600 mt-4">
                Based on your responses across all evaluation criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <Card key={question.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {question.question}
                  </CardTitle>
                  {question.description && (
                    <CardDescription>{question.description}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Badge variant="secondary">{question.category}</Badge>
                  {selectedAnswers[question.id] && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Answered
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.answerChoices
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((choice) => {
                    const isSelected =
                      selectedAnswers[question.id] === choice.id;

                    return (
                      <div
                        key={choice.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          handleSelectAnswer(question.id, choice.id)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={isSelected}
                            onChange={() =>
                              handleSelectAnswer(question.id, choice.id)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="font-medium">
                            {choice.answerText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={calculateScore}
          disabled={!isEvaluationComplete()}
          size="lg"
          className="px-8"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Evaluation
        </Button>

        {(Object.keys(selectedAnswers).length > 0 || showResults) && (
          <Button
            onClick={resetEvaluation}
            variant="outline"
            size="lg"
            className="px-8"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="text-center text-sm text-gray-500">
        {Object.keys(selectedAnswers).length} of {questions.length} questions
        answered
      </div>
    </div>
  );
}
