'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface OrdersSearchProps {
  initialSearch?: string;
  totalOrders: number;
}

export function OrdersSearch({ initialSearch = '', totalOrders }: OrdersSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialSearch);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchChange(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearchChange]);

  return (
    <Card className="shadow-sm border border-gray-200 mb-8">
      <CardHeader className="bg-slate-50 pb-3 pt-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Search size={16} />
          Search Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        <div className="relative">
          <Label htmlFor="orderSearch" className="sr-only">Search Orders</Label>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            id="orderSearch"
            placeholder="Search by order number, client name, status, or date..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end mt-2">
          <span className="text-sm text-gray-500">
            {totalOrders} orders found
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

