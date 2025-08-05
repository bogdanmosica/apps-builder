import { asc } from 'drizzle-orm';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { propertyTypes, questionCategories, questions, answers } from '@/lib/db/schema';
import PropertyTypesTable from '@/components/admin/property-types/PropertyTypesTable';
import PropertyTypesTableSkeleton from '@/components/admin/property-types/PropertyTypesTableSkeleton';
import SuperuserManagementPanel from '@/components/admin/superuser/SuperuserManagementPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Crown, Settings2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PropertyTypesAdminPage() {
  const user = await getUser();
  
  // If user is not logged in or not an admin, redirect to home page
  if (!user || !['admin', 'superuser'].includes(user.role)) {
    redirect('/');
  }

  // For superuser, show the full management panel with all relations
  if (user.role === 'superuser') {
    // Fetch all data with relationships for superuser management
    const allPropertyTypes = await db.query.propertyTypes.findMany({
      orderBy: asc(propertyTypes.name_ro),
      with: {
        questionCategories: {
          orderBy: asc(questionCategories.name_ro),
          with: {
            questions: {
              orderBy: asc(questions.text_ro),
              with: {
                answers: {
                  orderBy: asc(answers.text_ro),
                },
              },
            },
          },
        },
      },
    });

    return (
      <div className="container py-6 space-y-6">
        {/* Superuser Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h1 className="text-3xl font-bold tracking-tight text-text-base">
                QA Management (Superuser)
              </h1>
              <Badge variant="destructive" className="ml-2">
                SUPERUSER MODE
              </Badge>
            </div>
            <p className="text-text-muted max-w-3xl">
              Complete control over property types, question categories, questions, and answers. 
              Changes here affect the entire evaluation system for all users.
            </p>
          </div>
        </div>

        {/* Warning Card */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">⚠️ System Administration Warning</CardTitle>
            </div>
            <CardDescription className="text-yellow-700">
              You are accessing the core evaluation system. Changes made here will immediately affect all users. 
              Ensure all entries have both Romanian and English translations before saving.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Superuser Management Panel */}
        <Suspense fallback={<SuperuserManagementSkeleton />}>
          <SuperuserManagementPanel initialData={allPropertyTypes} />
        </Suspense>
      </div>
    );
  }

  // For regular admin, show the basic property types table
  const types = await db.select().from(propertyTypes).orderBy(asc(propertyTypes.name_ro));

  return (
    <div className="container py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-text-base mb-2">
        Property Type Management
      </h1>
      <p className="text-text-muted mb-8">
        Add, edit and manage property types available for evaluation.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Property Types</CardTitle>
          <CardDescription>
            These property types will be available to users for evaluation. 
            Adding a new property type requires creating categories and questions separately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PropertyTypesTableSkeleton />}>
            <PropertyTypesTable initialPropertyTypes={types} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function SuperuserManagementSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: 'QA Management | Admin Panel',
  description: 'Manage property types, categories, questions, and answers for asset evaluation',
};
