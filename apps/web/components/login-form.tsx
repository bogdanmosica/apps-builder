'use client';

import { authenticateUser } from '@/actions/authenticate-user';
import { Suspense } from 'react';
import { UserAuthForm } from '@workspace/ui/components/forms/user-auth-form';
import { UserAuthFormFallback } from '@workspace/ui/components/fallbacks/user-auth-form-fallback';

export const LoginForm = async () => {
  return (
    <Suspense fallback={<UserAuthFormFallback />}>
      <UserAuthForm signIn={authenticateUser} />
    </Suspense>
  );
};
