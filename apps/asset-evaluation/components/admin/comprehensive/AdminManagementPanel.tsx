'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@workspace/ui/components/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@workspace/ui/components/accordion';
import { Building2, FolderOpen, MessageSquare, CheckSquare, Search, Languages, AlertTriangle, CheckCircle, Download, Upload, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { PropertyTypeWithRelations } from '@/lib/types/admin';
import PropertyTypeSelector from './PropertyTypeSelector';
import PropertyTypeManager from './PropertyTypeManager';
import CategoryManager from './CategoryManager';
import QuestionManager from './QuestionManager';
import EnhancedBulkImportDialog from '../dialogs/EnhancedBulkImportDialog';

interface AdminManagementPanelProps {
  initialData: PropertyTypeWithRelations[];
}

export default function AdminManagementPanel({ initialData }: AdminManagementPanelProps) {
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeWithRelations[]>(initialData);
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState<number | null>(
    initialData.length > 0 ? initialData[0].id : null
  );
  const [activeTab, setActiveTab] = useState('categories');
  const [language, setLanguage] = useState<'ro' | 'en'>('ro');
  const [searchQuery, setSearchQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Bulk import/export state
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Get selected property type
  const selectedPropertyType = propertyTypes.find(pt => pt.id === selectedPropertyTypeId);

  // Validation function
  const validateData = useCallback(() => {
    const errors: string[] = [];
    
    propertyTypes.forEach(propertyType => {
      // Check property type translations
      if (!propertyType.name_en) {
        errors.push(`Property type "${propertyType.name_ro}" missing English translation`);
      }
      
      propertyType.questionCategories.forEach((category) => {
        // Check category translations
        if (!category.name_en) {
          errors.push(`Category "${category.name_ro}" missing English translation`);
        }
        
        // Check if category has questions
        if ((category.questions?.length || 0) === 0) {
          errors.push(`Category "${category.name_ro}" has no questions`);
        }
        
        (category.questions || []).forEach((question) => {
          // Check question translations
          if (!question.text_en) {
            errors.push(`Question "${question.text_ro}" missing English translation`);
          }
          
          // Check if question has answers
          if (question.answers.length < 2) {
            errors.push(`Question "${question.text_ro}" needs at least 2 answers`);
          }
          
          question.answers.forEach((answer) => {
            // Check answer translations
            if (!answer.text_en) {
              errors.push(`Answer "${answer.text_ro}" missing English translation`);
            }
          });
        });
      });
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [propertyTypes]);

  // Update property types data
  const updatePropertyTypes = useCallback((updatedPropertyTypes: PropertyTypeWithRelations[]) => {
    setPropertyTypes(updatedPropertyTypes);
    validateData();
  }, [validateData]);

  // Handle property type selection
  const handlePropertyTypeSelect = (propertyTypeId: number) => {
    setSelectedPropertyTypeId(propertyTypeId);
    setActiveTab('categories');
  };

  // Handle adding new property type
  const handleAddPropertyType = async (data: { name_ro: string; name_en: string }) => {
    try {
      const response = await fetch('/api/admin/property-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create property type');
      
      const result = await response.json();
      if (result.success) {
        const newPropertyType: PropertyTypeWithRelations = {
          ...result.data,
          questionCategories: [],
        };
        setPropertyTypes(prev => [...prev, newPropertyType]);
        setSelectedPropertyTypeId(newPropertyType.id);
        toast.success('Property type created successfully');
      }
    } catch (error) {
      console.error('Error creating property type:', error);
      toast.error('Failed to create property type');
    }
  };

  // Statistics
  const stats = {
    totalPropertyTypes: propertyTypes.length,
    totalCategories: propertyTypes.reduce((sum, pt) => sum + pt.questionCategories.length, 0),
    totalQuestions: propertyTypes.reduce((sum, pt) => 
      sum + pt.questionCategories.reduce((catSum, cat) => catSum + (cat.questions?.length || 0), 0), 0
    ),
    totalAnswers: propertyTypes.reduce((sum, pt) => 
      sum + pt.questionCategories.reduce((catSum, cat) => 
        catSum + (cat.questions || []).reduce((qSum, q) => qSum + (q.answers?.length || 0), 0), 0
      ), 0
    ),
    validationErrors: validationErrors.length,
  };

  // Bulk Operations Functions
  const handleDownloadTemplate = async (format: 'excel' | 'markdown' = 'excel') => {
    try {
      const params = new URLSearchParams({
        type: 'template',
        format,
        ...(selectedPropertyTypeId && { propertyTypeId: selectedPropertyTypeId.toString() })
      });
      
      const response = await fetch(`/api/admin/questions/template?${params}`);
      
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const selectedPropertyType = propertyTypes.find(pt => pt.id === selectedPropertyTypeId);
      const typeName = selectedPropertyType 
        ? selectedPropertyType.name_ro.toLowerCase().replace(/\s+/g, '-')
        : 'all-types';
      const extension = format === 'excel' ? 'xlsx' : 'md';
      const date = new Date().toISOString().split('T')[0];
      
      a.download = `questions-template-${typeName}-${date}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${format === 'excel' ? 'Excel' : 'Markdown'} template downloaded successfully`);
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleExportData = async (format: 'excel' | 'markdown' = 'excel') => {
    try {
      const params = new URLSearchParams({
        type: 'export',
        format,
        ...(selectedPropertyTypeId && { propertyTypeId: selectedPropertyTypeId.toString() })
      });
      
      const response = await fetch(`/api/admin/questions/template?${params}`);
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const selectedPropertyType = propertyTypes.find(pt => pt.id === selectedPropertyTypeId);
      const typeName = selectedPropertyType 
        ? selectedPropertyType.name_ro.toLowerCase().replace(/\s+/g, '-')
        : 'all-types';
      const extension = format === 'excel' ? 'xlsx' : 'md';
      const date = new Date().toISOString().split('T')[0];
      
      a.download = `questions-export-${typeName}-${date}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Data exported to ${format === 'excel' ? 'Excel' : 'Markdown'} successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImportSuccess = () => {
    // Refresh data after successful import
    window.location.reload();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Language Toggle and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <Tabs value={language} onValueChange={(value) => setLanguage(value as 'ro' | 'en')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ro">🇷🇴 RO</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 EN</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
        </div>

        {/* Validation Status and Actions */}
        <div className="flex items-center gap-4">
          {/* Validation Status */}
          <div className="flex items-center gap-2">
            {validationErrors.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">System Valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{validationErrors.length} Issues</span>
              </div>
            )}
          </div>

          {/* Import/Export Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadTemplate('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download Excel Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadTemplate('markdown')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Markdown Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExportData('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Data to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('markdown')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export Data to Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowImportDialog(true)}
              disabled={!selectedPropertyType}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.totalPropertyTypes}</div>
            <div className="text-sm text-muted-foreground">Property Types</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">{stats.totalCategories}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalAnswers}</div>
            <div className="text-sm text-muted-foreground">Answers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${stats.validationErrors === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.validationErrors}
            </div>
            <div className="text-sm text-muted-foreground">Validation Issues</div>
          </CardContent>
        </Card>
      </div>

      {/* Property Types Overview Accordion */}
      <Accordion type="single" collapsible defaultValue="property-types-overview" className="w-full">
        <AccordionItem value="property-types-overview">
          <AccordionTrigger className="text-lg font-semibold">
            Property Types Overview
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <PropertyTypeSelector
              propertyTypes={propertyTypes}
              selectedId={selectedPropertyTypeId}
              onSelect={handlePropertyTypeSelect}
              language={language}
              searchQuery={searchQuery}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tabs for Management Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50">
          <TabsTrigger value="property-types" className="text-sm font-medium px-4 py-2">
            Management
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-sm font-medium px-4 py-2">
            Categories
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-sm font-medium px-4 py-2">
            Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="property-types" className="space-y-6">
          <PropertyTypeManager
            propertyTypes={propertyTypes}
            onUpdate={updatePropertyTypes}
            language={language}
            onAdd={handleAddPropertyType}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {selectedPropertyType ? (
            <CategoryManager
              propertyType={selectedPropertyType}
              onUpdate={updatePropertyTypes}
              language={language}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Please select a property type to manage its categories</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          {selectedPropertyType ? (
            <QuestionManager
              propertyType={selectedPropertyType}
              onUpdate={updatePropertyTypes}
              language={language}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Please select a property type to manage its questions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Bulk Import Dialog */}
      {selectedPropertyType && (
        <EnhancedBulkImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          propertyTypeId={selectedPropertyType.id}
          propertyTypeName={selectedPropertyType.name_ro}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
