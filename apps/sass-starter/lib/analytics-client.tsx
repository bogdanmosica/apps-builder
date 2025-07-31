'use client';

import { createContext, useContext, useEffect, ReactNode, ReactElement } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsContextType {
  trackPageView: (path?: string, data?: any) => void;
  trackEvent: (event: string, data?: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
  enableTracking?: boolean;
  trackAdminPages?: boolean;
}

// Helper function to format URLs cleanly
function formatCleanUrl(path: string): string {
  // Remove encoded characters and make URLs readable
  return path
    .replace(/%2F/g, '/')
    .replace(/%20/g, ' ')
    .replace(/_/g, '/');
}

// Helper function to check if path should be tracked
function shouldTrackPath(path: string, trackAdminPages: boolean = false): boolean {
  // Skip admin/dashboard pages unless explicitly enabled
  if (!trackAdminPages && (path.includes('/dashboard') || path.includes('/admin'))) {
    return false;
  }
  
  // Skip API routes and internal Next.js routes
  if (path.startsWith('/api') || path.startsWith('/_next')) {
    return false;
  }
  
  return true;
}

export function AnalyticsProvider({ 
  children, 
  enableTracking = true,
  trackAdminPages = false 
}: AnalyticsProviderProps): ReactElement {
  const pathname = usePathname();

  const trackPageView = async (customPath?: string, data?: any) => {
    if (!enableTracking) return;
    
    const path = customPath || pathname;
    
    if (!shouldTrackPath(path, trackAdminPages)) {
      return;
    }

    const cleanPath = formatCleanUrl(path);

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'page_view',
          path: cleanPath,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackEvent = async (event: string, data?: any) => {
    if (!enableTracking) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: event,
          path: formatCleanUrl(pathname),
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  // Auto-track page views when pathname changes
  useEffect(() => {
    if (shouldTrackPath(pathname, trackAdminPages)) {
      trackPageView();
    }
  }, [pathname, trackAdminPages]);

  return (
    <AnalyticsContext.Provider value={{ trackPageView, trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Auto-tracking hook for specific pages
export function usePageTracking(path?: string) {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    if (path) {
      trackPageView(path);
    }
  }, [path, trackPageView]);
}

// Component to easily add tracking to any page
interface PageTrackerProps {
  path?: string;
  children?: ReactNode;
}

export function PageTracker({ path, children }: PageTrackerProps) {
  usePageTracking(path);
  return children ? <>{children}</> : null;
}
