'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Answer {
  id: number;
  text_ro: string;
  text_en: string;
  weight: number;
  questionId: number;
}

interface Question {
  id: number;
  text_ro: string;
  text_en: string;
  weight: number;
  categoryId: number;
  answers: Answer[];
}

interface AnswerFormData {
  id: number | string; // Can be existing ID (number) or temporary ID (string)
  text_ro: string;
  text_en: string;
  weight: number;
  isNew?: boolean;
  toDelete?: boolean;
}

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onSuccess: () => void;
}

export default function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSuccess,
}: EditQuestionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text_ro: '',
    text_en: '',
    weight: 10,
  });
  const [answers, setAnswers] = useState<AnswerFormData[]>([]);

  // Reset form when question changes
  useEffect(() => {
    if (question) {
      setFormData({
        text_ro: question.text_ro,
        text_en: question.text_en,
        weight: question.weight,
      });
      setAnswers(question.answers.map(answer => ({
        ...answer,
        isNew: false,
        toDelete: false,
      })));
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question) {
      toast.error('No question selected');
      return;
    }

    if (!formData.text_ro.trim() || !formData.text_en.trim()) {
      toast.error('Please fill in both Romanian and English question text');
      return;
    }

    const activeAnswers = answers.filter(answer => !answer.toDelete);
    if (activeAnswers.length < 2) {
      toast.error('Please provide at least 2 answers');
      return;
    }

    const invalidAnswers = activeAnswers.some(answer => 
      !answer.text_ro.trim() || !answer.text_en.trim() || answer.weight < 0
    );

    if (invalidAnswers) {
      toast.error('Please fill in all answer fields with valid values');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          answers: activeAnswers.map(answer => ({
            id: typeof answer.id === 'number' ? answer.id : undefined,
            text_ro: answer.text_ro,
            text_en: answer.text_en,
            weight: answer.weight,
            isNew: answer.isNew,
          })),
          deletedAnswerIds: answers
            .filter(answer => answer.toDelete && typeof answer.id === 'number')
            .map(answer => answer.id as number),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update question');
      }

      toast.success('Question updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'weight' ? parseInt(e.target.value) || 0 : e.target.value,
    }));
  };

  const handleAnswerChange = (answerId: number | string, field: keyof Omit<AnswerFormData, 'id' | 'isNew' | 'toDelete'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId 
        ? { ...answer, [field]: field === 'weight' ? parseInt(e.target.value) || 0 : e.target.value }
        : answer
    ));
  };

  const addAnswer = () => {
    const newId = `new_${Date.now()}`;
    setAnswers(prev => [...prev, { 
      id: newId, 
      text_ro: '', 
      text_en: '', 
      weight: 0, 
      isNew: true, 
      toDelete: false 
    }]);
  };

  const removeAnswer = (answerId: number | string) => {
    const activeAnswers = answers.filter(answer => !answer.toDelete);
    if (activeAnswers.length <= 2) {
      toast.error('At least 2 answers are required');
      return;
    }

    setAnswers(prev => prev.map(answer => 
      answer.id === answerId 
        ? { ...answer, toDelete: !answer.toDelete }
        : answer
    ));
  };

  const activeAnswers = answers.filter(answer => !answer.toDelete);
  const isValid = formData.text_ro.trim() && 
                 formData.text_en.trim() && 
                 activeAnswers.length >= 2 && 
                 activeAnswers.every(answer => answer.text_ro.trim() && answer.text_en.trim() && answer.weight >= 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Modify the question text, weight, and answer options.
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
                  <div 
                    key={answer.id} 
                    className={`border rounded-lg p-4 space-y-3 ${answer.toDelete ? 'opacity-50 bg-red-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Answer {index + 1} 
                        {answer.isNew && <span className="text-blue-500 ml-1">(New)</span>}
                        {answer.toDelete && <span className="text-red-500 ml-1">(To Delete)</span>}
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeAnswer(answer.id)}
                      >
                        {answer.toDelete ? 'Restore' : <Trash2 className="w-3 h-3" />}
                      </Button>
                    </div>
                    
                    {!answer.toDelete && (
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
                    )}
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
              {loading ? 'Updating...' : 'Update Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
