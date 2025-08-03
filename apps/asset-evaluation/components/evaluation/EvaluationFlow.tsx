'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { toast } from 'sonner';
import PropertyInfoScreen, { PropertyInfo } from './PropertyInfoScreen';
import StartScreen from './StartScreen';
import QuestionCard from './QuestionCard';
import FinalScreen from './FinalScreen';
import {
  PropertyTypeWithCategories,
  UserAnswer,
  EvaluationResult,
  calculateEvaluationResult,
  trackEvaluationEvent,
  getPropertyTypeName,
} from '@/lib/evaluation-utils';

interface EvaluationFlowProps {
  propertyData: PropertyTypeWithCategories;
}

type Screen = 'start' | 'propertyInfo' | 'questions' | 'final';

export default function EvaluationFlow({ propertyData }: EvaluationFlowProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as 'ro' | 'en';
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedSession, setSavedSession] = useState<{
    answers: UserAnswer[];
    questionIndex: number;
    screen: Screen;
    timestamp: number;
  } | null>(null);

  // Flatten all questions from all categories
  const allQuestions = propertyData.categories.flatMap(category =>
    category.questions.map(question => ({
      ...question,
      category,
    }))
  );

  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentQuestionIndex];

  // Calculate current score
  const currentScore = userAnswers.reduce(
    (sum, answer) => sum + (answer.answerWeight * answer.questionWeight),
    0
  );

  const maxPossibleScore = propertyData.categories.reduce(
    (sum, category) =>
      sum +
      category.questions.reduce(
        (questionSum, question) =>
          questionSum + Math.max(...question.answers.map(a => a.weight)) * question.weight,
        0
      ),
    0
  );

  // Load saved progress from localStorage (only for incomplete evaluations)
  useEffect(() => {
    const saved = localStorage.getItem(`evaluation-${propertyData.id}`);
    if (saved) {
      try {
        const { answers, questionIndex, screen, timestamp } = JSON.parse(saved);
        
        // Check if this is a recent incomplete session (within last 24 hours)
        const isRecentSession = timestamp && (Date.now() - timestamp) < 24 * 60 * 60 * 1000;
        
        // Only resume if evaluation was incomplete AND it's a recent session
        if (screen === 'questions' && answers && questionIndex !== undefined && isRecentSession) {
          // Store session data and show dialog instead of using confirm()
          setSavedSession({ answers, questionIndex, screen, timestamp });
          setShowResumeDialog(true);
        } else {
          // Evaluation was completed or too old - clear and start fresh
          localStorage.removeItem(`evaluation-${propertyData.id}`);
          console.log('✅ Starting fresh evaluation');
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
        // Clear corrupted data
        localStorage.removeItem(`evaluation-${propertyData.id}`);
      }
    }
  }, [propertyData.id, totalQuestions]);

  // Load saved property info from localStorage
  useEffect(() => {
    const savedPropertyInfo = localStorage.getItem(`property-info-${propertyData.id}`);
    if (savedPropertyInfo) {
      try {
        const info = JSON.parse(savedPropertyInfo);
        setPropertyInfo(info);
        // Property info is loaded but we don't automatically skip screens
        // User still needs to go through the flow: start → propertyInfo → questions
      } catch (error) {
        console.error('Failed to load property info:', error);
        localStorage.removeItem(`property-info-${propertyData.id}`);
      }
    }
  }, [propertyData.id]);

  const handleContinueEvaluation = () => {
    if (savedSession) {
      setUserAnswers(savedSession.answers || []);
      setCurrentQuestionIndex(savedSession.questionIndex || 0);
      setCurrentScreen('questions');
      console.log('📋 Resuming incomplete evaluation from question', savedSession.questionIndex + 1);
    }
    setShowResumeDialog(false);
    setSavedSession(null);
  };

  const handleStartFreshEvaluation = () => {
    // User chose to start fresh - clear old data
    localStorage.removeItem(`evaluation-${propertyData.id}`);
    localStorage.removeItem(`property-info-${propertyData.id}`);
    console.log('🆕 Starting fresh evaluation');
    setShowResumeDialog(false);
    setSavedSession(null);
  };

  // Save progress to localStorage
  const saveProgress = useCallback((answers: UserAnswer[], questionIndex: number, screen: Screen) => {
    localStorage.setItem(`evaluation-${propertyData.id}`, JSON.stringify({
      answers,
      questionIndex,
      screen,
      timestamp: Date.now(),
    }));
  }, [propertyData.id]);

  // Save evaluation results to database (async)
  const saveToDatabaseAsync = useCallback(async (answers: UserAnswer[], propertyData: PropertyTypeWithCategories, result: EvaluationResult, propInfo: PropertyInfo | null) => {
    try {
      console.log('🚀 Sending propertyInfo to API:', propInfo);
      const response = await fetch('/api/evaluation/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAnswers: answers,
          propertyData: propertyData,
          propertyInfo: propInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Evaluation results saved to database:', data.evaluationSessionId);
        
        // Clear localStorage after successful save
        localStorage.removeItem(`evaluation-${propertyData.id}`);
        localStorage.removeItem(`property-info-${propertyData.id}`);
        
        // Track successful save
        trackEvaluationEvent('evaluation_saved_to_database', {
          evaluationSessionId: data.evaluationSessionId,
          score: result.percentage,
          level: result.level,
          questionsAnswered: answers.length,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Failed to save evaluation results to database:', error);
      
      // Track failed save
      trackEvaluationEvent('evaluation_save_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        score: result.percentage,
        level: result.level,
        questionsAnswered: answers.length,
      });
      
      // Don't show error to user - evaluation still works locally
      // Could show a subtle notification here if needed
    }
  }, []);

  const handlePropertyInfoSave = (info: PropertyInfo) => {
    setPropertyInfo(info);
    setCurrentScreen('questions');
    setCurrentQuestionIndex(0);
    
    // Save property info to localStorage for persistence
    localStorage.setItem(`property-info-${propertyData.id}`, JSON.stringify(info));
    
    // Also save the evaluation progress with property info
    saveProgress(userAnswers, 0, 'questions');
    
    trackEvaluationEvent('property_info_saved', {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
      hasLocation: !!info.location,
      hasSurface: !!info.surface,
      hasFloors: !!info.floors,
      hasConstructionYear: !!info.constructionYear,
    });
    
    trackEvaluationEvent('evaluation_started', {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
      totalQuestions,
      propertyInfo: {
        hasName: !!info.name,
        hasLocation: !!info.location,
        hasSurface: !!info.surface,
        hasFloors: !!info.floors,
        hasConstructionYear: !!info.constructionYear,
      },
    });
  };

  const handleStart = () => {
    // Clear any existing localStorage data for a fresh start
    localStorage.removeItem(`evaluation-${propertyData.id}`);
    localStorage.removeItem(`property-info-${propertyData.id}`);
    
    setCurrentScreen('propertyInfo');
    
    trackEvaluationEvent('start_clicked', {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
      totalQuestions,
    });
  };

  const handleBackToStart = () => {
    setCurrentScreen('start');
    
    trackEvaluationEvent('back_to_start', {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
    });
  };

  const handleAnswer = (answer: UserAnswer) => {
    const newAnswers = userAnswers.filter(a => a.questionId !== answer.questionId);
    newAnswers.push(answer);
    setUserAnswers(newAnswers);
    saveProgress(newAnswers, currentQuestionIndex, 'questions');
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      saveProgress(userAnswers, nextIndex, 'questions');
      
      trackEvaluationEvent('question_navigation', {
        direction: 'next',
        fromIndex: currentQuestionIndex,
        toIndex: nextIndex,
        totalQuestions,
      });
    } else {
      // Evaluation complete
      const result = calculateEvaluationResult(userAnswers, propertyData);
      setEvaluationResult(result);
      setCurrentScreen('final');
      saveProgress(userAnswers, currentQuestionIndex, 'final');
      
      // Save to database
      saveToDatabaseAsync(userAnswers, propertyData, result, propertyInfo);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // Go to previous question
      handlePrevious();
    } else {
      // Go back to start screen
      setCurrentScreen('start');
      trackEvaluationEvent('navigation_back_to_start', {
        fromQuestionIndex: currentQuestionIndex,
        totalQuestions,
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      saveProgress(userAnswers, prevIndex, 'questions');
      
      trackEvaluationEvent('question_navigation', {
        direction: 'previous',
        fromIndex: currentQuestionIndex,
        toIndex: prevIndex,
        totalQuestions,
      });
    }
  };

  const handleSkip = () => {
    // Remove any existing answer for this question
    const newAnswers = userAnswers.filter(a => a.questionId !== currentQuestion.id);
    setUserAnswers(newAnswers);
    
    trackEvaluationEvent('question_skipped', {
      questionId: currentQuestion.id,
      questionIndex: currentQuestionIndex,
      categoryId: currentQuestion.category.id,
    });
    
    handleNext();
  };

  const handleRestart = () => {
    setCurrentScreen('start');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setEvaluationResult(null);
    localStorage.removeItem(`evaluation-${propertyData.id}`);
    
    trackEvaluationEvent('evaluation_restarted', {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
      previousScore: evaluationResult?.percentage || 0,
    });
  };

  const handleShare = () => {
    if (!evaluationResult) return;
    
    const shareText = `I just evaluated my ${getPropertyTypeName(propertyData, currentLanguage).toLowerCase()} and scored ${Math.round(evaluationResult.percentage)}%! 🏠✨`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Property Evaluation Results',
        text: shareText,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`)
        .then(() => {
          // Show toast notification
          toast.success('Results copied to clipboard!', {
            description: 'You can now paste and share your evaluation results.',
          });
        })
        .catch(console.error);
    }
    
    trackEvaluationEvent('results_shared', {
      score: evaluationResult.percentage,
      level: evaluationResult.level,
      shareMethod: 'web_share_api' in navigator ? 'native' : 'clipboard',
    });
  };

  const handleDownload = () => {
    if (!evaluationResult) return;
    
    // Generate a simple text report
    const report = generateTextReport(evaluationResult, propertyData);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-evaluation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    trackEvaluationEvent('report_downloaded', {
      score: evaluationResult.percentage,
      level: evaluationResult.level,
      format: 'text',
    });
  };

  // Get current user answer for the current question
  const currentUserAnswer = userAnswers.find(a => a.questionId === currentQuestion?.id);

  if (currentScreen === 'start') {
    return <StartScreen propertyData={propertyData} onStart={handleStart} />;
  }

  if (currentScreen === 'propertyInfo') {
    return (
      <PropertyInfoScreen
        propertyTypeName={getPropertyTypeName(propertyData, currentLanguage)}
        onSave={handlePropertyInfoSave}
        onBack={handleBackToStart}
        initialData={propertyInfo || undefined}
      />
    );
  }

  if (currentScreen === 'final' && evaluationResult) {
    return (
      <FinalScreen
        result={evaluationResult}
        propertyData={propertyData}
        onRestart={handleRestart}
        onShare={handleShare}
        onDownload={handleDownload}
      />
    );
  }

  if (currentScreen === 'questions' && currentQuestion) {
    return (
      <QuestionCard
        question={currentQuestion}
        category={currentQuestion.category}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        userAnswer={currentUserAnswer}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onBack={handleBack}
        onRestart={handleRestart}
        onSkip={handleSkip}
        canGoNext={currentQuestionIndex < totalQuestions - 1 || currentUserAnswer !== undefined}
        currentScore={currentScore}
        maxPossibleScore={maxPossibleScore}
        isLastQuestion={currentQuestionIndex === totalQuestions - 1}
      />
    );
  }

  return (
    <>
      {/* Resume Evaluation Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Continue Your Evaluation?</DialogTitle>
            <DialogDescription>
              You have an incomplete evaluation in progress.
              {savedSession && (
                <span className="block mt-2 font-medium">
                  Continue from Question {savedSession.questionIndex + 1} of {totalQuestions}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleStartFreshEvaluation}
              className="w-full sm:w-auto"
            >
              Start Fresh
            </Button>
            <Button
              onClick={handleContinueEvaluation}
              className="w-full sm:w-auto"
            >
              Continue Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Generate a text report for download
function generateTextReport(result: EvaluationResult, propertyData: PropertyTypeWithCategories): string {
  const date = new Date().toLocaleDateString();
  
  let report = `PROPERTY EVALUATION REPORT\n`;
  report += `Generated: ${date}\n`;
  report += `Property Type: ${getPropertyTypeName(propertyData, 'en')}\n`;
  report += `\n`;
  
  report += `OVERALL SCORE\n`;
  report += `Score: ${Math.round(result.percentage)}% (${result.totalScore.toFixed(1)}/${result.maxPossibleScore.toFixed(1)} points)\n`;
  report += `Level: ${result.level}\n`;
  report += `Badge: ${result.badge}\n`;
  report += `Completion: ${Math.round(result.completionRate)}%\n`;
  report += `\n`;
  
  report += `CATEGORY BREAKDOWN\n`;
  result.categoryScores.forEach(category => {
    report += `${category.categoryName}: ${Math.round(category.percentage)}% (${category.score.toFixed(1)}/${category.maxScore.toFixed(1)} pts)\n`;
    report += `  Questions answered: ${category.questionsAnswered}/${category.totalQuestions}\n`;
  });
  report += `\n`;
  
  const improvements = result.categoryScores
    .filter(cat => cat.percentage < 70)
    .sort((a, b) => a.percentage - b.percentage);
    
  if (improvements.length > 0) {
    report += `AREAS FOR IMPROVEMENT\n`;
    improvements.forEach(improvement => {
      const priority = improvement.percentage < 30 ? 'High' : improvement.percentage < 50 ? 'Medium' : 'Low';
      report += `${improvement.categoryName}: ${Math.round(improvement.percentage)}% (${priority} Priority)\n`;
    });
  }
  
  return report;
}
