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
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Question {
  id: number;
  text_ro: string;
  text_en: string | null;
  weight: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DeleteQuestionDialogProps {
  open: boolean;
  question: Question | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: number) => void;
}

export default function DeleteQuestionDialog({
  open,
  question,
  onOpenChange,
  onDelete,
}: DeleteQuestionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!question) return;

    setIsDeleting(true);
    try {
      await onDelete(question.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Question
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this question? This action cannot be
            undone and will remove all associated answers and evaluation data.
          </DialogDescription>
        </DialogHeader>

        {question && (
          <div className="py-4">
            <div className="rounded-md border p-3 bg-muted/50">
              <p className="text-sm font-medium mb-1">Question to delete:</p>
              <p className="text-sm text-muted-foreground">
                {question.text_ro}
              </p>
              {question.text_en && (
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">English:</span>{" "}
                  {question.text_en}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Weight: {question.weight} | Category ID: {question.categoryId}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
