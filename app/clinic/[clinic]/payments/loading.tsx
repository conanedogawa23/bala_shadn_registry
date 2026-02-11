import React from 'react';

function SkeletonCard() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-8 flex-1 bg-gray-200 rounded" />
          <div className="h-8 flex-1 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function PaymentsLoading() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Search skeleton */}
      <div className="mb-6 space-y-4">
        <div className="h-10 w-full max-w-md bg-gray-100 rounded-md animate-pulse" />
        {/* Filter bar skeleton */}
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-[160px] bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-[160px] bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-[150px] bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-[150px] bg-gray-100 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Payment cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
