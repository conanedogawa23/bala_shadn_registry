'use client';

import React, { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ClientsSearch } from './ClientsSearch';

interface ClientsSearchWrapperProps {
  initialSearch?: string;
}

export function ClientsSearchWrapper({ initialSearch = '' }: ClientsSearchWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearchChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set('search', value);
      params.set('page', '1'); // Reset to first page on new search
    } else {
      params.delete('search');
      params.delete('page');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  return (
    <ClientsSearch 
      initialValue={initialSearch}
      onSearchChange={handleSearchChange}
    />
  );
}

