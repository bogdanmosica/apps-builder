'use client';

import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import { Icons } from '@workspace/ui/components/icons';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import {
  Search,
  PanelLeft,
  Home,
  LineChart,
  Bot,
  Network,
  Settings,
  LogOut,
  Loader2,
  BarChart3,
  CreditCard,
  FileText,
  CheckSquare,
  MessageCircleQuestion,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';

function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { setTheme } = useTheme();

  // Helper function to check if a link is active
  const isActive = (href: string) => {
    if (href === '/') {
      // Home link should never be active in dashboard layout since we're always in dashboard routes
      return false;
    }
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    toast.loading('Logging you out...', { id: 'logout' });

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Successfully logged out!', { id: 'logout' });
        router.push('/');
        router.refresh();
      } else {
        console.error('Logout failed');
        toast.error('Failed to logout. Please try again.', { id: 'logout' });
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout. Please try again.', { id: 'logout' });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className='w-full border-b bg-background'>
      <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
        {/* Mobile Navigation */}
        <div className='flex items-center'>
          <Sheet>
            <SheetTrigger asChild>
              <Button size='icon' variant='outline' className='sm:hidden mr-4'>
                <PanelLeft className='h-5 w-5' aria-hidden='true' />
                <span className='sr-only'>Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='sm:max-w-xs'>
              <nav className='grid gap-6 text-lg font-medium'>
                <div className='flex items-center space-x-2 mb-4'>
                  <Home className='h-8 w-8 text-primary' />
                  <span className='text-2xl font-bold text-foreground'>
                    Asset Evaluation
                  </span>
                </div>
                <Link
                  href='/dashboard'
                  className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-md transition-colors',
                    isActive('/dashboard') 
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Home className='h-5 w-5' aria-hidden='true' />
                  Dashboard
                </Link>
                <Link
                  href='/dashboard/analytics'
                  className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-md transition-colors',
                    isActive('/dashboard/analytics') 
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <LineChart className='h-5 w-5' aria-hidden='true' />
                  Analytics
                </Link>
                {/* Advanced Analytics link hidden - considered overkill */}
                {/* <Link
                  href='/dashboard/advanced-analytics'
                  className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-md transition-colors',
                    isActive('/dashboard/advanced-analytics') 
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <BarChart3 className='h-5 w-5' aria-hidden='true' />
                  Advanced Analytics
                </Link> */}
                <Link
                  href='/dashboard/ai-insights'
                  className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-md transition-colors',
                    isActive('/dashboard/ai-insights') 
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Bot className='h-5 w-5' aria-hidden='true' />
                  AI Insights
                </Link>
                <Link
                  href='/dashboard/integrations'
                  className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-md transition-colors',
                    isActive('/dashboard/integrations') 
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Network className='h-5 w-5' aria-hidden='true' />
                  Integrations
                </Link>
                <Link
                  href='/billing'
                  className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-md transition-colors',
                    isActive('/billing') 
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <CreditCard className='h-5 w-5' aria-hidden='true' />
                  Billing
                </Link>
                <Link
                  href='/dashboard/property-types'
                  className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-md transition-colors',
                    isActive('/dashboard/property-types') 
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <MessageCircleQuestion className='h-5 w-5' aria-hidden='true' />
                  Q&A Management
                </Link>
                <Link
                  href='/todo'
                  className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-md transition-colors',
                    isActive('/todo') 
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <CheckSquare className='h-5 w-5' aria-hidden='true' />
                  Todo
                </Link>
                <Link
                  href='/dashboard/settings'
                  className={cn(
                    'flex items-center gap-4 px-2.5 py-2 rounded-md transition-colors',
                    isActive('/dashboard/settings') 
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Settings className='h-5 w-5' aria-hidden='true' />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className='flex items-center space-x-2'>
            <Home className='h-8 w-8 text-primary' />
            <Link href='/dashboard' className='text-2xl font-bold text-foreground hover:text-foreground/80 transition-colors'>
              Asset Evaluation
            </Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center space-x-6 text-sm font-medium'>
          <Link
            href='/dashboard'
            className={cn(
              'py-1 px-2 border-b-2 transition-colors',
              isActive('/dashboard') 
                ? 'text-primary border-primary font-semibold' 
                : 'text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground'
            )}
          >
            Dashboard
          </Link>
          <Link
            href='/dashboard/analytics'
            className={cn(
              'py-1 px-2 border-b-2 transition-colors',
              isActive('/dashboard/analytics') 
                ? 'text-primary border-primary font-semibold' 
                : 'text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground'
            )}
          >
            Analytics
          </Link>
          {/* Advanced Analytics link hidden - considered overkill */}
          {/* <Link
            href='/dashboard/advanced-analytics'
            className={cn(
              'pb-2 border-b-2 transition-colors',
              isActive('/dashboard/advanced-analytics') 
                ? 'text-primary border-primary font-semibold' 
                : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300'
            )}
          >
            Advanced Analytics
          </Link> */}
          <Link
            href='/dashboard/ai-insights'
            className={cn(
              'py-1 px-2 border-b-2 transition-colors',
              isActive('/dashboard/ai-insights') 
                ? 'text-primary border-primary font-semibold' 
                : 'text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground'
            )}
          >
            AI Insights
          </Link>
          <Link
            href='/dashboard/integrations'
            className={cn(
              'py-1 px-2 border-b-2 transition-colors',
              isActive('/dashboard/integrations') 
                ? 'text-primary border-primary font-semibold' 
                : 'text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground'
            )}
          >
            Integrations
          </Link>
          <Link
            href='/dashboard/property-types'
            className={cn(
              'py-1 px-2 border-b-2 transition-colors',
              isActive('/dashboard/property-types') 
                ? 'text-primary border-primary font-semibold' 
                : 'text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground'
            )}
          >
            Q&A Management
          </Link>
          <Link
            href='/dashboard/settings'
            className={cn(
              'py-1 px-2 border-b-2 transition-colors',
              isActive('/dashboard/settings') 
                ? 'text-primary border-primary font-semibold' 
                : 'text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground'
            )}
          >
            Settings
          </Link>
        </nav>

        {/* Right side actions */}
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground'
              aria-hidden='true'
            />
            <Input
              type='search'
              placeholder='Search...'
              className='w-[200px] lg:w-[320px] pl-9'
            />
          </div>

          {/* Theme Toggle Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon' className='h-9 w-9'>
                <Icons.Sun className='rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
                <Icons.Moon className='absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                <span className='sr-only'>Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Icons.Sun className='mr-2 h-4 w-4' />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Icons.Moon className='mr-2 h-4 w-4' />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Icons.Laptop className='mr-2 h-4 w-4' />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='overflow-hidden rounded-full h-9 w-9'
              >
                <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm'>
                  JD
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href='/dashboard/settings'>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/billing'>Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className='cursor-pointer'
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <LogOut className='mr-2 h-4 w-4' />
                )}
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

import { AnalyticsProvider } from '@/lib/analytics-client';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      <div className='min-h-screen bg-background'>
        <DashboardHeader />
        <main className='container mx-auto px-4 py-8'>
          {children}
        </main>
      </div>
    </AnalyticsProvider>
  );
}
