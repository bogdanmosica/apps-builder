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
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: {
    id: number;
    propertyName: string | null;
    propertyType: { name: string | null };
  };
  onDelete: (evaluationId: number) => void;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  evaluation,
  onDelete,
}: DeleteConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/evaluation/${evaluation.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete evaluation");
      }

      // Update the local state
      onDelete(evaluation.id);

      toast.success("Property evaluation deleted successfully!");
      onClose();
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast.error("Failed to delete property evaluation");
    } finally {
      setIsLoading(false);
    }
  };

  const propertyDisplayName =
    evaluation.propertyName ||
    `${evaluation.propertyType.name} #${evaluation.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle>Delete Property Evaluation</DialogTitle>
              <DialogDescription className="mt-2">
                Are you sure you want to delete the evaluation for{" "}
                <span className="font-medium text-foreground">
                  {propertyDisplayName}
                </span>
                ?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All evaluation data, answers, and
            scores for this property will be permanently removed.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Evaluation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
