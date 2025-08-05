'use client';

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

interface Question {
  id: number;
  text_ro: string;
  text_en: string | null;
  weight: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EditQuestionDialogProps {
  open: boolean;
  question: Question | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: { text_ro: string; text_en: string | null; weight: number; categoryId: number }) => void;
}

export default function EditQuestionDialog({ open, question, onOpenChange, onSubmit }: EditQuestionDialogProps) {
  const [formData, setFormData] = useState({
    text_ro: '',
    text_en: '',
    weight: 1,
    categoryId: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (question) {
      setFormData({
        text_ro: question.text_ro,
        text_en: question.text_en || '',
        weight: question.weight,
        categoryId: question.categoryId,
      });
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question || !formData.text_ro.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(question.id, {
        text_ro: formData.text_ro.trim(),
        text_en: formData.text_en.trim() || null,
        weight: formData.weight,
        categoryId: formData.categoryId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question details. Make sure to provide accurate information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text_ro">Question (Romanian) *</Label>
              <Textarea
                id="text_ro"
                placeholder="Enter question in Romanian..."
                value={formData.text_ro}
                onChange={(e) => setFormData(prev => ({ ...prev, text_ro: e.target.value }))}
                required
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="text_en">Question (English)</Label>
              <Textarea
                id="text_en"
                placeholder="Enter question in English (optional)..."
                value={formData.text_en}
                onChange={(e) => setFormData(prev => ({ ...prev, text_en: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Category ID</Label>
                <Select 
                  value={formData.categoryId.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Category 1</SelectItem>
                    <SelectItem value="2">Category 2</SelectItem>
                    <SelectItem value="3">Category 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.text_ro.trim()}>
              {isSubmitting ? 'Updating...' : 'Update Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
