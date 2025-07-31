'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Home, LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href='/pricing'
          className='text-sm font-medium text-gray-700 hover:text-gray-900'
        >
          Pricing
        </Link>
        <Button asChild className='rounded-full'>
          <Link href='/sign-up'>Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='hidden sm:block text-right'>
        <p className='text-sm font-medium text-gray-900'>
          {user.name || 'User'}
        </p>
        <p className='text-xs text-gray-500'>{user.email}</p>
      </div>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger>
          <Avatar className='cursor-pointer size-9'>
            <AvatarImage alt={user.name || ''} />
            <AvatarFallback>
              {user.email
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='flex flex-col gap-1'>
          <DropdownMenuItem className='cursor-pointer'>
            <Link href='/dashboard' className='flex w-full items-center'>
              <Home className='mr-2 h-4 w-4' />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className='cursor-pointer'>
            <Link href='/profile' className='flex w-full items-center'>
              <UserIcon className='mr-2 h-4 w-4' />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <form action={handleSignOut} className='w-full'>
            <button type='submit' className='flex w-full'>
              <DropdownMenuItem className='w-full flex-1 cursor-pointer'>
                <LogOut className='mr-2 h-4 w-4' />
                <span>Sign out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Header() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  return (
    <header className='border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-6'>
          <Link href='/' className='flex items-center'>
            <Home className='h-6 w-6 text-blue-600' />
            <span className='ml-2 text-xl font-semibold text-gray-900'>
              RoProperty
            </span>
          </Link>
          {user && (
            <nav className='hidden md:flex items-center gap-4'>
              <Link
                href='/properties'
                className='text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors'
              >
                Properties
              </Link>
              <Link
                href='/properties/add'
                className='text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors'
              >
                Add Property
              </Link>
              {user.role === 'admin' && (
                <Link
                  href='/admin/questions'
                  className='text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors'
                >
                  Manage Questions
                </Link>
              )}
              <Link
                href='/dashboard'
                className='text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors'
              >
                Dashboard
              </Link>
            </nav>
          )}
        </div>
        <div className='flex items-center space-x-4'>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='flex flex-col min-h-screen'>
      <Header />
      {children}
    </section>
  );
}
