import { DashboardHeader } from '@workspace/ui/components/header';
import { ProtectedRoute } from '@workspace/ui/components/protected-route';
import { DashboardShell } from '@workspace/ui/components/shell';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
//import { UserNameForm } from "@workspace/ui/components/user-name-form";

export const metadata = {
  title: 'Settings',
  description: 'Manage account and website settings.',
};

export default async function SettingsPage() {
  const session = await auth();

  return (
    <ProtectedRoute
      redirectPath='dashboard/billing'
      isUserAuthenticated={!!session}
    >
      <DashboardShell>
        <DashboardHeader
          heading='Settings'
          text='Manage account and website settings.'
        />
        <div className='flex gap-10 w-full'>
          {/* <UserNameForm className="w-full" /> */}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
