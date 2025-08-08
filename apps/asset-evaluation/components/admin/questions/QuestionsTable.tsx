"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  MessageCircleQuestion,
  Pencil,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import HydrationSafeDate from "../../hydration-safe-date";
import AddQuestionDialog from "./AddQuestionDialog";
import DeleteQuestionDialog from "./DeleteQuestionDialog";
import EditQuestionDialog from "./EditQuestionDialog";

interface Question {
  id: number;
  text_ro: string;
  text_en: string | null;
  weight: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionsTableProps {
  initialQuestions: Question[];
}

export default function QuestionsTable({
  initialQuestions,
}: QuestionsTableProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogState, setEditDialogState] = useState<{
    open: boolean;
    question: Question | null;
  }>({
    open: false,
    question: null,
  });
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    question: Question | null;
  }>({
    open: false,
    question: null,
  });

  // Handle creating a new question
  const handleAddQuestion = async (data: {
    text_ro: string;
    text_en: string | null;
    weight: number;
    categoryId: number;
  }) => {
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create question");
      }

      const result = await response.json();

      if (result.success) {
        // Add to local state
        setQuestions((prev) => [...prev, result.data]);
        toast.success("Question created successfully");
        setAddDialogOpen(false);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
    }
  };

  // Handle updating a question
  const handleUpdateQuestion = async (
    id: number,
    data: {
      text_ro: string;
      text_en: string | null;
      weight: number;
      categoryId: number;
    },
  ) => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      const result = await response.json();

      if (result.success) {
        // Update in local state
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, ...data } : q)),
        );
        toast.success("Question updated successfully");
        setEditDialogState({ open: false, question: null });
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  // Handle deleting a question
  const handleDeleteQuestion = async (id: number) => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        toast.success("Question deleted successfully");
        setDeleteDialogState({ open: false, question: null });

        // Refresh the page data
        router.refresh();
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  // Filter questions based on search query
  const filteredQuestions = questions.filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.text_ro.toLowerCase().includes(query) ||
      q.text_en?.toLowerCase().includes(query) ||
      false
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px] pl-9"
          />
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Question (Romanian)</TableHead>
              <TableHead>Question (English)</TableHead>
              <TableHead className="w-[100px]">Weight</TableHead>
              <TableHead className="w-[120px]">Category ID</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">{question.id}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {question.text_ro}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {question.text_en || "—"}
                  </TableCell>
                  <TableCell>{question.weight}</TableCell>
                  <TableCell>{question.categoryId}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <HydrationSafeDate date={question.createdAt} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setEditDialogState({ open: true, question })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteDialogState({ open: true, question })
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <div className="flex flex-col items-center gap-2">
                    <MessageCircleQuestion className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No questions found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Question Dialog */}
      <AddQuestionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddQuestion}
      />

      {/* Edit Question Dialog */}
      <EditQuestionDialog
        open={editDialogState.open}
        question={editDialogState.question}
        onOpenChange={(open: boolean) =>
          setEditDialogState({
            open,
            question: open ? editDialogState.question : null,
          })
        }
        onSubmit={handleUpdateQuestion}
      />

      {/* Delete Question Dialog */}
      <DeleteQuestionDialog
        open={deleteDialogState.open}
        question={deleteDialogState.question}
        onOpenChange={(open: boolean) =>
          setDeleteDialogState({
            open,
            question: open ? deleteDialogState.question : null,
          })
        }
        onDelete={handleDeleteQuestion}
      />
    </div>
  );
}
