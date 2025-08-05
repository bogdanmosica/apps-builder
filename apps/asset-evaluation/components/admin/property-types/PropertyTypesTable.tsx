'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Plus, Pencil, Trash, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AddPropertyTypeDialog from './AddPropertyTypeDialog';
import EditPropertyTypeDialog from './EditPropertyTypeDialog';
import DeletePropertyTypeDialog from './DeletePropertyTypeDialog';
import HydrationSafeDate from '../../hydration-safe-date';

interface PropertyType {
  id: number;
  name_ro: string;
  name_en: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PropertyTypesTableProps {
  initialPropertyTypes: PropertyType[];
}

export default function PropertyTypesTable({ initialPropertyTypes }: PropertyTypesTableProps) {
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(initialPropertyTypes);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogState, setEditDialogState] = useState<{ open: boolean; propertyType: PropertyType | null }>({
    open: false,
    propertyType: null,
  });
  const [deleteDialogState, setDeleteDialogState] = useState<{ open: boolean; propertyType: PropertyType | null }>({
    open: false,
    propertyType: null,
  });

  // Handle creating a new property type
  const handleAddPropertyType = async (data: { name_ro: string; name_en: string | null }) => {
    try {
      const response = await fetch('/api/property-types', {
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
        toast.success('Property type created successfully');
        setAddDialogOpen(false);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating property type:', error);
      toast.error('Failed to create property type');
    }
  };

  // Handle updating a property type
  const handleUpdatePropertyType = async (id: number, data: { name_ro: string; name_en: string | null }) => {
    try {
      const response = await fetch(`/api/property-types/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update property type');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update in local state
        setPropertyTypes((prev) =>
          prev.map((pt) => (pt.id === id ? { ...pt, ...data } : pt))
        );
        toast.success('Property type updated successfully');
        setEditDialogState({ open: false, propertyType: null });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error updating property type:', error);
      toast.error('Failed to update property type');
    }
  };

  // Handle deleting a property type
  const handleDeletePropertyType = async (id: number) => {
    try {
      const response = await fetch(`/api/property-types/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete property type');
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        setPropertyTypes((prev) => prev.filter((pt) => pt.id !== id));
        toast.success('Property type deleted successfully');
        setDeleteDialogState({ open: false, propertyType: null });
        
        // Refresh the page data
        router.refresh();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error deleting property type:', error);
      toast.error('Failed to delete property type');
    }
  };

  // Filter property types based on search query
  const filteredPropertyTypes = propertyTypes.filter((pt) => {
    const query = searchQuery.toLowerCase();
    return (
      pt.name_ro.toLowerCase().includes(query) ||
      (pt.name_en?.toLowerCase().includes(query) || false)
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search property types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px] pl-9"
          />
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property Type
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name (Romanian)</TableHead>
              <TableHead>Name (English)</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPropertyTypes.length > 0 ? (
              filteredPropertyTypes.map((propertyType) => (
                <TableRow key={propertyType.id}>
                  <TableCell className="font-medium">{propertyType.id}</TableCell>
                  <TableCell>{propertyType.name_ro}</TableCell>
                  <TableCell>{propertyType.name_en || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <HydrationSafeDate date={propertyType.createdAt} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditDialogState({ open: true, propertyType })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteDialogState({ open: true, propertyType })}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No property types found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Property Type Dialog */}
      <AddPropertyTypeDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onSubmit={handleAddPropertyType}
      />

      {/* Edit Property Type Dialog */}
      <EditPropertyTypeDialog 
        open={editDialogState.open} 
        propertyType={editDialogState.propertyType} 
        onOpenChange={(open: boolean) => setEditDialogState({ open, propertyType: open ? editDialogState.propertyType : null })} 
        onSubmit={handleUpdatePropertyType}
      />

      {/* Delete Property Type Dialog */}
      <DeletePropertyTypeDialog 
        open={deleteDialogState.open} 
        propertyType={deleteDialogState.propertyType} 
        onOpenChange={(open: boolean) => setDeleteDialogState({ open, propertyType: open ? deleteDialogState.propertyType : null })} 
        onDelete={handleDeletePropertyType}
      />
    </div>
  );
}
