import { cn } from '@workspace/ui/lib/utils';
import { Icons } from '@workspace/ui/components/icons';
import { ModeToggle } from '@workspace/ui/components/mode-toggle';
import { JSX } from 'react';

interface SiteFooterProps {
  siteConfig?: {
    links: {
      twitter: string;
      github: string;
    };
  };
}

export function SiteFooter({
  siteConfig = {
    links: {
      twitter: 'https://twitter.com/shadcn',
      github: 'https://twitter.com/shadcn',
    },
  },
  className,
}: SiteFooterProps & React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <footer className={cn(className)}>
      <div className='container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0'>
        <div className='flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0'>
          <Icons.Logo />
          <p className='text-center text-sm leading-loose md:text-left'>
            Built by{' '}
            <a
              className='font-medium underline underline-offset-4'
              href={siteConfig.links.twitter}
              rel='noreferrer'
              target='_blank'
            >
              shadcn
            </a>
            . Hosted on{' '}
            <a
              className='font-medium underline underline-offset-4'
              href='https://vercel.com'
              rel='noreferrer'
              target='_blank'
            >
              Vercel
            </a>
            . Illustrations by{' '}
            <a
              className='font-medium underline underline-offset-4'
              href='https://popsy.co'
              rel='noreferrer'
              target='_blank'
            >
              Popsy
            </a>
            . The source code is available on{' '}
            <a
              className='font-medium underline underline-offset-4'
              href={siteConfig.links.github}
              rel='noreferrer'
              target='_blank'
            >
              GitHub
            </a>
            .
          </p>
        </div>
        <ModeToggle />
      </div>
    </footer>
  );
}
