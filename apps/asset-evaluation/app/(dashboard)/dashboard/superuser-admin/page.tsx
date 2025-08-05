import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { propertyTypes, questionCategories, questions, answers } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import SuperuserManagementPanel from '@/components/admin/superuser/SuperuserManagementPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Crown, Settings2, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuperuserAdminPage() {
  const user = await getUser();
  
  // If user is not logged in or not a superuser, redirect to home page
  if (!user || user.role !== 'superuser') {
    redirect('/');
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h1 className="text-3xl font-bold tracking-tight text-text-base">
              Superuser Management Panel
            </h1>
            <Badge variant="destructive" className="ml-2">
              SUPERUSER ONLY
            </Badge>
          </div>
          <p className="text-text-muted max-w-3xl">
            Complete control over property types, question categories, questions, and answers. 
            Changes here affect the entire evaluation system for all users.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Database className="h-4 w-4" />
          <span>System Administration</span>
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

      {/* Main Management Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Evaluation System Management
          </CardTitle>
          <CardDescription>
            Manage property types, categories, questions, and answers with dual-language support.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<SuperuserManagementSkeleton />}>
            <SuperuserData />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuperuserData() {
  try {
    // Fetch all data with relationships
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

    return <SuperuserManagementPanel initialData={allPropertyTypes} />;
  } catch (error) {
    console.error('Error fetching superuser data:', error);
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-text-muted">Failed to load administration data.</p>
          <p className="text-sm text-text-muted">Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }
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
  title: 'Superuser Management | Admin Panel',
  description: 'Complete system administration for property evaluation platform',
};
