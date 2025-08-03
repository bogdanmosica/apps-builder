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

  useEffect(() => {
    setIsClient(true);
    
    // Check authentication on client side for mobile compatibility
    const checkClientAuth = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        const isAuthenticated = response.ok;
        
        // If there's a mismatch between server and client auth state, refresh
        if (isLoggedIn !== isAuthenticated) {
          router.refresh();
        }
      } catch (error) {
        console.error('Client auth check failed:', error);
      }
    };

    // Only run client-side auth check on mobile devices
    const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // Add a small delay to avoid race conditions
      setTimeout(checkClientAuth, 100);
    }
  }, [isLoggedIn, router]);

  // Show loading state briefly while client-side check completes
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
