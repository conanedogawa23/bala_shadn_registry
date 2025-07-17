import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DEFAULT_CLINIC } from '@/lib/route-utils';

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href={`/clinic/${DEFAULT_CLINIC}`}>
            Go to Dashboard
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}