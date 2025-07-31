'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { cn } from '@workspace/ui/lib/utils';
import { buttonVariants } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Toaster } from '@workspace/ui/components/sonner';
import { toast } from 'sonner';
import { registerUserAuthSchema } from '@workspace/validations';
import { Icons } from '@workspace/ui/components/icons';
import { signUp } from '../../lib/session';
import useMainStoreContext from '../../hooks/use-main-store-context';

type RegisterUserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

type FormData = z.infer<typeof registerUserAuthSchema>;

export function RegisterUserAuthForm({
  className,
  ...props
}: RegisterUserAuthFormProps): React.JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerUserAuthSchema),
  });
  const { user, setUser } = useMainStoreContext();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    const signUpResult = await signUp('email', {
      email: data.email.toLowerCase(),
      password: data.password,
    });

    setIsLoading(false);

    if (signUpResult.ok) setUser({ ...user, email: data.email.toLowerCase() });

    if (!signUpResult.ok) {
      if (signUpResult.error) {
        router.push('/login');
        return toast(signUpResult.error.message);
      }
      return toast(
        'Something went wrong. Your sign in request failed. Please try again.'
      );
    }

    router.push(searchParams.get('from') || '/almost-there');
  }

  return (
    <>
      <Toaster />
      <div className={cn('grid gap-6', className)} {...props}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <div className='grid gap-1'>
              <Label className='sr-only' htmlFor='email'>
                Email
              </Label>
              <Input
                autoCapitalize='none'
                autoComplete='email'
                autoCorrect='off'
                disabled={isLoading || isGitHubLoading}
                id='email'
                placeholder='name@example.com'
                type='email'
                {...register('email')}
              />
              {errors?.email ? (
                <p className='px-1 text-xs text-red-600'>
                  {errors.email.message}
                </p>
              ) : null}
              <Label className='sr-only' htmlFor='password'>
                Password
              </Label>
              <Input
                autoCapitalize='none'
                autoComplete='password'
                autoCorrect='off'
                disabled={isLoading || isGitHubLoading}
                id='password'
                placeholder='Password'
                type='password'
                {...register('password')}
              />
              {errors?.password ? (
                <p className='px-1 text-xs text-red-600'>
                  {errors.password.message}
                </p>
              ) : null}
              <Label className='sr-only' htmlFor='confirmPassword'>
                Repeat Password
              </Label>
              <Input
                autoCapitalize='none'
                autoComplete='password'
                autoCorrect='off'
                disabled={isLoading || isGitHubLoading}
                id='confirmPassword'
                placeholder='Repeat Password'
                type='password'
                {...register('confirmPassword')}
              />
              {errors?.confirmPassword ? (
                <p className='px-1 text-xs text-red-600'>
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
            <button className={cn(buttonVariants())} disabled={isLoading}>
              {isLoading ? (
                <Icons.Spinner className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Sign up
            </button>
          </div>
        </form>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>
        <button
          className={cn(buttonVariants({ variant: 'outline' }))}
          disabled={isLoading || isGitHubLoading}
          onClick={() => {
            setIsGitHubLoading(true);
            //signIn('github');
          }}
          type='button'
        >
          {isGitHubLoading ? (
            <Icons.Spinner className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Icons.GitHub className='mr-2 h-4 w-4' />
          )}{' '}
          Github
        </button>
      </div>
    </>
  );
}
