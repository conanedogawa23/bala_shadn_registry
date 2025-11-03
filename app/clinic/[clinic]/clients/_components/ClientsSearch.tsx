'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ClientsSearchProps {
  initialValue?: string;
  onSearchChange: (value: string) => void;
  debounceMs?: number;
}

export function ClientsSearch({ 
  initialValue = '', 
  onSearchChange,
  debounceMs = 500 
}: ClientsSearchProps) {
  const [searchValue, setSearchValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange, debounceMs]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search clients by name, email, or phone..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

