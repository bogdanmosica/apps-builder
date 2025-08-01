'use client';

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trophy,
  Star,
  Target,
  Zap,
  Trash2,
  Sparkles,
  Crown,
  Lock,
  Calendar,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  points: number;
  createdAt: Date;
  difficulty?: 'easy' | 'medium' | 'hard';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
}

interface GamifiedTodoProps {
  userName?: string;
  isPro?: boolean; // Add isPro prop to determine if user has PRO features
}

export default function GamifiedTodo({ userName = "User", isPro = false }: GamifiedTodoProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [isLevelUpDialogOpen, setIsLevelUpDialogOpen] = useState(false);
  const [newLevelAchieved, setNewLevelAchieved] = useState(1);
  
  // PRO features state
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [dueDate, setDueDate] = useState('');
  const [showProFeatures, setShowProFeatures] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('gamified-todos');
    const savedPoints = localStorage.getItem('gamified-points');
    const savedLevel = localStorage.getItem('gamified-level');
    const savedStreak = localStorage.getItem('gamified-streak');

    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints));
    }
    if (savedLevel) {
      setLevel(parseInt(savedLevel));
    }
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('gamified-todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('gamified-points', totalPoints.toString());
  }, [totalPoints]);

  useEffect(() => {
    localStorage.setItem('gamified-level', level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem('gamified-streak', streak.toString());
  }, [streak]);

  const addTodo = () => {
    if (newTodo.trim()) {
      let points = Math.floor(Math.random() * 20) + 10; // Base points between 10-30
      
      // PRO feature: Difficulty-based points
      if (isPro && selectedDifficulty) {
        switch (selectedDifficulty) {
          case 'easy': points = Math.floor(Math.random() * 10) + 5; break;
          case 'medium': points = Math.floor(Math.random() * 20) + 15; break;
          case 'hard': points = Math.floor(Math.random() * 30) + 25; break;
        }
      }
      
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        points,
        createdAt: new Date(),
        ...(isPro && { difficulty: selectedDifficulty }),
        ...(isPro && { priority: selectedPriority }),
        ...(isPro && selectedCategory && { category: selectedCategory }),
        ...(isPro && dueDate && { dueDate: new Date(dueDate) }),
      };
      setTodos([...todos, todo]);
      setNewTodo('');
      setDueDate('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const newCompleted = !todo.completed;
        if (newCompleted) {
          // Award points and update streak
          setTotalPoints(prev => prev + todo.points);
          setStreak(prev => prev + 1);
          
          // Level up calculation
          const newTotal = totalPoints + todo.points;
          const newLevel = Math.floor(newTotal / 100) + 1;
          if (newLevel > level) {
            setLevel(newLevel);
            setNewLevelAchieved(newLevel);
            // Show celebration dialog
            setTimeout(() => {
              setIsLevelUpDialogOpen(true);
            }, 100);
          }
        } else {
          // Remove points if unchecked
          setTotalPoints(prev => Math.max(0, prev - todo.points));
          setStreak(prev => Math.max(0, prev - 1));
        }
        return { ...todo, completed: newCompleted };
      }
      return todo;
    }));
  };

  const deleteTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo && todo.completed) {
      setTotalPoints(prev => Math.max(0, prev - todo.points));
      setStreak(prev => Math.max(0, prev - 1));
    }
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const getProgressToNextLevel = () => {
    const currentLevelPoints = (level - 1) * 100;
    const nextLevelPoints = level * 100;
    const progress = totalPoints - currentLevelPoints;
    const maxProgress = nextLevelPoints - currentLevelPoints;
    return (progress / maxProgress) * 100;
  };

  // PRO helper functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  const getWeeklyStats = () => {
    if (!isPro) return { completed: 0, goal: 7, percentage: 0 };
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const completed = todos.filter(todo => 
      todo.completed && new Date(todo.createdAt) >= oneWeekAgo
    ).length;
    const goal = 7;
    return { completed, goal, percentage: Math.min((completed / goal) * 100, 100) };
  };

  const categories = ['personal', 'work', 'health', 'learning', 'projects'];

  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Stats */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Quest Board
                {isPro && <Crown className="h-5 w-5 text-yellow-300" />}
              </CardTitle>
              <CardDescription className="text-purple-100">
                Hey {userName}! Complete tasks to level up! 🚀
                {isPro && <span className="ml-2 text-yellow-200">PRO User</span>}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-5 w-5" />
                <span className="text-xl font-bold">Level {level}</span>
              </div>
              <div className="text-sm opacity-90">
                {totalPoints} XP
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to Level {level + 1}</span>
              <span>{Math.round(getProgressToNextLevel())}%</span>
            </div>
            <div className="w-full bg-purple-400 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${getProgressToNextLevel()}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{completedTodos.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{streak}</div>
                <div className="text-sm text-muted-foreground">Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRO Weekly Goals */}
      {isPro && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-yellow-600" />
              Weekly Goal Tracker
              <Badge className="bg-yellow-100 text-yellow-800">PRO</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">This Week's Progress</span>
              <span className="text-sm text-muted-foreground">
                {getWeeklyStats().completed}/{getWeeklyStats().goal} tasks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${getWeeklyStats().percentage}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {getWeeklyStats().percentage >= 100 ? "🎉 Goal achieved!" : "Keep going! You're doing great!"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade to PRO Banner */}
      {!isPro && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">Unlock PRO Features!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get advanced task management with priorities, due dates, categories, difficulty levels, and weekly goals!
              </p>
              <Button 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                onClick={() => setShowProFeatures(!showProFeatures)}
              >
                {showProFeatures ? 'Hide PRO Preview' : 'Preview PRO Features'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Todo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Quest
            {(isPro || showProFeatures) && <Badge className="bg-yellow-100 text-yellow-800">Enhanced</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="What quest will you embark on today?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="flex-1"
            />
            <Button onClick={addTodo} disabled={!newTodo.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* PRO Features */}
          {(isPro || showProFeatures) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Difficulty
                  {!isPro && <Lock className="h-3 w-3 text-muted-foreground" />}
                </label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <Button
                      key={diff}
                      variant={selectedDifficulty === diff ? "default" : "outline"}
                      size="sm"
                      onClick={() => isPro && setSelectedDifficulty(diff as any)}
                      disabled={!isPro}
                      className={`text-xs ${!isPro ? 'opacity-50' : ''}`}
                    >
                      {diff === 'easy' && '😊'}
                      {diff === 'medium' && '😐'}
                      {diff === 'hard' && '😤'}
                      {' '}{diff}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Priority
                  {!isPro && <Lock className="h-3 w-3 text-muted-foreground" />}
                </label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <Button
                      key={priority}
                      variant={selectedPriority === priority ? "default" : "outline"}
                      size="sm"
                      onClick={() => isPro && setSelectedPriority(priority as any)}
                      disabled={!isPro}
                      className={`text-xs ${!isPro ? 'opacity-50' : ''}`}
                    >
                      {priority === 'low' && '🟢'}
                      {priority === 'medium' && '🟡'}
                      {priority === 'high' && '🔴'}
                      {' '}{priority}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date
                  {!isPro && <Lock className="h-3 w-3 text-muted-foreground" />}
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => isPro && setDueDate(e.target.value)}
                  disabled={!isPro}
                  className={!isPro ? 'opacity-50' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Category
                  {!isPro && <Lock className="h-3 w-3 text-muted-foreground" />}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => isPro && setSelectedCategory(e.target.value)}
                  disabled={!isPro}
                  className={`w-full p-2 border rounded-md text-sm ${!isPro ? 'opacity-50 bg-muted' : ''}`}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {!isPro && showProFeatures && (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Crown className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-700 font-medium">
                Upgrade to PRO to unlock these advanced features!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Todos */}
      {pendingTodos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-blue-500" />
              Active Quests ({pendingTodos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTodos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTodo(todo.id)}
                  className="p-0 h-6 w-6"
                >
                  <Circle className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={todo.dueDate && isOverdue(todo.dueDate) ? 'text-red-600 font-medium' : ''}>
                      {todo.text}
                    </span>
                    {todo.dueDate && isOverdue(todo.dueDate) && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {todo.difficulty && (
                      <Badge className={getDifficultyColor(todo.difficulty)} variant="outline">
                        {todo.difficulty}
                      </Badge>
                    )}
                    {todo.priority && (
                      <Badge className={getPriorityColor(todo.priority)} variant="outline">
                        {todo.priority}
                      </Badge>
                    )}
                    {todo.category && (
                      <Badge variant="outline" className="text-xs">
                        {todo.category}
                      </Badge>
                    )}
                    {todo.dueDate && (
                      <Badge variant="outline" className="text-xs">
                        📅 {new Date(todo.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  +{todo.points} XP
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodo(todo.id)}
                  className="p-0 h-6 w-6 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Completed Quests ({completedTodos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTodos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTodo(todo.id)}
                  className="p-0 h-6 w-6"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="line-through text-muted-foreground">{todo.text}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {todo.difficulty && (
                      <Badge className={getDifficultyColor(todo.difficulty)} variant="outline">
                        {todo.difficulty}
                      </Badge>
                    )}
                    {todo.priority && (
                      <Badge className={getPriorityColor(todo.priority)} variant="outline">
                        {todo.priority}
                      </Badge>
                    )}
                    {todo.category && (
                      <Badge variant="outline" className="text-xs">
                        {todo.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +{todo.points} XP
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodo(todo.id)}
                  className="p-0 h-6 w-6 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {todos.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quests yet!</h3>
            <p className="text-muted-foreground mb-4">
              Create your first quest and start earning XP to level up!
            </p>
            <Button onClick={() => document.querySelector('input')?.focus()}>
              Create Your First Quest
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Level Up Dialog */}
      <Dialog open={isLevelUpDialogOpen} onOpenChange={setIsLevelUpDialogOpen}>
        <DialogContent className="sm:max-w-[400px] text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Crown className="h-16 w-16 text-yellow-500" />
                <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <DialogTitle className="text-2xl">🎉 Level Up!</DialogTitle>
            <DialogDescription className="text-lg">
              Congratulations! You've reached <strong>Level {newLevelAchieved}</strong>!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                Keep completing quests to unlock new achievements and earn more XP!
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            </div>
          </div>
          <DialogFooter className="justify-center">
            <Button onClick={() => setIsLevelUpDialogOpen(false)} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              <Trophy className="mr-2 h-4 w-4" />
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
