'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    isLoading: true,
  });

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.id) {
          setAuthState({
            isLoggedIn: true,
            user: userData,
            isLoading: false,
          });
        } else {
          setAuthState({
            isLoggedIn: false,
            user: null,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          isLoggedIn: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      setAuthState({
        isLoggedIn: false,
        user: null,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen for auth changes (from login/logout)
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Custom event listener for auth changes
    window.addEventListener('auth-changed', handleAuthChange);
    
    // Check auth status periodically
    const interval = setInterval(checkAuthStatus, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  return authState;
}

// Helper function to trigger auth state refresh
export function triggerAuthRefresh() {
  window.dispatchEvent(new CustomEvent('auth-changed'));
}
