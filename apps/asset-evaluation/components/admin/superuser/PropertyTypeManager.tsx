'use client';

import { useState } from 'react';
import { PropertyTypeWithRelations } from '@/lib/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { getLocalizedText } from '@/lib/evaluation-utils';
import { Plus, Pencil, Trash, Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import HydrationSafeDate from '../../hydration-safe-date';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';

interface PropertyTypeManagerProps {
  propertyTypes: PropertyTypeWithRelations[];
  onUpdate: (updatedPropertyTypes: PropertyTypeWithRelations[]) => void;
  language: 'ro' | 'en';
  onAdd: (data: { name_ro: string; name_en: string }) => Promise<void>;
}

interface EditingState {
  id: number | null;
  name_ro: string;
  name_en: string;
}

export default function PropertyTypeManager({
  propertyTypes,
  onUpdate,
  language,
  onAdd,
}: PropertyTypeManagerProps) {
  const [editing, setEditing] = useState<EditingState>({ id: null, name_ro: '', name_en: '' });
  const [adding, setAdding] = useState(false);
  const [newPropertyType, setNewPropertyType] = useState({ name_ro: '', name_en: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog state for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyTypeToDelete, setPropertyTypeToDelete] = useState<PropertyTypeWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Start editing a property type
  const startEdit = (propertyType: PropertyTypeWithRelations) => {
    setEditing({
      id: propertyType.id,
      name_ro: propertyType.name_ro,
      name_en: propertyType.name_en || '',
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
      const response = await fetch(`/api/admin/property-types/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ro: editing.name_ro.trim(),
          name_en: editing.name_en.trim() || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update property type');

      const result = await response.json();
      if (result.success) {
        const updatedPropertyTypes = propertyTypes.map(pt =>
          pt.id === editing.id
            ? { ...pt, name_ro: editing.name_ro.trim(), name_en: editing.name_en.trim() || null }
            : pt
        );
        onUpdate(updatedPropertyTypes);
        setEditing({ id: null, name_ro: '', name_en: '' });
        toast.success('Property type updated successfully');
      }
    } catch (error) {
      console.error('Error updating property type:', error);
      toast.error('Failed to update property type');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding new property type
  const handleAdd = async () => {
    if (!newPropertyType.name_ro.trim()) {
      toast.error('Romanian name is required');
      return;
    }

    if (!newPropertyType.name_en.trim()) {
      toast.error('English name is required for completeness');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        name_ro: newPropertyType.name_ro.trim(),
        name_en: newPropertyType.name_en.trim(),
      });
      setNewPropertyType({ name_ro: '', name_en: '' });
      setAdding(false);
    } catch (error) {
      console.error('Error adding property type:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete property type
  const handleDelete = async (id: number) => {
    const propertyType = propertyTypes.find(pt => pt.id === id);
    if (!propertyType) return;

    // Check if property type has categories/questions
    if (propertyType.questionCategories.length > 0) {
      toast.error('Cannot delete property type with existing categories. Delete categories first.');
      return;
    }

    setPropertyTypeToDelete(propertyType);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePropertyType = async () => {
    if (!propertyTypeToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/property-types/${propertyTypeToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete property type');

      const result = await response.json();
      if (result.success) {
        const updatedPropertyTypes = propertyTypes.filter(pt => pt.id !== propertyTypeToDelete.id);
        onUpdate(updatedPropertyTypes);
        toast.success('Property type deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting property type:', error);
      toast.error('Failed to delete property type');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPropertyTypeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Property Type Management</h3>
          <p className="text-muted-foreground text-sm">
            Add, edit, and manage property types. Each property type can contain multiple question categories.
          </p>
        </div>
        <Button
          onClick={() => setAdding(true)}
          disabled={adding}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Property Type
        </Button>
      </div>

      {/* Add New Property Type Form */}
      {adding && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">Add New Property Type</CardTitle>
            <CardDescription>
              Both Romanian and English names are required for consistency.
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
                  placeholder="e.g., Casă, Apartament"
                  value={newPropertyType.name_ro}
                  onChange={(e) => setNewPropertyType(prev => ({ ...prev, name_ro: e.target.value }))}
                />
              </TabsContent>
              <TabsContent value="en" className="space-y-2">
                <label className="text-sm font-medium">English Name *</label>
                <Input
                  placeholder="e.g., House, Apartment"
                  value={newPropertyType.name_en}
                  onChange={(e) => setNewPropertyType(prev => ({ ...prev, name_en: e.target.value }))}
                />
              </TabsContent>
            </Tabs>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAdding(false);
                  setNewPropertyType({ name_ro: '', name_en: '' });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={isSubmitting || !newPropertyType.name_ro.trim() || !newPropertyType.name_en.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Property Type'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Existing Property Types</CardTitle>
          <CardDescription>
            Click edit to modify names. Delete is only allowed for property types without categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Romanian Name</TableHead>
                <TableHead>English Name</TableHead>
                <TableHead className="text-center">Categories</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyTypes.map((propertyType) => {
                const isEditing = editing.id === propertyType.id;
                const totalQuestions = propertyType.questionCategories.reduce(
                  (sum, cat) => sum + cat.questions.length,
                  0
                );
                const hasCategories = propertyType.questionCategories.length > 0;
                const missingEnglish = !propertyType.name_en;

                return (
                  <TableRow key={propertyType.id}>
                    <TableCell className="font-medium">{propertyType.id}</TableCell>
                    
                    {/* Romanian Name */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editing.name_ro}
                          onChange={(e) => setEditing(prev => ({ ...prev, name_ro: e.target.value }))}
                          className="h-8"
                        />
                      ) : (
                        propertyType.name_ro
                      )}
                    </TableCell>
                    
                    {/* English Name */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editing.name_en}
                          onChange={(e) => setEditing(prev => ({ ...prev, name_en: e.target.value }))}
                          className="h-8"
                          placeholder="English translation"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {propertyType.name_en || '—'}
                          {missingEnglish && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {propertyType.questionCategories.length}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {totalQuestions}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {missingEnglish ? (
                        <Badge variant="destructive">Incomplete</Badge>
                      ) : (
                        <Badge variant="default">Complete</Badge>
                      )}
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                      <HydrationSafeDate date={propertyType.createdAt} />
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={saveEdit}
                            disabled={isSubmitting}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={cancelEdit}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => startEdit(propertyType)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDelete(propertyType.id)}
                            disabled={hasCategories}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {propertyTypes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No property types found. Add one to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{propertyTypeToDelete?.name_ro}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPropertyTypeToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeletePropertyType}
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
