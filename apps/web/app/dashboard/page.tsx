import { Metadata } from 'next';
import { DashboardHeader } from '@workspace/ui/components/header';
import { DashboardShell } from '@workspace/ui/components/shell';
import { ProtectedRoute } from '@workspace/ui/components/protected-route';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Edit compositions',
};

export default async function DashboardPage() {
  //const session = await auth();
  return (
    <ProtectedRoute redirectPath='dashboard' isUserAuthenticated={true}>
      <DashboardShell>
        <DashboardHeader
          heading='Dashboard'
          text='Create and manage compositions.'
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
