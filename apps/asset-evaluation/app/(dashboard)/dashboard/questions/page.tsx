import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import QuestionManagement from '@/components/dashboard/QuestionManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export const dynamic = 'force-dynamic';

export default async function QuestionsPage() {
  const user = await getUser();
  
  // If user is not logged in or not admin/superuser, redirect to login
  if (!user || !['admin', 'superuser'].includes(user.role)) {
    redirect('/login');
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Question Management</h2>
          <p className="text-muted-foreground">
            Manage questions and categories for property evaluations (grouped by category)
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Suspense fallback={<QuestionManagementSkeleton />}>
        <QuestionManagement />
      </Suspense>
    </div>
  );
}

function QuestionManagementSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
