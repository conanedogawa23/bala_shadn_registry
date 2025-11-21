'use client';

import React, { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ClientsPaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function ClientsPagination({ pagination }: ClientsPaginationProps) {
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
    router.push(`${pathname}?${queryString}`, { scroll: false });
    router.refresh();
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrev) {
      handlePageChange(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      handlePageChange(pagination.page + 1);
    }
  };

  if (pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t gap-4">
      <div className="text-sm text-gray-700 order-2 sm:order-1">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
        {pagination.total} clients
      </div>
      
      <div className="flex items-center space-x-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={!pagination.hasPrev}
          className="px-3 py-1.5 text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>
        
        {/* Smart Page numbers with ellipsis */}
        <div className="flex items-center space-x-1">
          {/* First page */}
          {pagination.page > 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                className="w-8 h-8 p-0 text-xs sm:text-sm"
              >
                1
              </Button>
              {pagination.page > 4 && (
                <span className="px-2 text-gray-400">...</span>
              )}
            </>
          )}
          
          {/* Pages around current page */}
          {Array.from({ length: 5 }, (_, i) => {
            const pageNum = pagination.page - 2 + i;
            if (pageNum < 1 || pageNum > pagination.pages) return null;
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="w-8 h-8 p-0 text-xs sm:text-sm"
              >
                {pageNum}
              </Button>
            );
          })}
          
          {/* Last page */}
          {pagination.page < pagination.pages - 2 && (
            <>
              {pagination.page < pagination.pages - 3 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.pages)}
                className="w-8 h-8 p-0 text-xs sm:text-sm"
              >
                {pagination.pages}
              </Button>
            </>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!pagination.hasNext}
          className="px-3 py-1.5 text-xs sm:text-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

