'use client';

import { buttonVariants } from '@workspace/ui/components/button';
import { UserAccountNav } from './user-account-nav';
import { JSX } from 'react';
import { User } from 'next-auth';
import { cn } from '@workspace/ui/lib/utils';

export interface LoginAvatarBtnProps {
  children?: React.ReactNode;
  user?: Pick<User, 'name' | 'image' | 'email'>;
}

export function LoginAvatarBtn({ user }: LoginAvatarBtnProps): JSX.Element {
  return (
    <>
      {!user ? (
        <a
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'sm' }),
            'px-4 ml-4'
          )}
          href='/login'
        >
          Login
        </a>
      ) : (
        <UserAccountNav user={user} />
      )}
    </>
  );
}

export default LoginAvatarBtn;
