import { cn } from '@workspace/ui/lib/utils';
import { JSX } from 'react';

type DashboardShellProps = React.HTMLAttributes<HTMLDivElement>;

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps): JSX.Element {
  return (
    <div className={cn('grid items-start gap-8', className)} {...props}>
      {children}
    </div>
  );
}
