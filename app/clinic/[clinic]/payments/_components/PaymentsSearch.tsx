'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PaymentsSearchProps {
  initialValue?: string;
}

export function PaymentsSearch({ initialValue = '' }: PaymentsSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localSearch, setLocalSearch] = useState(initialValue);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Sync local state with URL when navigating back/forward
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setLocalSearch(urlSearch);
  }, [searchParams]);

  const handleSearchChange = useCallback((value: string) => {
    // Update local state immediately for responsive UI
    setLocalSearch(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced server request
    debounceTimerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set('search', value);
        params.set('page', '1'); // Reset to first page on new search
      } else {
        params.delete('search');
        params.delete('page');
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      router.refresh();
    }, 500); // 500ms debounce delay
  }, [router, pathname, searchParams]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    handleSearchChange('');
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search by payment #, client name, or order #..."
        value={localSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-10 pr-8"
      />
      {localSearch && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
