import { Suspense } from 'react';
import { getUser } from '@/lib/db/queries';
import { ProfileForm } from './profile-form';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Profile Settings</h1>
        <p className='text-gray-600 mt-2'>
          Update your profile information and account settings.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProfileForm user={user} />
      </Suspense>
    </div>
  );
}
