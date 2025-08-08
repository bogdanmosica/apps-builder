"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= rating;

    return (
      <Star
        key={index}
        className={cn(
          sizeClasses[size],
          isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
          "transition-colors",
        )}
      />
    );
  });

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">{stars}</div>
      {showValue && (
        <span
          className={cn("font-medium text-gray-700", textSizeClasses[size])}
        >
          {rating}/{maxRating}
        </span>
      )}
    </div>
  );
}
