'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@workspace/ui/components/accordion';
import { Badge } from '@workspace/ui/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Plus, Edit, Trash2, MessageSquare, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import AddCategoryDialog from './dialogs/AddCategoryDialog';
import AddQuestionDialog from './dialogs/AddQuestionDialog';
import EditQuestionDialog from './dialogs/EditQuestionDialog';
import AddPropertyTypeDialog from '../admin/property-types/AddPropertyTypeDialog';
import BulkImportDialog from './dialogs/BulkImportDialog';

interface PropertyType {
  id: number;
  name_ro: string;
  name_en: string;
}

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

interface Category {
  id: number;
  name_ro: string;
  name_en: string;
  propertyTypeId: number;
  questions: Question[];
}

interface PropertyTypeWithCategories extends PropertyType {
  questionCategories: Category[];
}

export default function QuestionManagement() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [categoriesData, setCategoriesData] = useState<PropertyTypeWithCategories | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  const [editQuestionDialogOpen, setEditQuestionDialogOpen] = useState(false);
  const [addPropertyTypeDialogOpen, setAddPropertyTypeDialogOpen] = useState(false);
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load property types on mount
  useEffect(() => {
    loadPropertyTypes();
  }, []);

  // Auto-select first property type when property types are loaded
  useEffect(() => {
    if (propertyTypes.length > 0 && !selectedPropertyType) {
      setSelectedPropertyType(propertyTypes[0].id.toString());
    }
  }, [propertyTypes, selectedPropertyType]);

  // Load categories when property type changes
  useEffect(() => {
    if (selectedPropertyType) {
      loadCategoriesForPropertyType(parseInt(selectedPropertyType));
    } else {
      setCategoriesData(null);
    }
  }, [selectedPropertyType]);

  const loadPropertyTypes = async () => {
    try {
      const response = await fetch('/api/admin/property-types');
      if (!response.ok) throw new Error('Failed to fetch property types');
      const result = await response.json();
      setPropertyTypes(result.data || []);
    } catch (error) {
      console.error('Error loading property types:', error);
      toast.error('Failed to load property types');
      setPropertyTypes([]); // Set empty array on error
    }
  };

  const loadCategoriesForPropertyType = async (propertyTypeId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/property-types/${propertyTypeId}?include=categories,questions,answers`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const result = await response.json();
      setCategoriesData(result.data || null);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
      setCategoriesData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (!selectedPropertyType) {
      toast.error('Please select a property type first');
      return;
    }
    setAddCategoryDialogOpen(true);
  };

  const handleAddPropertyType = () => {
    setAddPropertyTypeDialogOpen(true);
  };

  const handleCreatePropertyType = async (data: { name_ro: string; name_en: string | null }) => {
    try {
      const response = await fetch('/api/admin/property-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create property type');
      }

      const result = await response.json();
      
      if (result.success) {
        // Add to local state
        setPropertyTypes((prev) => [...prev, result.data]);
        // Auto-select the newly created property type
        setSelectedPropertyType(result.data.id.toString());
        toast.success('Property type created successfully');
        setAddPropertyTypeDialogOpen(false);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating property type:', error);
      toast.error('Failed to create property type');
    }
  };

  const handleAddQuestion = (category: Category) => {
    setSelectedCategory(category);
    setAddQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setEditQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = async (question: Question) => {
    setQuestionToDelete(question);
    setDeleteConfirmDialogOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/questions/${questionToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete question');

      toast.success('Question deleted successfully');
      
      // Refresh data
      if (selectedPropertyType) {
        loadCategoriesForPropertyType(parseInt(selectedPropertyType));
      }
      
      // Close dialog and reset state
      setDeleteConfirmDialogOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/questions/template?type=template');
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions-template-id-based-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('ID-based template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleExportData = async () => {
    try {
      const queryParams = selectedPropertyType ? `?type=export&propertyTypeId=${selectedPropertyType}` : '?type=export';
      const response = await fetch(`/api/questions/template${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = selectedPropertyType 
        ? `questions-export-property-${selectedPropertyType}-${new Date().toISOString().split('T')[0]}.xlsx`
        : `questions-export-all-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Questions data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleBulkImport = () => {
    setBulkImportDialogOpen(true);
  };

  const handleBulkImportSuccess = () => {
    // Refresh data after successful import
    refreshData();
    setBulkImportDialogOpen(false);
  };

  const refreshData = () => {
    if (selectedPropertyType) {
      loadCategoriesForPropertyType(parseInt(selectedPropertyType));
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Property Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property Type</CardTitle>
          <CardDescription>
            Choose a property type to view and manage its question categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property type..." />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name_en} / {type.name_ro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleDownloadTemplate}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button 
                onClick={handleExportData}
                variant="outline"
                size="sm"
                disabled={!selectedPropertyType}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button 
                onClick={handleBulkImport}
                variant="outline"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
              <Button 
                onClick={handleAddPropertyType}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property Type
              </Button>
              <Button 
                onClick={handleAddCategory}
                disabled={!selectedPropertyType}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Categories with Questions */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading categories...</div>
          </CardContent>
        </Card>
      )}

      {!loading && categoriesData && categoriesData.questionCategories.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding the first category for this property type.
              </p>
              <Button onClick={handleAddCategory}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Category
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && categoriesData && categoriesData.questionCategories.length > 0 && (
        <Accordion type="multiple" className="space-y-4">
          {categoriesData.questionCategories.map((category) => (
            <AccordionItem key={category.id} value={category.id.toString()}>
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <div className="text-left">
                      <h3 className="text-lg font-medium">{category.name_en}</h3>
                      <p className="text-sm text-muted-foreground">{category.name_ro}</p>
                    </div>
                    <Badge variant="secondary">
                      {category.questions?.length || 0} question{(category.questions?.length || 0) !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="p-6 pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Questions in this category</h4>
                      <Button size="sm" onClick={() => handleAddQuestion(category)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>

                    {(category.questions?.length || 0) === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                        <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground mb-4">No questions in this category yet</p>
                        <Button size="sm" onClick={() => handleAddQuestion(category)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Question
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Answers</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(category.questions || []).map((question) => (
                            <TableRow key={question.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{question.text_en}</div>
                                  <div className="text-sm text-muted-foreground">{question.text_ro}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{question.weight}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {question.answers.map((answer) => (
                                    <div key={answer.id} className="text-sm">
                                      <span className="font-medium">{answer.text_en}</span>
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        {answer.weight}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditQuestion(question)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteQuestion(question)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Dialogs */}
      <AddCategoryDialog
        open={addCategoryDialogOpen}
        onOpenChange={setAddCategoryDialogOpen}
        propertyTypeId={selectedPropertyType ? parseInt(selectedPropertyType) : 0}
        onSuccess={refreshData}
      />

      <AddQuestionDialog
        open={addQuestionDialogOpen}
        onOpenChange={setAddQuestionDialogOpen}
        category={selectedCategory}
        onSuccess={refreshData}
      />

      <EditQuestionDialog
        open={editQuestionDialogOpen}
        onOpenChange={setEditQuestionDialogOpen}
        question={selectedQuestion}
        onSuccess={refreshData}
      />

      <AddPropertyTypeDialog
        open={addPropertyTypeDialogOpen}
        onOpenChange={setAddPropertyTypeDialogOpen}
        onSubmit={handleCreatePropertyType}
      />

      <BulkImportDialog
        open={bulkImportDialogOpen}
        onOpenChange={setBulkImportDialogOpen}
        onSuccess={handleBulkImportSuccess}
        propertyTypeId={selectedPropertyType ? parseInt(selectedPropertyType) : undefined}
        propertyTypeName={selectedPropertyType ? 
          propertyTypes.find(pt => pt.id.toString() === selectedPropertyType)?.name_ro : 
          undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This will also delete all associated answers. This action cannot be undone.
              {questionToDelete && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Question:</strong> {questionToDelete.text_ro}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteConfirmDialogOpen(false);
                setQuestionToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteQuestion}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
