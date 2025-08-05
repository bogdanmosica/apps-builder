'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: number;
  name_ro: string;
  name_en: string;
  propertyTypeId: number;
}

interface AnswerFormData {
  id: string; // temporary ID for form management
  text_ro: string;
  text_en: string;
  weight: number;
}

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export default function AddQuestionDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: AddQuestionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text_ro: '',
    text_en: '',
    weight: 10,
  });
  const [answers, setAnswers] = useState<AnswerFormData[]>([
    { id: '1', text_ro: '', text_en: '', weight: 10 },
    { id: '2', text_ro: '', text_en: '', weight: 5 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) {
      toast.error('No category selected');
      return;
    }

    if (!formData.text_ro.trim() || !formData.text_en.trim()) {
      toast.error('Please fill in both Romanian and English question text');
      return;
    }

    if (answers.length < 2) {
      toast.error('Please provide at least 2 answers');
      return;
    }

    const invalidAnswers = answers.some(answer => 
      !answer.text_ro.trim() || !answer.text_en.trim() || answer.weight < 0
    );

    if (invalidAnswers) {
      toast.error('Please fill in all answer fields with valid values');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: category.id,
          answers: answers.map(({ id, ...answer }) => answer), // Remove temporary ID
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create question');
      }

      toast.success('Question created successfully');
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ text_ro: '', text_en: '', weight: 10 });
    setAnswers([
      { id: '1', text_ro: '', text_en: '', weight: 10 },
      { id: '2', text_ro: '', text_en: '', weight: 5 },
    ]);
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'weight' ? parseInt(e.target.value) || 0 : e.target.value,
    }));
  };

  const handleAnswerChange = (answerId: string, field: keyof Omit<AnswerFormData, 'id'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId 
        ? { ...answer, [field]: field === 'weight' ? parseInt(e.target.value) || 0 : e.target.value }
        : answer
    ));
  };

  const addAnswer = () => {
    const newId = (Math.max(...answers.map(a => parseInt(a.id))) + 1).toString();
    setAnswers(prev => [...prev, { id: newId, text_ro: '', text_en: '', weight: 0 }]);
  };

  const removeAnswer = (answerId: string) => {
    if (answers.length <= 2) {
      toast.error('At least 2 answers are required');
      return;
    }
    setAnswers(prev => prev.filter(answer => answer.id !== answerId));
  };

  const isValid = formData.text_ro.trim() && 
                 formData.text_en.trim() && 
                 answers.length >= 2 && 
                 answers.every(answer => answer.text_ro.trim() && answer.text_en.trim() && answer.weight >= 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Create a new question for the category: {category?.name_en} / {category?.name_ro}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Question Details */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="text_en">Question Text (English)</Label>
                <Textarea
                  id="text_en"
                  value={formData.text_en}
                  onChange={handleInputChange('text_en')}
                  placeholder="Enter the question in English..."
                  required
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="text_ro">Question Text (Romanian)</Label>
                <Textarea
                  id="text_ro"
                  value={formData.text_ro}
                  onChange={handleInputChange('text_ro')}
                  placeholder="Enter the question in Romanian..."
                  required
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="weight">Question Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange('weight')}
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>

            {/* Answers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Answer Options</CardTitle>
                  <Button type="button" size="sm" onClick={addAnswer}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Answer
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {answers.map((answer, index) => (
                  <div key={answer.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Answer {index + 1}</Label>
                      {answers.length > 2 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeAnswer(answer.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Input
                        placeholder="Answer text (English)"
                        value={answer.text_en}
                        onChange={handleAnswerChange(answer.id, 'text_en')}
                        required
                      />
                      <Input
                        placeholder="Answer text (Romanian)"
                        value={answer.text_ro}
                        onChange={handleAnswerChange(answer.id, 'text_ro')}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Weight"
                        value={answer.weight}
                        onChange={handleAnswerChange(answer.id, 'weight')}
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
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
              {loading ? 'Creating...' : 'Create Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
