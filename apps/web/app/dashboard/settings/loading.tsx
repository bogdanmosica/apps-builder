import { CardSkeleton } from '@workspace/ui/components/card-skeleton';
import { DashboardHeader } from '@workspace/ui/components/header';
import { DashboardShell } from '@workspace/ui/components/shell';

export default function DashboardSettingsLoading() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading='Settings'
        text='Manage account and website settings.'
      />
      <div className='grid gap-10'>
        <CardSkeleton />
      </div>
    </DashboardShell>
  );
}
