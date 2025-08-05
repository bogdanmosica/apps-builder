'use client';

import { useState } from 'react';
import { PropertyTypeWithRelations, CategoryWithRelations } from '@/lib/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@workspace/ui/components/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { getLocalizedText } from '@/lib/evaluation-utils';
import { Plus, Pencil, Trash, Check, X, AlertTriangle, FolderOpen, MessageCircleQuestion } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryManagerProps {
  propertyType: PropertyTypeWithRelations;
  onUpdate: (updatedPropertyTypes: PropertyTypeWithRelations[]) => void;
  language: 'ro' | 'en';
}

interface EditingState {
  id: number | null;
  name_ro: string;
  name_en: string;
}

export default function CategoryManager({ propertyType, onUpdate, language }: CategoryManagerProps) {
  const [editing, setEditing] = useState<EditingState>({ id: null, name_ro: '', name_en: '' });
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({ name_ro: '', name_en: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Start editing a category
  const startEdit = (category: CategoryWithRelations) => {
    setEditing({
      id: category.id,
      name_ro: category.name_ro,
      name_en: category.name_en || '',
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditing({ id: null, name_ro: '', name_en: '' });
  };

  // Save edit
  const saveEdit = async () => {
    if (!editing.id || !editing.name_ro.trim()) {
      toast.error('Romanian name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/question-categories/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ro: editing.name_ro.trim(),
          name_en: editing.name_en.trim() || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update category');

      const result = await response.json();
      if (result.success) {
        // Update the local state by finding and updating the specific property type
        const updatedPropertyType = {
          ...propertyType,
          questionCategories: propertyType.questionCategories.map(cat =>
            cat.id === editing.id
              ? { ...cat, name_ro: editing.name_ro.trim(), name_en: editing.name_en.trim() || null }
              : cat
          ),
        };
        
        // We need to update this in the parent component's array
        // This is a simplified approach - in a real app you'd want better state management
        window.location.reload(); // For now, refresh to get updated data
        
        setEditing({ id: null, name_ro: '', name_en: '' });
        toast.success('Category updated successfully');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding new category
  const handleAdd = async () => {
    if (!newCategory.name_ro.trim()) {
      toast.error('Romanian name is required');
      return;
    }

    if (!newCategory.name_en.trim()) {
      toast.error('English name is required for completeness');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/question-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ro: newCategory.name_ro.trim(),
          name_en: newCategory.name_en.trim(),
          propertyTypeId: propertyType.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create category');

      const result = await response.json();
      if (result.success) {
        // For now, refresh the page to get updated data
        window.location.reload();
        setNewCategory({ name_ro: '', name_en: '' });
        setAdding(false);
        toast.success('Category created successfully');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = async (id: number) => {
    const category = propertyType.questionCategories.find(cat => cat.id === id);
    if (!category) return;

    // Check if category has questions
    if ((category.questions?.length || 0) > 0) {
      toast.error('Cannot delete category with existing questions. Delete questions first.');
      return;
    }

    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/question-categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');

      const result = await response.json();
      if (result.success) {
        // Refresh to get updated data
        window.location.reload();
        toast.success('Category deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Categories for "{getLocalizedText(propertyType.name_ro, propertyType.name_en, language)}"
          </h3>
          <p className="text-muted-foreground text-sm">
            Manage question categories. Each category groups related questions together.
          </p>
        </div>
        <Button
          onClick={() => setAdding(true)}
          disabled={adding}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Add New Category Form */}
      {adding && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">Add New Category</CardTitle>
            <CardDescription>
              Create a new question category for "{getLocalizedText(propertyType.name_ro, propertyType.name_en, language)}".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="ro" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ro">🇷🇴 Romanian</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
              </TabsList>
              <TabsContent value="ro" className="space-y-2">
                <label className="text-sm font-medium">Romanian Name *</label>
                <Input
                  placeholder="e.g., Fundația, Structura"
                  value={newCategory.name_ro}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name_ro: e.target.value }))}
                />
              </TabsContent>
              <TabsContent value="en" className="space-y-2">
                <label className="text-sm font-medium">English Name *</label>
                <Input
                  placeholder="e.g., Foundation, Structure"
                  value={newCategory.name_en}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name_en: e.target.value }))}
                />
              </TabsContent>
            </Tabs>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAdding(false);
                  setNewCategory({ name_ro: '', name_en: '' });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={isSubmitting || !newCategory.name_ro.trim() || !newCategory.name_en.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {propertyType.questionCategories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No categories found for this property type.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Add a category to start organizing questions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" value={expandedCategories} onValueChange={setExpandedCategories}>
            {propertyType.questionCategories.map((category) => {
              const isEditing = editing.id === category.id;
              const missingEnglish = !category.name_en;
              const hasQuestions = (category.questions?.length || 0) > 0;

              return (
                <AccordionItem key={category.id} value={category.id.toString()}>
                  <Card>
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-secondary" />
                          <div className="text-left">
                            {isEditing ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <div className="space-y-2">
                                  <Input
                                    value={editing.name_ro}
                                    onChange={(e) => setEditing(prev => ({ ...prev, name_ro: e.target.value }))}
                                    className="h-8"
                                    placeholder="Romanian name"
                                  />
                                  <Input
                                    value={editing.name_en}
                                    onChange={(e) => setEditing(prev => ({ ...prev, name_en: e.target.value }))}
                                    className="h-8"
                                    placeholder="English name"
                                  />
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      saveEdit();
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cancelEdit();
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium">
                                  {getLocalizedText(category.name_ro, category.name_en, language)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {language === 'en' ? category.name_ro : category.name_en || 'No English translation'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {missingEnglish && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <Badge variant="destructive" className="text-xs">
                                Missing English
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <MessageCircleQuestion className="h-4 w-4 text-blue-600" />
                            <Badge variant="outline">
                              {category.questions?.length || 0} questions
                            </Badge>
                          </div>
                          
                          {!isEditing && (
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => startEdit(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleDelete(category.id)}
                                disabled={hasQuestions}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-6 pb-4">
                      <div className="space-y-4">
                        {(category.questions?.length || 0) === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <MessageCircleQuestion className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No questions in this category yet.</p>
                            <p className="text-sm">Switch to the Questions tab to add questions.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Questions in this category:</h4>
                            <div className="space-y-2">
                              {category.questions.slice(0, 5).map((question) => (
                                <div key={question.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {getLocalizedText(question.text_ro, question.text_en, language)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        Weight: {question.weight}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {question.answers.length} answers
                                      </Badge>
                                      {!question.text_en && (
                                        <Badge variant="destructive" className="text-xs">
                                          Missing English
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {(category.questions?.length || 0) > 5 && (
                                <p className="text-sm text-muted-foreground text-center">
                                  ... and {(category.questions?.length || 0) - 5} more questions
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name_ro}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCategory}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
