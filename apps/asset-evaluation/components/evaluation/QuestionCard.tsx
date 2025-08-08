"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Progress } from "@workspace/ui/components/progress";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Home,
  Star,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  type CategoryWithQuestions,
  getAnswerText,
  getCategoryName,
  getQuestionText,
  type QuestionWithAnswers,
  trackEvaluationEvent,
  type UserAnswer,
} from "@/lib/evaluation-utils";

interface QuestionCardProps {
  question: QuestionWithAnswers;
  category: CategoryWithQuestions;
  currentQuestionIndex: number;
  totalQuestions: number;
  userAnswer?: UserAnswer;
  onAnswer: (answer: UserAnswer) => void;
  onNext: () => void;
  onBack: () => void;
  onRestart: () => void;
  onSkip: () => void;
  canGoNext: boolean;
  currentScore: number;
  maxPossibleScore: number;
  isLastQuestion?: boolean;
}

export default function QuestionCard({
  question,
  category,
  currentQuestionIndex,
  totalQuestions,
  userAnswer,
  onAnswer,
  onNext,
  onBack,
  onRestart,
  onSkip,
  canGoNext,
  currentScore,
  maxPossibleScore,
  isLastQuestion = false,
}: QuestionCardProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as "ro" | "en";
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(
    userAnswer?.answerId || null,
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [justAnswered, setJustAnswered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentLevel = getCurrentLevel(currentScore, maxPossibleScore);

  useEffect(() => {
    setSelectedAnswerId(userAnswer?.answerId || null);
    setShowFeedback(false);
    setJustAnswered(false);
    setIsTransitioning(false);
  }, [question.id, userAnswer]);

  // Focus the Next/Finish button when an answer is selected
  useEffect(() => {
    if (selectedAnswerId && nextButtonRef.current) {
      setTimeout(() => {
        nextButtonRef.current?.focus();
      }, 100);
    }
  }, [selectedAnswerId]);

  // Focus the FINISH button immediately on the last question
  useEffect(() => {
    if (isLastQuestion && nextButtonRef.current && canGoNext) {
      setTimeout(() => {
        nextButtonRef.current?.focus();
      }, 300); // Small delay to ensure the component is fully rendered
    }
  }, [isLastQuestion, canGoNext]);

  useEffect(() => {
    trackEvaluationEvent("question_viewed", {
      questionId: question.id,
      categoryId: category.id,
      categoryName: getCategoryName(category, currentLanguage),
      questionIndex: currentQuestionIndex,
      totalQuestions,
      progress: Math.round(progress),
    });
  }, [
    question.id,
    category.id,
    getCategoryName(category, currentLanguage),
    currentQuestionIndex,
    totalQuestions,
    progress,
    currentLanguage,
  ]);

  const handleAnswerSelect = (answerId: string) => {
    const answerIdNum = parseInt(answerId);
    const selectedAnswer = question.answers.find((a) => a.id === answerIdNum);

    if (!selectedAnswer) return;

    setSelectedAnswerId(answerIdNum);
    setJustAnswered(true);
    setShowFeedback(true);

    const userAnswerData: UserAnswer = {
      questionId: question.id,
      answerId: answerIdNum,
      answerWeight: selectedAnswer.weight,
      questionWeight: question.weight,
    };

    // Calculate points earned
    const pointsEarned = selectedAnswer.weight * question.weight;
    const maxPoints =
      Math.max(...question.answers.map((a) => a.weight)) * question.weight;
    const pointsPercentage = (pointsEarned / maxPoints) * 100;

    // Show instant feedback
    showAnswerFeedback(selectedAnswer, pointsEarned, pointsPercentage);

    // Track the answer
    trackEvaluationEvent("question_answered", {
      questionId: question.id,
      answerId: answerIdNum,
      answerWeight: selectedAnswer.weight,
      questionWeight: question.weight,
      pointsEarned,
      maxPoints,
      pointsPercentage: Math.round(pointsPercentage),
      categoryId: category.id,
    });

    onAnswer(userAnswerData);

    // Auto-advance after feedback (or immediately if last question)
    const delay = isLastQuestion ? 500 : 800;

    setTimeout(() => {
      setIsTransitioning(true);
    }, delay - 200); // Start loading animation 200ms before transition

    setTimeout(() => {
      onNext();
    }, delay);
  };

  const showAnswerFeedback = (
    answer: any,
    points: number,
    percentage: number,
  ) => {
    let message = "";
    const icon = <CheckCircle2 className="w-5 h-5" />;

    if (percentage >= 80) {
      message = `🎉 Excellent! +${points.toFixed(1)} points`;
      toast.success(message, {
        icon: icon,
        description: "Great choice for property value!",
        duration: 1500,
      });
    } else if (percentage >= 50) {
      message = `👍 Good choice! +${points.toFixed(1)} points`;
      toast.info(message, {
        icon: <Star className="w-5 h-5" />,
        description: "Solid answer, room for improvement.",
        duration: 1500,
      });
    } else {
      message = `⚠️ Could be better. +${points.toFixed(1)} points`;
      toast.warning(message, {
        icon: <AlertTriangle className="w-5 h-5" />,
        description: "Consider this for future properties.",
        duration: 1500,
      });
    }
  };

  const getAnswerFeedbackColor = (answerWeight: number) => {
    const maxWeight = Math.max(...question.answers.map((a) => a.weight));
    const percentage = (answerWeight / maxWeight) * 100;

    if (percentage >= 80)
      return "border-green-500 bg-green-50 dark:bg-green-950";
    if (percentage >= 50)
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950";
    return "border-red-500 bg-red-50 dark:bg-red-950";
  };

  const getAnswerIcon = (answerWeight: number) => {
    const maxWeight = Math.max(...question.answers.map((a) => a.weight));
    const percentage = (answerWeight / maxWeight) * 100;

    if (percentage >= 80)
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (percentage >= 50) return <Star className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 flex flex-col p-4">
      {/* Header with Progress */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-10 w-10"
              title="Back to Home"
            >
              <Link href="/">
                <Home className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRestart}
              className="h-10 w-10"
              title="Start Over"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              <p className="text-xs text-muted-foreground">
                {getCategoryName(category, currentLanguage)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                Score: {currentScore.toFixed(1)}
              </p>
              <Badge variant="secondary" className="text-xs">
                {currentLevel.label} {currentLevel.icon}
              </Badge>
            </div>
          </div>
        </div>

        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {Math.round(progress)}% Complete
        </p>
      </div>

      {/* Question Card */}
      <div className="flex-1 w-full max-w-4xl mx-auto">
        <Card className="shadow-2xl border-2 relative">
          {isTransitioning && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-3 text-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                <span className="text-sm font-medium">
                  Loading next question...
                </span>
              </div>
            </div>
          )}
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Badge variant="outline" className="text-sm">
                Rating weight întrebare: {Math.round(question.weight)}
              </Badge>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Max Points</p>
                <p className="text-sm font-bold">
                  {(
                    Math.max(...question.answers.map((a) => a.weight)) *
                    question.weight
                  ).toFixed(1)}
                </p>
              </div>
            </div>

            <CardTitle className="text-xl md:text-2xl leading-relaxed text-foreground">
              {getQuestionText(question, currentLanguage)}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Answer Options */}
            <RadioGroup
              value={selectedAnswerId?.toString() || ""}
              onValueChange={handleAnswerSelect}
              className="space-y-4"
            >
              {question.answers.map((answer, index) => {
                const isSelected = selectedAnswerId === answer.id;
                const showAnswerFeedback = showFeedback && isSelected;

                return (
                  <div key={answer.id} className="space-y-2">
                    <Label
                      htmlFor={`answer-${answer.id}`}
                      className={`
                        flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer
                        transition-all duration-200 hover:border-primary/50 hover:bg-accent/50
                        ${isSelected ? "border-primary bg-primary/5" : "border-border"}
                        ${showAnswerFeedback ? getAnswerFeedbackColor(answer.weight) : ""}
                      `}
                    >
                      <RadioGroupItem
                        value={answer.id.toString()}
                        id={`answer-${answer.id}`}
                        className="flex-shrink-0"
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium text-foreground">
                            {getAnswerText(answer, currentLanguage)}
                          </span>

                          <div className="flex items-center gap-2">
                            {showAnswerFeedback && getAnswerIcon(answer.weight)}
                            <Badge variant="secondary" className="text-xs">
                              {answer.weight} pts
                            </Badge>
                          </div>
                        </div>

                        {showAnswerFeedback && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              Points earned:{" "}
                              {(answer.weight * question.weight).toFixed(1)} /{" "}
                              {(
                                Math.max(
                                  ...question.answers.map((a) => a.weight),
                                ) * question.weight
                              ).toFixed(1)}
                            </p>
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={onSkip}
                className="flex items-center gap-2"
              >
                Skip Question
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onRestart}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Start Over
                </Button>

                <Button
                  ref={nextButtonRef}
                  onClick={onNext}
                  disabled={!canGoNext}
                  className={`flex items-center gap-2 ${
                    isLastQuestion
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ring-2 ring-green-500/20 hover:ring-green-500/40"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isLastQuestion ? "Finish" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Up Notification */}
      {justAnswered && currentLevel.isNewLevel && (
        <div className="fixed bottom-6 right-6">
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 shadow-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="w-6 h-6" />
              <div>
                <p className="font-bold">Level Up!</p>
                <p className="text-sm opacity-90">
                  You're now a {currentLevel.label}!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper function to determine current level
function getCurrentLevel(currentScore: number, maxScore: number) {
  const percentage = maxScore > 0 ? (currentScore / maxScore) * 100 : 0;

  if (percentage >= 90) {
    return {
      label: "Property Master",
      icon: "👑",
      color: "bg-yellow-500",
      isNewLevel: false,
    };
  } else if (percentage >= 60) {
    return {
      label: "Property Expert",
      icon: "🏆",
      color: "bg-green-500",
      isNewLevel: false,
    };
  } else if (percentage >= 30) {
    return {
      label: "Property Learner",
      icon: "⭐",
      color: "bg-blue-500",
      isNewLevel: false,
    };
  }

  return {
    label: "Beginner",
    icon: "🏠",
    color: "bg-gray-500",
    isNewLevel: false,
  };
}
