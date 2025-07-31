import { CardSkeleton } from '@workspace/ui/components/card-skeleton';
import { DashboardHeader } from '@workspace/ui/components/header';
import { DashboardShell } from '@workspace/ui/components/shell';

export default function DashboardBillingLoading() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading='Billing'
        text='Manage billing and your subscription plan.'
      />
      <div className='grid gap-10'>
        <CardSkeleton />
      </div>
    </DashboardShell>
  );
}
