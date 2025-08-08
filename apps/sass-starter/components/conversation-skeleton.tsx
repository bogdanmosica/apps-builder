"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import { TableCell, TableRow } from "@workspace/ui/components/table";

export function ConversationRowSkeleton() {
  return (
    <TableRow>
      {/* Participant */}
      <TableCell>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </TableCell>

      {/* Type */}
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>

      {/* Last Message */}
      <TableCell>
        <Skeleton className="h-4 w-48" />
      </TableCell>

      {/* Status/Time */}
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex space-x-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-100">
      {/* Avatar skeleton */}
      <Skeleton className="h-10 w-10 rounded-full" />

      <div className="flex-1 space-y-2">
        {/* Name skeleton */}
        <Skeleton className="h-4 w-32" />
        {/* Email skeleton */}
        <Skeleton className="h-3 w-48" />
        {/* Message preview skeleton */}
        <Skeleton className="h-3 w-64" />
      </div>

      <div className="flex flex-col items-end space-y-2">
        {/* Time skeleton */}
        <Skeleton className="h-3 w-12" />
        {/* Badge skeleton */}
        <Skeleton className="h-5 w-16" />
      </div>

      {/* Action buttons skeleton */}
      <div className="flex space-x-1">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

export function ConversationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ConversationRowSkeleton key={index} />
      ))}
    </>
  );
}
