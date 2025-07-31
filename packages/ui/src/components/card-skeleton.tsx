import { JSX } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export function CardSkeleton(): JSX.Element {
  return (
    <Card>
      <CardHeader className='gap-2'>
        <Skeleton className='h-5 w-1/5' />
        <Skeleton className='h-4 w-4/5' />
      </CardHeader>
      <CardContent className='h-10' />
      <CardFooter>
        <Skeleton className='h-8 w-[120px]' />
      </CardFooter>
    </Card>
  );
}
