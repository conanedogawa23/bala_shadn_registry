'use client';

import React, { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OrdersPaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function OrdersPagination({ pagination }: OrdersPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handlePageChange = (page: number) => {
    const queryString = createQueryString('page', page.toString());
    router.push(`${pathname}?${queryString}`);
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      handlePageChange(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      handlePageChange(pagination.page + 1);
    }
  };

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-6">
      <div className="text-sm text-gray-500">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
        {pagination.total} orders
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={pagination.page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft size={16} />
        </Button>
        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          // Logic to show proper page range centered around current page
          let pageNum;
          if (pagination.totalPages <= 5) {
            pageNum = i + 1;
          } else {
            const middlePoint = Math.min(Math.max(pagination.page, 3), pagination.totalPages - 2);
            pageNum = middlePoint - 2 + i;
          }
          
          if (pageNum > 0 && pageNum <= pagination.totalPages) {
            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className={`h-8 w-8 p-0 ${pagination.page === pageNum ? 'bg-primary text-white' : ''}`}
              >
                {pageNum}
              </Button>
            );
          }
          return null;
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={pagination.page === pagination.totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

