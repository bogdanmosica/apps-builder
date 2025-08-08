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
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AddPropertyTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name_ro: string; name_en: string | null }) => void;
}

export default function AddPropertyTypeDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddPropertyTypeDialogProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name_ro: "",
    name_en: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name_ro?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: { name_ro?: string } = {};

    if (!formData.name_ro.trim()) {
      newErrors.name_ro = "Romanian name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    setIsSubmitting(true);

    onSubmit({
      name_ro: formData.name_ro.trim(),
      name_en: formData.name_en.trim() || null,
    });

    // Reset form
    setFormData({ name_ro: "", name_en: "" });
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Property Type</DialogTitle>
            <DialogDescription>
              Create a new property type that will be available for evaluations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name_ro" className="required">
                Name (Romanian)
              </Label>
              <Input
                id="name_ro"
                name="name_ro"
                value={formData.name_ro}
                onChange={handleChange}
                placeholder="e.g. Apartament"
                className={errors.name_ro ? "border-red-500" : ""}
                autoComplete="off"
              />
              {errors.name_ro && (
                <p className="text-sm text-red-500">{errors.name_ro}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name_en">Name (English)</Label>
              <Input
                id="name_en"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                placeholder="e.g. Apartment"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Will be shown to users with English language
                preference.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Property Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
