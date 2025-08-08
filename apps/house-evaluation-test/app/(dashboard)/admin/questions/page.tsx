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
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Edit,
  GripVertical,
  Plus,
  Save,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { EvaluationQuestionWithChoices } from "@/lib/evaluation/service";

interface QuestionFormData {
  id?: number;
  question: string;
  description: string;
  category: string;
  weight: number;
  isActive: boolean;
  sortOrder: number;
}

interface AnswerChoiceFormData {
  id?: number;
  answerText: string;
  answerValue: number;
  sortOrder: number;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<EvaluationQuestionWithChoices[]>(
    [],
  );
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionFormData | null>(null);
  const [editingChoices, setEditingChoices] = useState<AnswerChoiceFormData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/evaluation/questions");

      if (response.status === 401) {
        setError("Unauthorized access. Admin privileges required.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions");
      toast.error("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setEditingChoices([
      { answerText: "Excellent", answerValue: 100, sortOrder: 1 },
      { answerText: "Good", answerValue: 80, sortOrder: 2 },
      { answerText: "Average", answerValue: 60, sortOrder: 3 },
      { answerText: "Poor", answerValue: 40, sortOrder: 4 },
      { answerText: "Very Poor", answerValue: 20, sortOrder: 5 },
    ]);
  };

  const handleEditQuestion = (question: EvaluationQuestionWithChoices) => {
    setEditingQuestion({
      id: question.id,
      question: question.question,
      description: question.description || "",
      category: question.category,
      weight: question.weight,
      isActive: Boolean(question.isActive),
      sortOrder: question.sortOrder,
    });
    setEditingChoices(
      question.answerChoices.map((choice) => ({
        id: choice.id,
        answerText: choice.answerText,
        answerValue: choice.answerValue,
        sortOrder: choice.sortOrder,
      })),
    );
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion || editingChoices.length === 0) return;

    try {
      const response = await fetch("/api/admin/evaluation/questions", {
        method: editingQuestion.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: editingQuestion,
          answerChoices: editingChoices,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save question");
      }

      await fetchQuestions();
      resetForm();
      toast.success("Question saved successfully!");
    } catch (err) {
      console.error("Error saving question:", err);
      setError("Failed to save question");
      toast.error("Failed to save question. Please try again.");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(
        `/api/admin/evaluation/questions?id=${questionId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      await fetchQuestions();
      toast.success("Question deleted successfully!");
    } catch (err) {
      console.error("Error deleting question:", err);
      setError("Failed to delete question");
      toast.error("Failed to delete question. Please try again.");
    }
  };

  const addAnswerChoice = () => {
    const newChoice: AnswerChoiceFormData = {
      answerText: "",
      answerValue: 50,
      sortOrder: editingChoices.length + 1,
    };
    setEditingChoices([...editingChoices, newChoice]);
  };

  const removeAnswerChoice = (index: number) => {
    setEditingChoices(editingChoices.filter((_, i) => i !== index));
  };

  const updateAnswerChoice = (
    index: number,
    field: keyof AnswerChoiceFormData,
    value: string | number,
  ) => {
    setEditingChoices(
      editingChoices.map((choice, i) =>
        i === index ? { ...choice, [field]: value } : choice,
      ),
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
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Access Denied</CardTitle>
            </div>
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
        <h1 className="text-3xl font-bold mb-2">Question Management</h1>
        <p className="text-gray-600">
          Manage evaluation questions and answer choices. Admin access only.
        </p>
      </div>

      {/* Add/Edit Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingQuestion?.id ? "Edit Question" : "Add New Question"}
          </CardTitle>
          <CardDescription>
            Create or modify evaluation questions with answer choices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter the evaluation question"
                value={editingQuestion?.question || ""}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion!,
                    question: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional context or instructions"
                value={editingQuestion?.description || ""}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion!,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={editingQuestion?.category || ""}
                onValueChange={(value) =>
                  setEditingQuestion({
                    ...editingQuestion!,
                    category: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="structure">Structure</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="amenities">Amenities</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                  <SelectItem value="market">Market Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weight">Weight (%)</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                max="100"
                value={editingQuestion?.weight || ""}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion!,
                    weight: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="1"
                value={editingQuestion?.sortOrder || ""}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion!,
                    sortOrder: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Answer Choices</Label>
              <Button type="button" variant="outline" onClick={addAnswerChoice}>
                <Plus className="h-4 w-4 mr-2" />
                Add Choice
              </Button>
            </div>
            <div className="space-y-2">
              {editingChoices.map((choice, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Answer text"
                      value={choice.answerText}
                      onChange={(e) =>
                        updateAnswerChoice(index, "answerText", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Points"
                      value={choice.answerValue}
                      onChange={(e) =>
                        updateAnswerChoice(
                          index,
                          "answerValue",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Order"
                      value={choice.sortOrder}
                      onChange={(e) =>
                        updateAnswerChoice(
                          index,
                          "sortOrder",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAnswerChoice(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveQuestion}>
              <Save className="h-4 w-4 mr-2" />
              Save Question
            </Button>
            <Button variant="outline" onClick={resetForm}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Existing Questions</h2>
        {questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{question.question}</CardTitle>
                  {question.description && (
                    <CardDescription className="mt-1">
                      {question.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{question.category}</Badge>
                  <Badge variant="outline">{question.weight}% weight</Badge>
                  <Badge variant={question.isActive ? "default" : "secondary"}>
                    {question.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-medium">Answer Choices:</Label>
                <div className="grid gap-2">
                  {question.answerChoices.map((choice) => (
                    <div
                      key={choice.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span>{choice.answerText}</span>
                      <Badge variant="outline">{choice.answerValue} pts</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditQuestion(question)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
