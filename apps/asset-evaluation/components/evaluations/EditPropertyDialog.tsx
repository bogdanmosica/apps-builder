'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { toast } from 'sonner';
import { Loader2, Building, MapPin, Ruler, Home, Calendar } from 'lucide-react';

interface EditPropertyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: {
    id: number;
    propertyName: string | null;
    propertyLocation: string | null;
    propertySurface: number | null;
    propertyFloors: string | null;
    propertyConstructionYear: number | null;
  };
  onUpdate: (evaluationId: number, updatedData: any) => void;
}

export default function EditPropertyDialog({
  isOpen,
  onClose,
  evaluation,
  onUpdate,
}: EditPropertyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyName: evaluation.propertyName || '',
    propertyLocation: evaluation.propertyLocation || '',
    propertySurface: evaluation.propertySurface?.toString() || '',
    propertyFloors: evaluation.propertyFloors || '',
    propertyConstructionYear: evaluation.propertyConstructionYear?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when evaluation changes
  useEffect(() => {
    setFormData({
      propertyName: evaluation.propertyName || '',
      propertyLocation: evaluation.propertyLocation || '',
      propertySurface: evaluation.propertySurface?.toString() || '',
      propertyFloors: evaluation.propertyFloors || '',
      propertyConstructionYear: evaluation.propertyConstructionYear?.toString() || '',
    });
  }, [evaluation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.propertyName || formData.propertyName.trim().length < 3) {
      newErrors.propertyName = 'Property name must be at least 3 characters';
    }

    // Optional field validations
    if (formData.propertySurface && parseInt(formData.propertySurface) < 10) {
      newErrors.propertySurface = 'Surface must be at least 10 sqm';
    }

    if (formData.propertyConstructionYear) {
      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.propertyConstructionYear);
      if (year < 1900 || year > currentYear) {
        newErrors.propertyConstructionYear = `Year must be between 1900 and ${currentYear}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`/api/evaluation/${evaluation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      // Update the local state
      onUpdate(evaluation.id, formData);
      
      toast.success('Property details updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Property Details</DialogTitle>
          <DialogDescription>
            Update the details for your property evaluation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Property Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="propertyName" className="text-sm font-medium flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Property Name *
              </Label>
              <Input
                id="propertyName"
                placeholder="e.g., Casa părinților, Opțiunea 3, Apartament București"
                value={formData.propertyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('propertyName', e.target.value)
                }
                className={errors.propertyName ? 'border-red-500' : ''}
              />
              {errors.propertyName && (
                <p className="text-sm text-red-500">{errors.propertyName}</p>
              )}
            </div>
            
            {/* Location - Optional */}
            <div className="space-y-2">
              <Label htmlFor="propertyLocation" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location / Address
              </Label>
              <Textarea
                id="propertyLocation"
                placeholder="e.g., Strada Victoriei 15, București, near Piața Română"
                value={formData.propertyLocation}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange('propertyLocation', e.target.value)
                }
                rows={2}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">Optional - for your reference only</p>
            </div>
            
            {/* Surface Area - Optional */}
            <div className="space-y-2">
              <Label htmlFor="propertySurface" className="text-sm font-medium flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                Total Surface (sqm)
              </Label>
              <Input
                id="propertySurface"
                type="number"
                placeholder="e.g., 85"
                value={formData.propertySurface}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('propertySurface', e.target.value)
                }
                className={errors.propertySurface ? 'border-red-500' : ''}
                min="10"
              />
              {errors.propertySurface && (
                <p className="text-sm text-red-500">{errors.propertySurface}</p>
              )}
            </div>
            
            {/* Number of Floors - Optional */}
            <div className="space-y-2">
              <Label htmlFor="propertyFloors" className="text-sm font-medium flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Number of Floors
              </Label>
              <Select value={formData.propertyFloors} onValueChange={(value) => handleInputChange('propertyFloors', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of floors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Floor (Parter)</SelectItem>
                  <SelectItem value="2">2 Floors (Parter + Etaj)</SelectItem>
                  <SelectItem value="3">3 Floors</SelectItem>
                  <SelectItem value="mansarda">Mansardă</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Construction Year - Optional */}
            <div className="space-y-2">
              <Label htmlFor="propertyConstructionYear" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Construction Year
              </Label>
              <Input
                id="propertyConstructionYear"
                type="number"
                placeholder="e.g., 2010"
                value={formData.propertyConstructionYear}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('propertyConstructionYear', e.target.value)
                }
                className={errors.propertyConstructionYear ? 'border-red-500' : ''}
                min="1900"
                max={new Date().getFullYear()}
              />
              {errors.propertyConstructionYear && (
                <p className="text-sm text-red-500">{errors.propertyConstructionYear}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
