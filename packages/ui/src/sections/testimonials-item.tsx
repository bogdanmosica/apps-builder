import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';

type HomeFeatureItemProps = {
  children?: React.ReactNode;
} & Record<string, unknown>;

export function HomeTestimonialsItem({
  authorName,
  companyName,
  description,
}: HomeFeatureItemProps): React.JSX.Element {
  return (
    <Card className='relative overflow-hidden rounded-lg border bg-background p-2'>
      <CardHeader>
        <CardTitle>{authorName}</CardTitle>
        <CardDescription className='italic'>{companyName}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-sm'>{description}</p>
      </CardContent>
    </Card>
  );
}
