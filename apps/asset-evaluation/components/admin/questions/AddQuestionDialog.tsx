'use client';

import { useState } from 'react';
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

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { text_ro: string; text_en: string | null; weight: number; categoryId: number }) => void;
}

export default function AddQuestionDialog({ open, onOpenChange, onSubmit }: AddQuestionDialogProps) {
  const [formData, setFormData] = useState({
    text_ro: '',
    text_en: '',
    weight: 1,
    categoryId: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text_ro.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        text_ro: formData.text_ro.trim(),
        text_en: formData.text_en.trim() || null,
        weight: formData.weight,
        categoryId: formData.categoryId,
      });
      
      // Reset form
      setFormData({
        text_ro: '',
        text_en: '',
        weight: 1,
        categoryId: 1,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset form when dialog closes
        setFormData({
          text_ro: '',
          text_en: '',
          weight: 1,
          categoryId: 1,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for property evaluations. Provide both Romanian and English versions if possible.
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
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.text_ro.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
