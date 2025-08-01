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
import { Icons } from '@workspace/ui/components/icons';
import { LogoutButton } from './logout-button';
import { Home, Plus } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface NavigationProps {
  isLoggedIn: boolean;
  userRole: string | null;
}

export default function Navigation({ isLoggedIn, userRole }: NavigationProps) {
  const { setTheme } = useTheme();

  return (
    <div className='sticky top-0 z-50 w-full flex justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700'>
      <div className='w-full max-w-6xl px-4 py-4 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Home className='h-8 w-8 text-blue-600 dark:text-blue-400' />
          <Link href='/' className='text-2xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors'>
            PropertyEval
          </Link>
        </div>
        <nav className='hidden md:flex items-center space-x-6'>
          <Link
            href='/#how-it-works'
            className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
          >
            How it Works
          </Link>
          <Link
            href='/#testimonials'
            className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
          >
            User Stories
          </Link>
          <Link
            href='/#faq'
            className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
          >
            FAQ
          </Link>
        </nav>
        <div className='flex items-center space-x-2'>
          {isLoggedIn ? (
            <div className='flex items-center space-x-4'>
              {userRole === 'owner' || userRole === 'admin' ? (
                <Button asChild>
                  <Link href='/dashboard'>Go to Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="icon" title="Start Property Evaluation">
                  <Link href='/evaluation'>
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              
              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    className='overflow-hidden rounded-full'
                  >
                    <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm'>
                      U
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href='/evaluation'>Property Evaluation</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  {userRole === 'owner' || userRole === 'admin' ? (
                    <DropdownMenuItem asChild>
                      <Link href='/dashboard'>Dashboard</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Theme</DropdownMenuLabel>
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
                  <DropdownMenuSeparator />
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              {/* Theme toggle for non-logged-in users */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='h-8 w-8 px-0' size='sm' variant='ghost'>
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
              <Button variant='ghost' asChild>
                <Link href='/sign-in'>Sign In</Link>
              </Button>
              <Button asChild>
                <Link href='/sign-up'>Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
