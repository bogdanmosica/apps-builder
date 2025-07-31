'use client';

import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardContent } from '@workspace/ui/components/card';

export function StatCardSkeleton() {
  return (
    <Card className="shadow-sm bg-gradient-to-br from-white to-gray-50/50">
      <CardContent className='p-0'>
        {/* Header with Icon */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className='h-9 w-9 rounded-lg' />
            <Skeleton className='h-6 w-12 rounded-full' />
          </div>
          
          {/* Title */}
          <Skeleton className='h-4 w-20 mb-1' />
        </div>

        {/* Main Value */}
        <div className="px-4 pb-2">
          <Skeleton className='h-9 w-16' />
        </div>

        {/* Description */}
        <div className="px-4 pb-4">
          <Skeleton className='h-3 w-24' />
        </div>
        
        {/* Bottom accent bar */}
        <Skeleton className="h-1 w-full rounded-none" />
      </CardContent>
    </Card>
  );
}

export function StatsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6'>
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}
