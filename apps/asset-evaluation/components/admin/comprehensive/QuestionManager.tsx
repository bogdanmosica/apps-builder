"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  MessageSquare,
  Pencil,
  Plus,
  Star,
  Trash,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLocalizedText } from "@/lib/evaluation-utils";
import type { PropertyTypeWithRelations } from "@/lib/types/admin";

interface QuestionManagerProps {
  propertyType: PropertyTypeWithRelations;
  onUpdate: (updatedPropertyTypes: PropertyTypeWithRelations[]) => void;
  language: "ro" | "en";
}

interface EditingQuestionState {
  id: number | null;
  text_ro: string;
  text_en: string;
  weight: number;
  categoryId: number;
}

interface EditingAnswerState {
  id: number | null;
  text_ro: string;
  text_en: string;
  weight: number;
  questionId: number;
}

export default function QuestionManager({
  propertyType,
  onUpdate,
  language,
}: QuestionManagerProps) {
  const [editingQuestion, setEditingQuestion] = useState<EditingQuestionState>({
    id: null,
    text_ro: "",
    text_en: "",
    weight: 1,
    categoryId: 0,
  });
  const [editingAnswer, setEditingAnswer] = useState<EditingAnswerState>({
    id: null,
    text_ro: "",
    text_en: "",
    weight: 1,
    questionId: 0,
  });
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [addingAnswer, setAddingAnswer] = useState<number | null>(null); // questionId when adding answer
  const [newQuestion, setNewQuestion] = useState({
    text_ro: "",
    text_en: "",
    weight: 1,
    categoryId: 0,
  });
  const [newAnswer, setNewAnswer] = useState({
    text_ro: "",
    text_en: "",
    weight: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  // Dialog state for delete confirmations
  const [deleteQuestionDialogOpen, setDeleteQuestionDialogOpen] =
    useState(false);
  const [deleteAnswerDialogOpen, setDeleteAnswerDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const [answerToDelete, setAnswerToDelete] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);
  const [isDeletingAnswer, setIsDeletingAnswer] = useState(false);

  // Get all questions across all categories
  const allQuestions = propertyType.questionCategories.flatMap((cat) =>
    cat.questions.map((q) => ({
      ...q,
      categoryName: cat.name_ro,
      categoryId: cat.id,
    })),
  );

  // Start editing a question
  const startEditQuestion = (question: any) => {
    setEditingQuestion({
      id: question.id,
      text_ro: question.text_ro,
      text_en: question.text_en || "",
      weight: question.weight,
      categoryId: question.categoryId,
    });
  };

  // Start editing an answer
  const startEditAnswer = (answer: any) => {
    setEditingAnswer({
      id: answer.id,
      text_ro: answer.text_ro,
      text_en: answer.text_en || "",
      weight: answer.weight,
      questionId: answer.questionId,
    });
  };

  // Cancel editing
  const cancelEditQuestion = () => {
    setEditingQuestion({
      id: null,
      text_ro: "",
      text_en: "",
      weight: 1,
      categoryId: 0,
    });
  };

  const cancelEditAnswer = () => {
    setEditingAnswer({
      id: null,
      text_ro: "",
      text_en: "",
      weight: 1,
      questionId: 0,
    });
  };

  // Save question edit
  const saveQuestionEdit = async () => {
    if (!editingQuestion.id || !editingQuestion.text_ro.trim()) {
      toast.error("Romanian question text is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/questions/${editingQuestion.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text_ro: editingQuestion.text_ro.trim(),
            text_en: editingQuestion.text_en.trim() || null,
            weight: editingQuestion.weight,
            categoryId: editingQuestion.categoryId,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to update question");

      const result = await response.json();
      if (result.success) {
        // Refresh to get updated data
        window.location.reload();
        cancelEditQuestion();
        toast.success("Question updated successfully");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save answer edit
  const saveAnswerEdit = async () => {
    if (!editingAnswer.id || !editingAnswer.text_ro.trim()) {
      toast.error("Romanian answer text is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/answers/${editingAnswer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text_ro: editingAnswer.text_ro.trim(),
          text_en: editingAnswer.text_en.trim() || null,
          weight: editingAnswer.weight,
        }),
      });

      if (!response.ok) throw new Error("Failed to update answer");

      const result = await response.json();
      if (result.success) {
        // Refresh to get updated data
        window.location.reload();
        cancelEditAnswer();
        toast.success("Answer updated successfully");
      }
    } catch (error) {
      console.error("Error updating answer:", error);
      toast.error("Failed to update answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new question
  const handleAddQuestion = async () => {
    if (!newQuestion.text_ro.trim()) {
      toast.error("Romanian question text is required");
      return;
    }

    if (!newQuestion.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text_ro: newQuestion.text_ro.trim(),
          text_en: newQuestion.text_en.trim() || null,
          weight: newQuestion.weight,
          categoryId: newQuestion.categoryId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create question");

      const result = await response.json();
      if (result.success) {
        window.location.reload();
        setNewQuestion({ text_ro: "", text_en: "", weight: 1, categoryId: 0 });
        setAddingQuestion(false);
        toast.success("Question created successfully");
      }
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new answer
  const handleAddAnswer = async (questionId: number) => {
    if (!newAnswer.text_ro.trim()) {
      toast.error("Romanian answer text is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text_ro: newAnswer.text_ro.trim(),
          text_en: newAnswer.text_en.trim() || null,
          weight: newAnswer.weight,
          questionId: questionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create answer");

      const result = await response.json();
      if (result.success) {
        window.location.reload();
        setNewAnswer({ text_ro: "", text_en: "", weight: 1 });
        setAddingAnswer(null);
        toast.success("Answer created successfully");
      }
    } catch (error) {
      console.error("Error creating answer:", error);
      toast.error("Failed to create answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (id: number) => {
    const question = allQuestions.find((q) => q.id === id);
    if (!question) return;

    setQuestionToDelete({
      id,
      text: getLocalizedText(question.text_ro, question.text_en, language),
    });
    setDeleteQuestionDialogOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete || isDeletingQuestion) return;

    setIsDeletingQuestion(true);
    try {
      const response = await fetch(
        `/api/admin/questions/${questionToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to delete question");

      const result = await response.json();
      if (result.success) {
        window.location.reload();
        toast.success("Question deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    } finally {
      setIsDeletingQuestion(false);
      setDeleteQuestionDialogOpen(false);
      setQuestionToDelete(null);
    }
  };

  // Delete answer
  const handleDeleteAnswer = async (id: number) => {
    // Find the answer across all questions
    let answerToFind: any = null;
    for (const question of allQuestions) {
      answerToFind = question.answers.find((a: any) => a.id === id);
      if (answerToFind) break;
    }

    if (!answerToFind) return;

    setAnswerToDelete({
      id,
      text: getLocalizedText(
        answerToFind.text_ro,
        answerToFind.text_en,
        language,
      ),
    });
    setDeleteAnswerDialogOpen(true);
  };

  const confirmDeleteAnswer = async () => {
    if (!answerToDelete || isDeletingAnswer) return;

    setIsDeletingAnswer(true);
    try {
      const response = await fetch(`/api/admin/answers/${answerToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete answer");

      const result = await response.json();
      if (result.success) {
        window.location.reload();
        toast.success("Answer deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting answer:", error);
      toast.error("Failed to delete answer");
    } finally {
      setIsDeletingAnswer(false);
      setDeleteAnswerDialogOpen(false);
      setAnswerToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Questions & Answers for "
            {getLocalizedText(
              propertyType.name_ro,
              propertyType.name_en,
              language,
            )}
            "
          </h3>
          <p className="text-muted-foreground text-sm">
            Manage questions, their answers, and weights. Each question must
            have at least 2 answers.
          </p>
        </div>
        <Button
          onClick={() => setAddingQuestion(true)}
          disabled={
            addingQuestion || propertyType.questionCategories.length === 0
          }
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Add New Question Form */}
      {addingQuestion && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">Add New Question</CardTitle>
            <CardDescription>
              Create a new question with Romanian and English text, and assign
              it to a category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={newQuestion.categoryId.toString()}
                onValueChange={(value) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    categoryId: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {propertyType.questionCategories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {getLocalizedText(
                        category.name_ro,
                        category.name_en,
                        language,
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="ro" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ro">🇷🇴 Romanian</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
              </TabsList>
              <TabsContent value="ro" className="space-y-2">
                <label className="text-sm font-medium">
                  Romanian Question *
                </label>
                <Textarea
                  placeholder="e.g., Care este starea fundației?"
                  value={newQuestion.text_ro}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      text_ro: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </TabsContent>
              <TabsContent value="en" className="space-y-2">
                <label className="text-sm font-medium">
                  English Question *
                </label>
                <Textarea
                  placeholder="e.g., What is the condition of the foundation?"
                  value={newQuestion.text_en}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      text_en: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <label className="text-sm font-medium">Weight (1-10)</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newQuestion.weight}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    weight: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddingQuestion(false);
                  setNewQuestion({
                    text_ro: "",
                    text_en: "",
                    weight: 1,
                    categoryId: 0,
                  });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddQuestion}
                disabled={
                  isSubmitting ||
                  !newQuestion.text_ro.trim() ||
                  !newQuestion.categoryId
                }
              >
                {isSubmitting ? "Adding..." : "Add Question"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            All Questions ({allQuestions.length})
          </CardTitle>
          <CardDescription>
            Click on a question to view and manage its answers. Questions are
            grouped by category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allQuestions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No questions found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                {propertyType.questionCategories.length === 0
                  ? "Create categories first, then add questions."
                  : "Add a question to get started."}
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={expandedQuestions}
              onValueChange={setExpandedQuestions}
              className="space-y-4"
            >
              {propertyType.questionCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  {(category.questions?.length || 0) > 0 && (
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Badge variant="outline">
                        {getLocalizedText(
                          category.name_ro,
                          category.name_en,
                          language,
                        )}
                      </Badge>
                    </div>
                  )}

                  {(category.questions || []).map((question) => {
                    const isEditingQ = editingQuestion.id === question.id;
                    const missingEnglish = !question.text_en;
                    const hasMinAnswers = question.answers.length >= 2;

                    return (
                      <AccordionItem
                        key={question.id}
                        value={question.id.toString()}
                        className="border-none"
                      >
                        <Card
                          className={!hasMinAnswers ? "border-yellow-200" : ""}
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-start gap-3 text-left">
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <Badge variant="outline" className="text-xs">
                                    Weight: {question.weight}
                                  </Badge>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {getLocalizedText(
                                      question.text_ro,
                                      question.text_en,
                                      language,
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {question.answers.length} answers
                                    </Badge>
                                    {!hasMinAnswers && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        Needs more answers
                                      </Badge>
                                    )}
                                    {missingEnglish && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        Missing English
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div
                                className="flex gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                  onClick={() =>
                                    startEditQuestion({
                                      ...question,
                                      categoryId: category.id,
                                    })
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </div>
                                <div
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                  onClick={() =>
                                    handleDeleteQuestion(question.id)
                                  }
                                >
                                  <Trash className="h-4 w-4" />
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="px-4 pb-4">
                            {/* Question Edit Form */}
                            {isEditingQ && (
                              <Card className="mb-4 border-blue-200">
                                <CardContent className="p-4 space-y-4">
                                  <div className="text-sm font-medium">
                                    Edit Question
                                  </div>
                                  <Tabs defaultValue="ro" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="ro">
                                        🇷🇴 Romanian
                                      </TabsTrigger>
                                      <TabsTrigger value="en">
                                        🇬🇧 English
                                      </TabsTrigger>
                                    </TabsList>
                                    <TabsContent
                                      value="ro"
                                      className="space-y-2"
                                    >
                                      <Textarea
                                        value={editingQuestion.text_ro}
                                        onChange={(e) =>
                                          setEditingQuestion((prev) => ({
                                            ...prev,
                                            text_ro: e.target.value,
                                          }))
                                        }
                                        rows={3}
                                      />
                                    </TabsContent>
                                    <TabsContent
                                      value="en"
                                      className="space-y-2"
                                    >
                                      <Textarea
                                        value={editingQuestion.text_en}
                                        onChange={(e) =>
                                          setEditingQuestion((prev) => ({
                                            ...prev,
                                            text_en: e.target.value,
                                          }))
                                        }
                                        rows={3}
                                      />
                                    </TabsContent>
                                  </Tabs>
                                  <div className="flex items-center gap-4">
                                    <div className="space-y-1">
                                      <label className="text-xs">Weight</label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={editingQuestion.weight}
                                        onChange={(e) =>
                                          setEditingQuestion((prev) => ({
                                            ...prev,
                                            weight:
                                              parseInt(e.target.value) || 1,
                                          }))
                                        }
                                        className="w-20"
                                      />
                                    </div>
                                    <div className="flex gap-2 ml-auto">
                                      <Button
                                        size="sm"
                                        onClick={saveQuestionEdit}
                                        disabled={isSubmitting}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={cancelEditQuestion}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Answers Table */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">
                                  Answers ({question.answers.length})
                                </h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setAddingAnswer(question.id)}
                                  className="gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Answer
                                </Button>
                              </div>

                              {/* Add Answer Form */}
                              {addingAnswer === question.id && (
                                <Card className="border-green-200">
                                  <CardContent className="p-4 space-y-3">
                                    <div className="text-sm font-medium">
                                      Add New Answer
                                    </div>
                                    <Tabs defaultValue="ro" className="w-full">
                                      <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="ro">
                                          🇷🇴 Romanian
                                        </TabsTrigger>
                                        <TabsTrigger value="en">
                                          🇬🇧 English
                                        </TabsTrigger>
                                      </TabsList>
                                      <TabsContent
                                        value="ro"
                                        className="space-y-2"
                                      >
                                        <Input
                                          placeholder="Romanian answer text"
                                          value={newAnswer.text_ro}
                                          onChange={(e) =>
                                            setNewAnswer((prev) => ({
                                              ...prev,
                                              text_ro: e.target.value,
                                            }))
                                          }
                                        />
                                      </TabsContent>
                                      <TabsContent
                                        value="en"
                                        className="space-y-2"
                                      >
                                        <Input
                                          placeholder="English answer text"
                                          value={newAnswer.text_en}
                                          onChange={(e) =>
                                            setNewAnswer((prev) => ({
                                              ...prev,
                                              text_en: e.target.value,
                                            }))
                                          }
                                        />
                                      </TabsContent>
                                    </Tabs>
                                    <div className="flex items-center gap-4">
                                      <div className="space-y-1">
                                        <label className="text-xs">
                                          Weight
                                        </label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={newAnswer.weight}
                                          onChange={(e) =>
                                            setNewAnswer((prev) => ({
                                              ...prev,
                                              weight:
                                                parseInt(e.target.value) || 1,
                                            }))
                                          }
                                          className="w-20"
                                        />
                                      </div>
                                      <div className="flex gap-2 ml-auto">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleAddAnswer(question.id)
                                          }
                                          disabled={
                                            isSubmitting ||
                                            !newAnswer.text_ro.trim()
                                          }
                                        >
                                          Add
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setAddingAnswer(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {question.answers.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">
                                    No answers yet. Add at least 2 answers.
                                  </p>
                                </div>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Romanian Text</TableHead>
                                      <TableHead>English Text</TableHead>
                                      <TableHead className="w-20">
                                        Weight
                                      </TableHead>
                                      <TableHead className="w-24">
                                        Actions
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {question.answers.map((answer) => {
                                      const isEditingA =
                                        editingAnswer.id === answer.id;

                                      return (
                                        <TableRow key={answer.id}>
                                          <TableCell>
                                            {isEditingA ? (
                                              <Input
                                                value={editingAnswer.text_ro}
                                                onChange={(e) =>
                                                  setEditingAnswer((prev) => ({
                                                    ...prev,
                                                    text_ro: e.target.value,
                                                  }))
                                                }
                                              />
                                            ) : (
                                              answer.text_ro
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {isEditingA ? (
                                              <Input
                                                value={editingAnswer.text_en}
                                                onChange={(e) =>
                                                  setEditingAnswer((prev) => ({
                                                    ...prev,
                                                    text_en: e.target.value,
                                                  }))
                                                }
                                              />
                                            ) : (
                                              <div className="flex items-center gap-2">
                                                {answer.text_en || "—"}
                                                {!answer.text_en && (
                                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                )}
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {isEditingA ? (
                                              <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={editingAnswer.weight}
                                                onChange={(e) =>
                                                  setEditingAnswer((prev) => ({
                                                    ...prev,
                                                    weight:
                                                      parseInt(
                                                        e.target.value,
                                                      ) || 1,
                                                  }))
                                                }
                                                className="w-16"
                                              />
                                            ) : (
                                              <Badge variant="outline">
                                                {answer.weight}
                                              </Badge>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {isEditingA ? (
                                              <div className="flex gap-1">
                                                <Button
                                                  size="icon"
                                                  variant="outline"
                                                  className="h-7 w-7"
                                                  onClick={saveAnswerEdit}
                                                  disabled={isSubmitting}
                                                >
                                                  <Check className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-7 w-7"
                                                  onClick={cancelEditAnswer}
                                                >
                                                  <X className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            ) : (
                                              <div className="flex gap-1">
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-7 w-7"
                                                  onClick={() =>
                                                    startEditAnswer({
                                                      ...answer,
                                                      questionId: question.id,
                                                    })
                                                  }
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-7 w-7"
                                                  onClick={() =>
                                                    handleDeleteAnswer(
                                                      answer.id,
                                                    )
                                                  }
                                                  disabled={
                                                    question.answers.length <= 2
                                                  }
                                                >
                                                  <Trash className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </AccordionContent>
                        </Card>
                      </AccordionItem>
                    );
                  })}
                </div>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Delete question confirmation dialog */}
      <Dialog
        open={deleteQuestionDialogOpen}
        onOpenChange={setDeleteQuestionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{questionToDelete?.text}" and all
              its answers? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteQuestionDialogOpen(false);
                setQuestionToDelete(null);
              }}
              disabled={isDeletingQuestion}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteQuestion}
              disabled={isDeletingQuestion}
            >
              {isDeletingQuestion ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete answer confirmation dialog */}
      <Dialog
        open={deleteAnswerDialogOpen}
        onOpenChange={setDeleteAnswerDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Answer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{answerToDelete?.text}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteAnswerDialogOpen(false);
                setAnswerToDelete(null);
              }}
              disabled={isDeletingAnswer}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAnswer}
              disabled={isDeletingAnswer}
            >
              {isDeletingAnswer ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
