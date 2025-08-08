"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EnhancedAuth from "@/components/enhanced-auth";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const [currentMode, setCurrentMode] = useState<
    "signin" | "signup" | "forgot-password" | "verify-email"
  >(mode);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // biome-ignore lint/correctness/useExhaustiveDependencies: < explanation>
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    // Check if user is already authenticated
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();

          // Only show success toast and redirect if user data exists and has an ID
          if (userData?.id && isMounted) {
            const userRole = userData.role || "member";
            const isAdminUser = userRole === "owner" || userRole === "admin";

            toast.success("You are already signed in!", {
              description: isAdminUser
                ? "Redirecting to your dashboard..."
                : "Redirecting to your evaluations...",
            });

            setTimeout(() => {
              if (isMounted) {
                if (isAdminUser) {
                  router.push("/dashboard");
                } else {
                  router.push("/evaluation"); // Redirect regular users to evaluations
                }
              }
            }, 1000);
            return; // Don't set isCheckingAuth to false if redirecting
          }
          // If userData is null or doesn't have an ID, user is not authenticated
        }
      } catch (error) {
        // User is not authenticated, stay on auth page
        console.log("User not authenticated, showing auth form");
      } finally {
        // Only set to false if we're not redirecting and component is still mounted
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuthStatus();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {isCheckingAuth ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-600">Checking authentication...</p>
          </div>
        </div>
      ) : (
        <EnhancedAuth mode={currentMode} onModeChange={setCurrentMode} />
      )}
    </div>
  );
}
