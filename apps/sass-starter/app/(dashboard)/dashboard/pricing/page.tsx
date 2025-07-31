import { getUser, getTeamForUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import DashboardPricing from '@/components/dashboard-pricing';

export default async function PricingPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  if (!team) {
    redirect('/onboarding');
  }

  return (
    <div className='min-h-screen bg-gray-50/50'>
      <div className='container mx-auto py-8 px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Pricing Management
          </h1>
          <p className='text-gray-600'>
            Manage your subscription pricing plans and billing settings.
          </p>
        </div>

        <DashboardPricing />
      </div>
    </div>
  );
}
