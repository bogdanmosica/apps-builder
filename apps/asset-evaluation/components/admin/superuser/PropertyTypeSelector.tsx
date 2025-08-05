'use client';

import { PropertyTypeWithRelations } from '@/lib/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { getLocalizedText } from '@/lib/evaluation-utils';
import { Building2, FolderOpen, MessageCircleQuestion, Users } from 'lucide-react';

interface PropertyTypeSelectorProps {
  propertyTypes: PropertyTypeWithRelations[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  language: 'ro' | 'en';
  searchQuery: string;
}

export default function PropertyTypeSelector({
  propertyTypes,
  selectedId,
  onSelect,
  language,
  searchQuery,
}: PropertyTypeSelectorProps) {
  // Filter property types based on search query
  const filteredPropertyTypes = propertyTypes.filter(pt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      pt.name_ro.toLowerCase().includes(query) ||
      (pt.name_en?.toLowerCase().includes(query) || false) ||
      pt.questionCategories.some(cat =>
        cat.name_ro.toLowerCase().includes(query) ||
        (cat.name_en?.toLowerCase().includes(query) || false) ||
        cat.questions.some(q =>
          q.text_ro.toLowerCase().includes(query) ||
          (q.text_en?.toLowerCase().includes(query) || false)
        )
      )
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Property Types Overview</h3>
        <p className="text-muted-foreground text-sm">
          Select a property type to manage its categories, questions, and answers. 
          Use the tabs above to navigate between different management sections.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPropertyTypes.map((propertyType) => {
          const isSelected = propertyType.id === selectedId;
          const totalQuestions = propertyType.questionCategories.reduce(
            (sum, cat) => sum + cat.questions.length,
            0
          );
          const totalAnswers = propertyType.questionCategories.reduce(
            (sum, cat) => sum + cat.questions.reduce((qSum, q) => qSum + q.answers.length, 0),
            0
          );

          // Check for missing translations
          const missingTranslations = [
            !propertyType.name_en ? 1 : 0,
            ...propertyType.questionCategories.map(cat => !cat.name_en ? 1 : 0),
            ...propertyType.questionCategories.flatMap(cat =>
              cat.questions.map(q => !q.text_en ? 1 : 0)
            ),
            ...propertyType.questionCategories.flatMap(cat =>
              cat.questions.flatMap(q => q.answers.map(a => !a.text_en ? 1 : 0))
            ),
          ].reduce((sum, val) => sum + val, 0);

          return (
            <Card
              key={propertyType.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onSelect(propertyType.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">
                      {getLocalizedText(propertyType.name_ro, propertyType.name_en, language)}
                    </CardTitle>
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
                {missingTranslations > 0 && (
                  <div className="flex items-center gap-1">
                    <Badge variant="destructive" className="text-xs">
                      {missingTranslations} missing translations
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="text-lg font-semibold text-secondary">
                      {propertyType.questionCategories.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Categories</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <MessageCircleQuestion className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      {totalQuestions}
                    </div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      {totalAnswers}
                    </div>
                    <div className="text-xs text-muted-foreground">Answers</div>
                  </div>
                </div>

                {/* Categories Preview */}
                {propertyType.questionCategories.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Categories:</p>
                    <div className="flex flex-wrap gap-1">
                      {propertyType.questionCategories.slice(0, 3).map((category) => (
                        <Badge key={category.id} variant="outline" className="text-xs">
                          {getLocalizedText(category.name_ro, category.name_en, language)}
                        </Badge>
                      ))}
                      {propertyType.questionCategories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{propertyType.questionCategories.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(propertyType.id);
                  }}
                >
                  {isSelected ? 'Selected' : 'Select & Manage'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPropertyTypes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No property types match your search.' : 'No property types found.'}
            </p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search terms or clear the search to see all property types.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
