'use client';

import { useEffect, useState } from 'react';
import MarketingLanding from '@/components/marketing-landing';
import EvaluationsOverview from '@/components/evaluations/EvaluationsOverview';

interface ClientAuthPageProps {
  initialIsLoggedIn: boolean;
  initialUserRole: string | null;
  initialEvaluations: any[];
  initialStats: any;
}

export default function ClientAuthPage({
  initialIsLoggedIn,
  initialUserRole,
  initialEvaluations,
  initialStats,
}: ClientAuthPageProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Check authentication status on client side
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });

        const clientIsLoggedIn = response.ok;
        
        // If there's a mismatch, reload the page to get fresh server-side data
        if (clientIsLoggedIn !== initialIsLoggedIn) {
          console.log('Auth state mismatch detected, reloading page', {
            server: initialIsLoggedIn,
            client: clientIsLoggedIn,
            userAgent: navigator.userAgent
          });
          window.location.reload();
          return;
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsReady(true);
      }
    };

    // Run check after a brief delay to ensure page is fully loaded
    const timer = setTimeout(checkAuthentication, 500);
    
    return () => clearTimeout(timer);
  }, [initialIsLoggedIn]);

  // Show loading state while checking authentication
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show evaluations overview for logged-in users
  if (initialIsLoggedIn) {
    return (
      <EvaluationsOverview 
        evaluations={initialEvaluations} 
        stats={initialStats}
        isLoggedIn={initialIsLoggedIn}
        userRole={initialUserRole}
      />
    );
  }

  // Show marketing landing for non-authenticated users
  return (
    <MarketingLanding 
      isLoggedIn={initialIsLoggedIn} 
      userRole={initialUserRole} 
    />
  );
}
