'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { toast } from 'sonner';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTypeId: number;
  onSuccess: () => void;
}

export default function AddCategoryDialog({
  open,
  onOpenChange,
  propertyTypeId,
  onSuccess,
}: AddCategoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_ro: '',
    name_en: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name_ro.trim() || !formData.name_en.trim()) {
      toast.error('Please fill in both Romanian and English names');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/question-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          propertyTypeId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }

      toast.success('Category created successfully');
      setFormData({ name_ro: '', name_en: '' });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const isValid = formData.name_ro.trim() && formData.name_en.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new question category for the selected property type.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name_en">Category Name (English)</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={handleInputChange('name_en')}
                placeholder="e.g., Utilities"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name_ro">Category Name (Romanian)</Label>
              <Input
                id="name_ro"
                value={formData.name_ro}
                onChange={handleInputChange('name_ro')}
                placeholder="e.g., Utilități"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || loading}
            >
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
