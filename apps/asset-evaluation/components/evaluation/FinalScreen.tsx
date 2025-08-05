'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import {
  Trophy,
  Star,
  Home,
  Crown,
  Award,
  TrendingUp,
  RotateCcw,
  Share2,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Target,
  ArrowLeft,
  List,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import {
  EvaluationResult,
  PropertyTypeWithCategories,
  trackEvaluationEvent,
  getPropertyTypeName,
} from '@/lib/evaluation-utils';

interface FinalScreenProps {
  result: EvaluationResult;
  propertyData: PropertyTypeWithCategories;
  onRestart: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

export default function FinalScreen({
  result,
  propertyData,
  onRestart,
  onShare,
  onDownload,
}: FinalScreenProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as 'ro' | 'en';
  const [showConfetti, setShowConfetti] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Show confetti for good scores
    if (result.percentage >= 60) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    trackEvaluationEvent('evaluation_completed', {
      totalScore: result.totalScore,
      maxScore: result.maxPossibleScore,
      percentage: Math.round(result.percentage),
      level: result.level,
      badge: result.badge,
      completionRate: Math.round(result.completionRate),
      categoriesCount: result.categoryScores.length,
      propertyType: getPropertyTypeName(propertyData, currentLanguage),
    });
  }, [result, getPropertyTypeName(propertyData, currentLanguage), currentLanguage]);

  const getBadgeIcon = (level: string) => {
    switch (level) {
      case 'Expert':
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 'Good':
        return <Star className="w-8 h-8 text-blue-500" />;
      default:
        return <Home className="w-8 h-8 text-gray-500" />;
    }
  };

  const getBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (percentage >= 60) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (percentage >= 30) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    return 'bg-gradient-to-r from-gray-400 to-gray-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return {
      title: '🎉 Outstanding Property!',
      message: 'This property shows excellent quality across all areas. A fantastic investment!',
      color: 'text-green-600 dark:text-green-400'
    };
    if (percentage >= 60) return {
      title: '⭐ Great Property!',
      message: 'This property has strong fundamentals with some areas for improvement.',
      color: 'text-blue-600 dark:text-blue-400'
    };
    if (percentage >= 30) return {
      title: '📈 Potential Property',
      message: 'This property has good potential but requires attention in several areas.',
      color: 'text-yellow-600 dark:text-yellow-400'
    };
    return {
      title: '🔧 Needs Attention',
      message: 'This property requires significant improvements across multiple areas.',
      color: 'text-red-600 dark:text-red-400'
    };
  };

  const scoreMessage = getScoreMessage(result.percentage);

  const getImprovementSuggestions = () => {
    return result.categoryScores
      .filter(category => category.percentage < 70)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3)
      .map(category => ({
        name: category.categoryName,
        percentage: category.percentage,
        priority: category.percentage < 30 ? 'High' : category.percentage < 50 ? 'Medium' : 'Low'
      }));
  };

  const improvements = getImprovementSuggestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 flex flex-col p-4">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-10 w-10"
          title="Back to Home"
        >
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
      </div>
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-32 h-32 text-yellow-400 animate-pulse" />
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Main Score Card */}
        <Card className="shadow-2xl border-2">
          <CardContent className="p-8 text-center space-y-6">
            {/* Badge and Icon */}
            <div className="flex flex-col items-center space-y-4">
              <div className={`
                w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl
                ${getBadgeColor(result.percentage)}
                animate-in zoom-in-50 duration-500 delay-300
              `}>
                {getBadgeIcon(result.level)}
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {result.badge}
                </h1>
                <p className={`text-lg font-medium ${scoreMessage.color}`}>
                  {scoreMessage.title}
                </p>
              </div>
            </div>

            {/* Score Display */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-6xl md:text-7xl font-bold text-foreground">
                  {Math.round(result.percentage)}
                  <span className="text-3xl text-muted-foreground">%</span>
                </p>
                <p className="text-lg text-muted-foreground mt-2">
                  {result.totalScore.toFixed(1)} / {result.maxPossibleScore.toFixed(1)} points
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Progress value={result.percentage} className="h-4" />
              </div>
            </div>

            {/* Message */}
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {scoreMessage.message}
            </p>

            {/* Completion Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{Math.round(result.completionRate)}% Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{result.categoryScores.length} Categories</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.categoryScores.map((category, index) => (
              <div
                key={category.categoryId}
                className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{category.categoryName}</h3>
                    <Badge variant={category.percentage >= 70 ? 'default' : category.percentage >= 50 ? 'secondary' : 'destructive'}>
                      {Math.round(category.percentage)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {category.questionsAnswered}/{category.totalQuestions} answered
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {category.score.toFixed(1)} / {category.maxScore.toFixed(1)} points
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Improvement Suggestions */}
        {improvements.length > 0 && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {improvements.map((improvement, index) => (
                <div
                  key={improvement.name}
                  className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg animate-in fade-in slide-in-from-right-4 duration-300"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div>
                    <h4 className="font-medium text-foreground">{improvement.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Current score: {Math.round(improvement.percentage)}%
                    </p>
                  </div>
                  <Badge 
                    variant={improvement.priority === 'High' ? 'destructive' : improvement.priority === 'Medium' ? 'secondary' : 'outline'}
                  >
                    {improvement.priority} Priority
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <Button
            onClick={onRestart}
            variant="outline"
            size="lg"
            className="w-full md:w-auto flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Evaluation
          </Button>

          {onShare && (
            <Button
              onClick={onShare}
              variant="outline"
              size="lg"
              className="w-full md:w-auto flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Results
            </Button>
          )}

          {onDownload && (
            <Button
              onClick={onDownload}
              size="lg"
              className="w-full md:w-auto flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Download className="w-5 h-5" />
              Download Report
            </Button>
          )}

          <Button
            asChild
            variant="default"
            size="lg"
            className="w-full md:w-auto flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Link href="/dashboard">
              <List className="w-5 h-5" />
              View All Properties
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full md:w-auto flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Link href="/evaluation">
              <Plus className="w-5 h-5" />
              Add New Property
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            🏠 Property evaluation completed • Based on {propertyData.categories.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)} expert criteria
          </p>
        </div>
      </div>
    </div>
  );
}
