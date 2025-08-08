"use client";

import { CircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface SafeCircleIconProps {
  className?: string;
}

export function SafeCircleIcon({ className }: SafeCircleIconProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a simple placeholder that matches the expected size
    return (
      <div
        className={className}
        style={{
          borderRadius: "50%",
          border: "2px solid currentColor",
          display: "inline-block",
        }}
      />
    );
  }

  return <CircleIcon className={className} />;
}
