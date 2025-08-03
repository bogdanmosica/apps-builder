'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: {
    id: number;
    propertyName: string | null;
    propertyType: {
      name: string;
    };
  };
  onSuccess: () => void;
}

export default function DeleteConfirmationDialog({ 
  isOpen, 
  onClose, 
  evaluation, 
  onSuccess 
}: DeleteConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/evaluation/${evaluation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete evaluation');
      }

      toast.success('Property evaluation deleted successfully!');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast.error('Failed to delete evaluation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const propertyName = evaluation.propertyName || `${evaluation.propertyType.name} #${evaluation.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Property Evaluation
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the evaluation for "{propertyName}"? 
            This action cannot be undone and will permanently remove all evaluation data.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-start">
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete Evaluation'}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
