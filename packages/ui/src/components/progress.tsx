"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-gray-200",
          className,
        )}
        {...props}
      >
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
