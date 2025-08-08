"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { ArrowLeft, CheckCircle2, Home, Star, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  type CategoryWithQuestions,
  type EvaluationResult,
  getCategoryName,
  getPropertyTypeName,
  type PropertyTypeWithCategories,
  type QuestionWithAnswers,
  trackEvaluationEvent,
  type UserAnswer,
} from "@/lib/evaluation-utils";
import QuestionCard from "./QuestionCard";

interface PropertyInfo {
  name: string;
  location?: string;
  surface?: number;
  floors?: string;
  constructionYear?: number;
}

interface EvaluationQuestionsScreenProps {
  propertyData: PropertyTypeWithCategories;
  propertyInfo: PropertyInfo;
  onComplete: (result: EvaluationResult, userAnswers: UserAnswer[]) => void;
  onBack: () => void;
}

export default function EvaluationQuestionsScreen({
  propertyData,
  propertyInfo,
  onComplete,
  onBack,
}: EvaluationQuestionsScreenProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as "ro" | "en";

  // Flatten all questions from all categories
  const allQuestions: {
    question: QuestionWithAnswers;
    category: CategoryWithQuestions;
  }[] = [];
  console.log("🔍 EvaluationQuestionsScreen - propertyData:", propertyData);
  console.log(
    "🔍 EvaluationQuestionsScreen - categories count:",
    propertyData.categories.length,
  );
  propertyData.categories.forEach((category) => {
    console.log(
      "🔍 Processing category:",
      category.name_ro,
      "questions count:",
      category.questions.length,
    );
    category.questions.forEach((question) => {
      allQuestions.push({ question, category });
    });
  });
  console.log(
    "🔍 EvaluationQuestionsScreen - total flattened questions:",
    allQuestions.length,
  );

  const totalQuestions = allQuestions.length;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);

  // Calculate max possible score
  useEffect(() => {
    const maxScore = allQuestions.reduce((total, { question }) => {
      const maxAnswerWeight = Math.max(
        ...question.answers.map((a) => a.weight),
      );
      return total + maxAnswerWeight * question.weight;
    }, 0);
    setMaxPossibleScore(maxScore);
  }, [allQuestions]);

  const currentQuestionData = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswer = (answer: UserAnswer) => {
    // Update or add answer
    const existingAnswerIndex = userAnswers.findIndex(
      (a) => a.questionId === answer.questionId,
    );
    let newAnswers: UserAnswer[];

    if (existingAnswerIndex >= 0) {
      newAnswers = [...userAnswers];
      newAnswers[existingAnswerIndex] = answer;
    } else {
      newAnswers = [...userAnswers, answer];
    }

    setUserAnswers(newAnswers);

    // Update current score
    const newScore = newAnswers.reduce((total, ans) => {
      return total + ans.answerWeight * ans.questionWeight;
    }, 0);
    setCurrentScore(newScore);

    // Track answer event
    trackEvaluationEvent("question_answered", {
      questionId: answer.questionId,
      answerId: answer.answerId,
      questionIndex: currentQuestionIndex,
      totalQuestions,
      currentScore: newScore,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      trackEvaluationEvent("question_next", {
        questionIndex: currentQuestionIndex + 1,
        totalQuestions,
      });
    } else {
      // Complete evaluation
      handleCompleteEvaluation();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      trackEvaluationEvent("question_back", {
        questionIndex: currentQuestionIndex - 1,
        totalQuestions,
      });
    } else {
      onBack();
    }
  };

  const handleSkip = () => {
    trackEvaluationEvent("question_skipped", {
      questionIndex: currentQuestionIndex,
      totalQuestions,
    });
    handleNext();
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setCurrentScore(0);
    trackEvaluationEvent("evaluation_restarted", {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
      questionsAnswered: userAnswers.length,
      totalQuestions,
    });
  };

  const handleCompleteEvaluation = () => {
    const percentage =
      maxPossibleScore > 0 ? (currentScore / maxPossibleScore) * 100 : 0;
    const completionRate = (userAnswers.length / totalQuestions) * 100;

    // Determine level based on percentage
    let level: "Novice" | "Good" | "Expert";
    let badge: string;

    if (percentage >= 80) {
      level = "Expert";
      badge = "evaluation-expert";
    } else if (percentage >= 60) {
      level = "Good";
      badge = "evaluation-good";
    } else {
      level = "Novice";
      badge = "evaluation-novice";
    }

    // Calculate category scores
    const categoryScores = propertyData.categories.map((category) => {
      const categoryQuestions = category.questions;
      const categoryAnswers = userAnswers.filter((answer) =>
        categoryQuestions.some((q) => q.id === answer.questionId),
      );

      const categoryScore = categoryAnswers.reduce((total, ans) => {
        return total + ans.answerWeight * ans.questionWeight;
      }, 0);

      const categoryMaxScore = categoryQuestions.reduce((total, question) => {
        const maxAnswerWeight = Math.max(
          ...question.answers.map((a) => a.weight),
        );
        return total + maxAnswerWeight * question.weight;
      }, 0);

      const categoryPercentage =
        categoryMaxScore > 0 ? (categoryScore / categoryMaxScore) * 100 : 0;

      return {
        categoryId: category.id,
        categoryName: getCategoryName(category, currentLanguage),
        score: categoryScore,
        maxScore: categoryMaxScore,
        percentage: categoryPercentage,
        questionsAnswered: categoryAnswers.length,
        totalQuestions: categoryQuestions.length,
      };
    });

    const result: EvaluationResult = {
      totalScore: currentScore,
      maxPossibleScore,
      percentage,
      level,
      badge,
      completionRate,
      categoryScores,
    };

    trackEvaluationEvent("evaluation_completed", {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
      totalScore: currentScore,
      maxPossibleScore,
      percentage: Math.round(percentage),
      level,
      questionsAnswered: userAnswers.length,
      totalQuestions,
      completionRate: Math.round(completionRate),
    });

    toast.success("Property evaluation completed successfully!");
    onComplete(result, userAnswers);
  };

  const getUserAnswerForCurrentQuestion = () => {
    return userAnswers.find(
      (answer) => answer.questionId === currentQuestionData.question.id,
    );
  };

  const canGoNext = () => {
    return getUserAnswerForCurrentQuestion() !== undefined;
  };

  // Show loading state if no questions
  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Home className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              No evaluation questions found
            </h2>
            <p className="text-muted-foreground">
              Please ensure the database has been seeded with evaluation
              questions.
            </p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <QuestionCard
      question={currentQuestionData.question}
      category={currentQuestionData.category}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={totalQuestions}
      userAnswer={getUserAnswerForCurrentQuestion()}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onBack={handleBack}
      onRestart={handleRestart}
      onSkip={handleSkip}
      canGoNext={canGoNext()}
      currentScore={currentScore}
      maxPossibleScore={maxPossibleScore}
      isLastQuestion={currentQuestionIndex === totalQuestions - 1}
    />
  );
}
