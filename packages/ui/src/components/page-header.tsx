import { cn } from '@workspace/ui/lib/utils';
import { JSX } from 'react';

interface DocsPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  text?: string;
}

export function DocsPageHeader({
  heading,
  text,
  className = '',
  ...props
}: DocsPageHeaderProps): JSX.Element {
  return (
    <>
      <div className={cn('py-4', className)} {...props}>
        <h1 className='inline-block font-heading text-4xl lg:text-5xl'>
          {heading}
        </h1>
        {text ? <p className='text-xl text-muted-foreground'>{text}</p> : null}
      </div>
      <hr className='my-4' />
    </>
  );
}
