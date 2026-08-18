import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
    <div className="space-y-2">
      <SkeletonLoader className="h-5 w-1/3" />
      <SkeletonLoader className="h-4 w-1/4" />
    </div>
    <SkeletonLoader className="h-24 w-full" />
    <div className="flex gap-2 pt-4">
      <SkeletonLoader className="h-10 w-24" />
      <SkeletonLoader className="h-10 w-24" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center space-x-4 py-4 px-4 border-b">
    <SkeletonLoader className="h-10 w-10 rounded-full" />
    <div className="space-y-2 flex-1">
      <SkeletonLoader className="h-4 w-1/4" />
      <SkeletonLoader className="h-4 w-1/5" />
    </div>
    <SkeletonLoader className="h-8 w-20 rounded-full" />
    <SkeletonLoader className="h-8 w-8 rounded-md" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <SkeletonLoader className="h-6 w-32" />
        <SkeletonLoader className="h-4 w-48" />
      </div>
      <SkeletonLoader className="h-8 w-24" />
    </div>
    <SkeletonLoader className="h-[300px] w-full rounded-lg" />
  </div>
);
