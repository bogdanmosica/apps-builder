import Link from 'next/link';
import { EmptyPlaceholder } from '@workspace/ui/components/empty-placeholder';
import { buttonVariants } from '@workspace/ui/components/button';

export default function NotFound() {
  return (
    <EmptyPlaceholder className='mx-auto max-w-[800px]'>
      <EmptyPlaceholder.Icon name='Warning' />
      <EmptyPlaceholder.Title>Uh oh! Not Found</EmptyPlaceholder.Title>
      <EmptyPlaceholder.Description>
        This post could not be found. Please try again.
      </EmptyPlaceholder.Description>
      <Link href='/dashboard' className={buttonVariants({ variant: 'ghost' })}>
        Go to Dashboard
      </Link>
    </EmptyPlaceholder>
  );
}
