'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ClientsTable } from './ClientsTable';

interface Client {
  id: string;
  clientId?: number;
  firstName: string;
  lastName: string;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  // Enrichment data from backend
  nextAppointment?: {
    date: string;
    subject: string;
    formattedDate: string;
  } | null;
  totalOrders?: number;
  [key: string]: string | number | object | null | undefined;
}

interface ClientsTableWrapperProps {
  clients: Client[];
  clinicName: string;
  initialSearch?: string;
}

export function ClientsTableWrapper({ 
  clients, 
  clinicName,
  initialSearch = ''
}: ClientsTableWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update local search when initial search changes (e.g., browser back/forward)
  useEffect(() => {
    setLocalSearch(initialSearch);
  }, [initialSearch]);

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

  return (
    <ClientsTable 
      clients={clients}
      clinicName={clinicName}
      searchValue={localSearch}
      onSearchChange={handleSearchChange}
    />
  );
}

