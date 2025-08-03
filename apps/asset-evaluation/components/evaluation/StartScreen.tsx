'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import {
  Play,
  Star,
  Trophy,
  Home,
  CheckCircle2,
  ArrowRight,
  Clock,
  Target,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { PropertyTypeWithCategories, trackEvaluationEvent, getPropertyTypeName, getCategoryName } from '@/lib/evaluation-utils';

interface StartScreenProps {
  propertyData: PropertyTypeWithCategories;
  onStart: () => void;
}

export default function StartScreen({ propertyData, onStart }: StartScreenProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'ro' | 'en';
  const [isVisible, setIsVisible] = useState(false);

  // Calculate total questions and maximum score
  const totalQuestions = propertyData.categories.reduce(
    (sum, category) => sum + category.questions.length,
    0
  );

  const maxScore = propertyData.categories.reduce(
    (sum, category) =>
      sum +
      category.questions.reduce(
        (questionSum, question) =>
          questionSum + Math.max(...question.answers.map(a => a.weight)) * question.weight,
        0
      ),
    0
  );

  const estimatedTime = Math.ceil(totalQuestions * 0.5); // 30 seconds per question

  useEffect(() => {
    setIsVisible(true);
    trackEvaluationEvent('start_screen_viewed', {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
      totalQuestions,
      maxScore,
      estimatedTime,
    });
  }, [getPropertyTypeName(propertyData, currentLanguage), totalQuestions, maxScore, estimatedTime, currentLanguage]);

  const handleStart = () => {
    trackEvaluationEvent('evaluation_started', {
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
      totalQuestions,
    });
    onStart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-10 w-10"
          title={t('startScreen.backToHome', { ns: 'evaluation' })}
        >
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
      </div>
      
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="bg-card/50 backdrop-blur-sm border-2 shadow-2xl">
          <CardContent className="p-8 text-center space-y-8">
            {/* Header Icon */}
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Home className="w-10 h-10 text-primary" />
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {t('startScreen.title', { ns: 'evaluation' })}
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {t('startScreen.subtitle', { 
                  propertyType: getPropertyTypeName(propertyData, currentLanguage).toLowerCase(),
                  ns: 'evaluation' 
                })}
              </p>
            </div>

            {/* Start Button - Moved to top */}
            <div>
              <Button
                onClick={handleStart}
                size="lg"
                className="w-full max-w-md h-14 text-lg font-semibold bg-primary hover:bg-primary-dark transition-all duration-200 hover:scale-105"
              >
                <Play className="w-6 h-6 mr-3" />
                {t('startScreen.startButton', { ns: 'evaluation' })}
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <Card className="p-2 md:p-4 bg-background/50">
                <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-0" />
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-foreground">{totalQuestions}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{t('startScreen.statistics.questions', { ns: 'evaluation' })}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-2 md:p-4 bg-background/50">
                <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-0" />
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-foreground">{estimatedTime}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{t('startScreen.statistics.minutes', { ns: 'evaluation' })}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-2 md:p-4 bg-background/50">
                <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-0" />
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-foreground">{Math.round(maxScore)}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{t('startScreen.statistics.maxScore', { ns: 'evaluation' })}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Categories Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t('startScreen.categories.title', { ns: 'evaluation' })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {propertyData.categories.map((category, index) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 p-3 bg-background/30 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="font-medium text-foreground">{getCategoryName(category, currentLanguage)}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {t('startScreen.categories.questionsCount', { count: category.questions.length, ns: 'evaluation' })}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Gamification Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t('startScreen.achievements.title', { ns: 'evaluation' })}
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg w-full sm:w-auto justify-center">
                  <Home className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('startScreen.achievements.beginner', { ns: 'evaluation' })}</span>
                  <span className="text-xs text-gray-500">{t('startScreen.achievements.beginnerRange', { ns: 'evaluation' })}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 rotate-90 sm:rotate-0" />
                <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg w-full sm:w-auto justify-center">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">{t('startScreen.achievements.expert', { ns: 'evaluation' })}</span>
                  <span className="text-xs text-blue-500">{t('startScreen.achievements.expertRange', { ns: 'evaluation' })}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 rotate-90 sm:rotate-0" />
                <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg w-full sm:w-auto justify-center">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">{t('startScreen.achievements.master', { ns: 'evaluation' })}</span>
                  <span className="text-xs text-yellow-500">{t('startScreen.achievements.masterRange', { ns: 'evaluation' })}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-sm text-muted-foreground">
              {t('startScreen.footerNote', { ns: 'evaluation' })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
