'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthWrapperProps {
  isLoggedIn: boolean;
  children: React.ReactNode;
}

export default function AuthWrapper({ isLoggedIn, children }: AuthWrapperProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Always check authentication on client side for mobile devices
    const checkClientAuth = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        
        const isAuthenticated = response.ok;
        
        // Debug logging for mobile
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile) {
          console.log('Mobile auth check:', {
            serverIsLoggedIn: isLoggedIn,
            clientIsAuthenticated: isAuthenticated,
            responseStatus: response.status,
            mismatch: isLoggedIn !== isAuthenticated
          });
        }
        
        // If there's a mismatch between server and client auth state, handle it
        if (isLoggedIn !== isAuthenticated) {
          if (isAuthenticated && !isLoggedIn) {
            // Client shows user is authenticated but server doesn't - force refresh
            console.log('Client authenticated but server not - refreshing');
            window.location.reload();
          } else if (!isAuthenticated && isLoggedIn) {
            // Server shows user is authenticated but client doesn't - force refresh
            console.log('Server authenticated but client not - refreshing');
            window.location.reload();
          }
        }
        
        setAuthChecked(true);
      } catch (error) {
        console.error('Client auth check failed:', error);
        setAuthChecked(true);
      }
    };

    // Check on all devices, but especially important for mobile
    setTimeout(checkClientAuth, 100);
  }, [isLoggedIn, router]);

  // Show loading state while checking authentication
  if (!isClient || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
