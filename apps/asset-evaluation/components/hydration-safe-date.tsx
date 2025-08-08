"use client";

import { useEffect, useState } from "react";

// Utility function for consistent date formatting
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Component to handle hydration-safe date display
export function HydrationSafeDate({
  date,
  className = "",
}: {
  date: string | Date;
  className?: string;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a consistent format for SSR
    return <span className={className}>{formatDate(date)}</span>;
  }

  // Client-side rendering
  return <span className={className}>{formatDate(date)}</span>;
}

export default HydrationSafeDate;
