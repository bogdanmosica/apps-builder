'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Building2, FolderOpen, MessageSquare, CheckSquare, Search, Languages, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PropertyTypeWithRelations } from '@/lib/types/admin';
import PropertyTypeSelector from './PropertyTypeSelector';
import PropertyTypeManager from './PropertyTypeManager';
import CategoryManager from './CategoryManager';
import QuestionManager from './QuestionManager';

interface AdminManagementPanelProps {
  initialData: PropertyTypeWithRelations[];
}

export default function AdminManagementPanel({ initialData }: AdminManagementPanelProps) {
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeWithRelations[]>(initialData);
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState<number | null>(
    initialData.length > 0 ? initialData[0].id : null
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState<'ro' | 'en'>('ro');
  const [searchQuery, setSearchQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

      {/* Main Management Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="property-types">Property Types</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PropertyTypeSelector
            propertyTypes={propertyTypes}
            selectedId={selectedPropertyTypeId}
            onSelect={handlePropertyTypeSelect}
            language={language}
            searchQuery={searchQuery}
          />
        </TabsContent>

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
                <p className="text-muted-foreground">Please select a property type first</p>
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
                <p className="text-muted-foreground">Please select a property type first</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation & Sync</CardTitle>
              <CardDescription>
                Review data completeness and sync changes across the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {validationErrors.length === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {validationErrors.length === 0 
                        ? 'System validation passed' 
                        : `${validationErrors.length} validation issues found`
                      }
                    </span>
                  </div>
                  <Button onClick={validateData}>
                    Re-validate
                  </Button>
                </div>
                
                {validationErrors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Issues to fix:</h4>
                    <ul className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
