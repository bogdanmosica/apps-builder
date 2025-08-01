'use client';

import { Button } from '@workspace/ui/components/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type='submit'
      disabled={pending}
      variant='outline'
      className='w-full rounded-full'
    >
      {pending ? (
        <>
          <Loader2 className='animate-spin mr-2 h-4 w-4' />
          Loading...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className='h-4 w-4' />
        </>
      )}
    </Button>
  );
}
