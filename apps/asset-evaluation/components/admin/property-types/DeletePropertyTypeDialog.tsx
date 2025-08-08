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
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface PropertyType {
  id: number;
  name_ro: string;
  name_en: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DeletePropertyTypeDialogProps {
  open: boolean;
  propertyType: PropertyType | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: number) => void;
}

export default function DeletePropertyTypeDialog({
  open,
  propertyType,
  onOpenChange,
  onDelete,
}: DeletePropertyTypeDialogProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!propertyType) return;

    setIsDeleting(true);
    await onDelete(propertyType.id);
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle>Delete Property Type</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete the property type "
            {propertyType?.name_ro}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="rounded-md bg-destructive/10 p-4">
            <p className="text-sm text-destructive font-medium">Warning:</p>
            <p className="text-sm text-destructive/90 mt-1">
              Deleting this property type will also remove all associated
              categories and questions. Any existing evaluations for this
              property type will still remain but may not display correctly.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
