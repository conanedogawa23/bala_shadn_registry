'use client';

import React from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DEFAULT_CLINIC } from '@/lib/route-utils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-lg text-gray-600 mb-8">
        We&apos;re sorry, but there was an error loading this page.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={reset}>
          Try Again
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/clinic/${DEFAULT_CLINIC}`}>
            Go to Dashboard
          </Link>
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-red-50 text-red-800 rounded-md text-left max-w-2xl mx-auto">
          <h2 className="font-bold mb-2">Error Details:</h2>
          <p className="font-mono text-sm">{error.message}</p>
          {error.stack && (
            <pre className="mt-2 text-xs overflow-auto p-2 bg-red-100 rounded">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}