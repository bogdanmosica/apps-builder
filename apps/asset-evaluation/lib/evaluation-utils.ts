// Pure utility functions for evaluation logic (client-safe)

export interface PropertyType {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionCategory {
  id: number;
  name: string;
  propertyTypeId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: number;
  text: string;
  weight: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: number;
  text: string;
  weight: number;
  questionId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

export interface CategoryWithQuestions extends QuestionCategory {
  questions: QuestionWithAnswers[];
}

export interface PropertyTypeWithCategories extends PropertyType {
  categories: CategoryWithQuestions[];
}

export interface UserAnswer {
  questionId: number;
  answerId: number;
  answerWeight: number;
  questionWeight: number;
}

export interface CategoryScore {
  categoryId: number;
  categoryName: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsAnswered: number;
  totalQuestions: number;
}

export interface EvaluationResult {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  categoryScores: CategoryScore[];
  level: 'Novice' | 'Good' | 'Expert';
  badge: string;
  completionRate: number;
}

// Calculate evaluation result based on user answers
export function calculateEvaluationResult(
  userAnswers: UserAnswer[],
  propertyData: PropertyTypeWithCategories
): EvaluationResult {
  const categoryScores: CategoryScore[] = [];
  let totalScore = 0;
  let maxPossibleScore = 0;
  let totalQuestionsAnswered = 0;
  let totalQuestions = 0;

  for (const category of propertyData.categories) {
    let categoryScore = 0;
    let categoryMaxScore = 0;
    let questionsAnswered = 0;

    for (const question of category.questions) {
      totalQuestions++;
      const maxAnswerWeight = Math.max(...question.answers.map(a => a.weight));
      categoryMaxScore += maxAnswerWeight * question.weight;

      const userAnswer = userAnswers.find(ua => ua.questionId === question.id);
      if (userAnswer) {
        totalQuestionsAnswered++;
        questionsAnswered++;
        categoryScore += userAnswer.answerWeight * userAnswer.questionWeight;
      }
    }

    const categoryPercentage = categoryMaxScore > 0 ? (categoryScore / categoryMaxScore) * 100 : 0;

    categoryScores.push({
      categoryId: category.id,
      categoryName: category.name,
      score: categoryScore,
      maxScore: categoryMaxScore,
      percentage: categoryPercentage,
      questionsAnswered,
      totalQuestions: category.questions.length,
    });

    totalScore += categoryScore;
    maxPossibleScore += categoryMaxScore;
  }

  const overallPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const completionRate = totalQuestions > 0 ? (totalQuestionsAnswered / totalQuestions) * 100 : 0;

  // Determine level and badge
  let level: 'Novice' | 'Good' | 'Expert' = 'Novice';
  let badge = '🏠 Beginner';

  if (overallPercentage >= 90) {
    level = 'Expert';
    badge = '🏆 Property Master';
  } else if (overallPercentage >= 60) {
    level = 'Good';
    badge = '⭐ Property Expert';
  } else if (overallPercentage >= 30) {
    level = 'Good';
    badge = '📈 Property Learner';
  }

  return {
    totalScore,
    maxPossibleScore,
    percentage: overallPercentage,
    categoryScores,
    level,
    badge,
    completionRate,
  };
}

// Get level thresholds for gamification
export function getLevelThresholds() {
  return {
    novice: { min: 0, max: 30, color: 'bg-gray-500', icon: '🏠' },
    good: { min: 30, max: 60, color: 'bg-blue-500', icon: '⭐' },
    expert: { min: 60, max: 90, color: 'bg-green-500', icon: '🏆' },
    master: { min: 90, max: 100, color: 'bg-yellow-500', icon: '👑' },
  };
}

// Track analytics events
export function trackEvaluationEvent(eventName: string, data: any) {
  // In a real app, this would send to your analytics service
  console.log(`📊 Analytics: ${eventName}`, data);
}
