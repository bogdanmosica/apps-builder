'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@workspace/ui/components/dropdown-menu';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
  );
}
