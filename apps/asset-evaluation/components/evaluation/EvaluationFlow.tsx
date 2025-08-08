"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  type EvaluationResult,
  getPropertyTypeName,
  type PropertyTypeWithCategories,
  trackEvaluationEvent,
  type UserAnswer,
} from "@/lib/evaluation-utils";
import DynamicEvaluationForm from "../evaluations/DynamicEvaluationForm";
import { UnifiedEvaluationForm } from "../evaluations/UnifiedEvaluationForm";
import EvaluationQuestionsScreen from "./EvaluationQuestionsScreen";
import FinalScreen from "./FinalScreen";
import PropertyInfoScreen from "./PropertyInfoScreen";
import StartScreen from "./StartScreen";

interface EvaluationFlowProps {
  propertyData: PropertyTypeWithCategories;
}

interface EvaluationFormData {
  // All data will now be dynamic based on custom fields
  [fieldId: string]: any;
}

interface PropertyInfo {
  name: string;
  location?: string;
  surface?: number;
  floors?: string;
  constructionYear?: number;
}

type Screen = "start" | "property-info" | "questions" | "final";

export default function EvaluationFlow({ propertyData }: EvaluationFlowProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as "ro" | "en";

  const [currentScreen, setCurrentScreen] = useState<Screen>("start");
  console.log("🔍 EvaluationFlow - currentScreen:", currentScreen);
  console.log(
    "🔍 EvaluationFlow - propertyData categories:",
    propertyData.categories.length,
  );

  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [evaluationData, setEvaluationData] =
    useState<EvaluationFormData | null>(null);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedSession, setSavedSession] = useState<{
    evaluationData: EvaluationFormData;
    propertyInfo: PropertyInfo;
    screen: Screen;
    timestamp: number;
  } | null>(null);

  // Load saved progress from localStorage (only for incomplete evaluations)
  useEffect(() => {
    // Temporarily disabled - we'll add this back after the flow is working
    /*
    const saved = localStorage.getItem(`evaluation-${propertyData.id}`);
    if (saved) {
      try {
        const { evaluationData, screen, timestamp } = JSON.parse(saved);
        
        // Check if this is a recent incomplete session (within last 24 hours)
        const isRecentSession = timestamp && (Date.now() - timestamp) < 24 * 60 * 60 * 1000;
        
        // Only resume if evaluation was incomplete AND it's a recent session
        if (screen === 'questions' && evaluationData && isRecentSession) {
          setSavedSession({ evaluationData, screen, timestamp });
          setShowResumeDialog(true);
        } else {
          // Evaluation was completed or too old - clear and start fresh
          localStorage.removeItem(`evaluation-${propertyData.id}`);
          console.log('✅ Starting fresh evaluation');
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
        localStorage.removeItem(`evaluation-${propertyData.id}`);
      }
    }
    */
  }, [propertyData.id]);

  // Save progress to localStorage
  const saveProgress = useCallback(
    (data: EvaluationFormData, screen: Screen) => {
      // Temporarily disabled - we'll add this back after the flow is working
      /*
    const progressData = {
      evaluationData: data,
      propertyInfo,
      screen,
      timestamp: Date.now(),
    };
    localStorage.setItem(`evaluation-${propertyData.id}`, JSON.stringify(progressData));
    */
    },
    [propertyData.id, propertyInfo],
  );

  const handleStart = () => {
    console.log("🔄 EvaluationFlow - handleStart called");
    trackEvaluationEvent("evaluation_started", {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
    });
    setCurrentScreen("property-info");
  };

  const handlePropertyInfoSubmit = (propInfo: PropertyInfo) => {
    console.log(
      "🔄 EvaluationFlow - handlePropertyInfoSubmit called",
      propInfo,
    );
    setPropertyInfo(propInfo);
    setCurrentScreen("questions");
  };

  const handleQuestionsComplete = async (
    result: EvaluationResult,
    answers: UserAnswer[],
  ) => {
    try {
      setUserAnswers(answers);
      setEvaluationResult(result);

      // Save the complete evaluation to the API
      const response = await fetch("/api/evaluations/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyTypeId: propertyData.id,
          propertyInfo,
          userAnswers: answers,
          evaluationResult: result,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save evaluation");
      }

      const saveResult = await response.json();
      console.log(
        "✅ Evaluation saved with ID:",
        saveResult.evaluationSessionId,
      );

      setCurrentScreen("final");

      // Clear saved progress since evaluation is complete
      localStorage.removeItem(`evaluation-${propertyData.id}`);

      trackEvaluationEvent("evaluation_completed", {
        propertyType: getPropertyTypeName(propertyData, currentLanguage),
        totalScore: result.totalScore,
        level: result.level,
      });

      toast.success("Property evaluation completed successfully!");
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error("Failed to save evaluation. Please try again.");
      // Don't throw - still show results even if save failed
      setCurrentScreen("final");
    }
  };

  const handleBack = () => {
    switch (currentScreen) {
      case "property-info":
        setCurrentScreen("start");
        break;
      case "questions":
        setCurrentScreen("property-info");
        break;
      case "final":
        setCurrentScreen("start");
        break;
      default:
        setCurrentScreen("start");
    }
  };

  const handleResumeDialogChoice = (resume: boolean) => {
    /*
    if (resume && savedSession) {
      setEvaluationData(savedSession.evaluationData);
      setPropertyInfo(savedSession.propertyInfo);
      setCurrentScreen(savedSession.screen);
      console.log('🔄 Resumed evaluation');
    } else {
      localStorage.removeItem(`evaluation-${propertyData.id}`);
      console.log('🆕 Started new evaluation');
    }
    */
    setShowResumeDialog(false);
  };

  const handleRetakeEvaluation = () => {
    setCurrentScreen("start");
    setEvaluationResult(null);
    setEvaluationData(null);
    localStorage.removeItem(`evaluation-${propertyData.id}`);
  };

  // Resume dialog
  if (showResumeDialog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Dialog
          open={showResumeDialog}
          onOpenChange={() => setShowResumeDialog(false)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Resume Previous Evaluation?</DialogTitle>
              <DialogDescription>
                We found a saved evaluation for this property type. Would you
                like to continue where you left off?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => handleResumeDialogChoice(false)}
              >
                Start New
              </Button>
              <Button onClick={() => handleResumeDialogChoice(true)}>
                Resume
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        {currentScreen === "start" && (
          <StartScreen propertyData={propertyData} onStart={handleStart} />
        )}

        {currentScreen === "property-info" && (
          <PropertyInfoScreen
            propertyTypeName={getPropertyTypeName(
              propertyData,
              currentLanguage,
            )}
            onSave={handlePropertyInfoSubmit}
            onBack={handleBack}
            initialData={propertyInfo || undefined}
          />
        )}

        {currentScreen === "questions" && propertyInfo && (
          <EvaluationQuestionsScreen
            propertyData={propertyData}
            propertyInfo={propertyInfo}
            onComplete={handleQuestionsComplete}
            onBack={handleBack}
          />
        )}

        {currentScreen === "final" && evaluationResult && (
          <FinalScreen
            result={evaluationResult}
            propertyData={propertyData}
            onRestart={handleRetakeEvaluation}
          />
        )}
      </div>
    </div>
  );
}
