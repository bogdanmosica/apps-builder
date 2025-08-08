"use client";

import { useEffect, useState } from "react";
import EvaluationsOverview from "@/components/evaluations/EvaluationsOverview";
import MarketingLanding from "@/components/marketing-landing";

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

  // Safely handle potentially null/undefined props
  const safeEvaluations = Array.isArray(initialEvaluations)
    ? initialEvaluations
    : [];
  const safeStats =
    initialStats && typeof initialStats === "object"
      ? initialStats
      : {
          totalEvaluations: 0,
          averageScore: 0,
          bestScore: 0,
          completionRate: 0,
        };

  useEffect(() => {
    // Temporarily disable authentication check to stop infinite reload
    // TODO: Fix authentication state mismatch properly
    console.log("Auth check disabled to prevent infinite reload", {
      initialIsLoggedIn,
      timestamp: new Date().toISOString(),
    });
    setIsReady(true);

    /* ORIGINAL CODE - DISABLED TO PREVENT INFINITE RELOAD:
    const checkAuthentication = async () => {
      try {
        // Add timeout to prevent endless waiting
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
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
        // On error (including timeout), proceed with server-side data
        setIsReady(true);
      }
    };

    // Run check after a brief delay to ensure page is fully loaded
    const timer = setTimeout(checkAuthentication, 500);
    
    return () => clearTimeout(timer);
    */
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
        evaluations={safeEvaluations}
        stats={safeStats}
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
