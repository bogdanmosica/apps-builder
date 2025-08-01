import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getPropertyTypesWithData } from '@/lib/evaluation-server';
import EvaluationFlow from '@/components/evaluation/EvaluationFlow';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardContent } from '@workspace/ui/components/card';

// Loading component
function EvaluationLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="w-20 h-20 rounded-full mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-4 w-48 mx-auto" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
          
          <Skeleton className="h-12 w-full max-w-md mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}

// Main evaluation component
async function EvaluationContent() {
  try {
    const propertyTypes = await getPropertyTypesWithData();
    
    if (!propertyTypes || propertyTypes.length === 0) {
      throw new Error('No property types found. Please seed the database first.');
    }

    // For now, use the first property type (House)
    // In a real app, you might let users select the property type
    const selectedPropertyType = propertyTypes[0];

    if (!selectedPropertyType.categories || selectedPropertyType.categories.length === 0) {
      throw new Error('No categories found for this property type.');
    }

    return <EvaluationFlow propertyData={selectedPropertyType} />;
  } catch (error) {
    console.error('Error loading evaluation data:', error);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Unable to Load Evaluation
            </h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'An unexpected error occurred.'}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Make sure the database is set up correctly:
              </p>
              <code className="block text-xs bg-secondary p-2 rounded">
                npm run db:seed
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

// Main page component
export default function EvaluationPage() {
  return (
    <Suspense fallback={<EvaluationLoading />}>
      <EvaluationContent />
    </Suspense>
  );
}

// Metadata for the page
export const metadata = {
  title: 'Property Evaluation | Interactive Assessment',
  description: 'Evaluate your property with our comprehensive interactive assessment tool. Get instant feedback and detailed insights.',
};
