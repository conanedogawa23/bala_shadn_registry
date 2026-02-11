'use client';

import React, { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const PAYMENT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'partial', label: 'Partial' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'writeoff', label: 'Write-off' }
];

const PAYMENT_METHODS = [
  { value: 'all', label: 'All Methods' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Debit', label: 'Debit' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Other', label: 'Other' }
];

export function PaymentsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || 'all';
  const currentMethod = searchParams.get('paymentMethod') || 'all';
  const currentStartDate = searchParams.get('startDate') || '';
  const currentEndDate = searchParams.get('endDate') || '';
  const isOutstanding = searchParams.get('outstanding') === 'true';

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to page 1 when filter changes
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    router.refresh();
  }, [router, pathname, searchParams]);

  const toggleOutstanding = useCallback((checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set('outstanding', 'true');
    } else {
      params.delete('outstanding');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    router.refresh();
  }, [router, pathname, searchParams]);

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    // Preserve search if it exists
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    router.refresh();
  }, [router, pathname, searchParams]);

  // Count active filters
  const activeFilterCount = [
    currentStatus !== 'all' ? 1 : 0,
    currentMethod !== 'all' ? 1 : 0,
    currentStartDate ? 1 : 0,
    currentEndDate ? 1 : 0,
    isOutstanding ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {/* Filter controls row */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </div>

        {/* Status filter */}
        <Select
          value={currentStatus}
          onValueChange={(value) => updateFilter('status', value)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment method filter */}
        <Select
          value={currentMethod}
          onValueChange={(value) => updateFilter('paymentMethod', value)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range filters */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Input
            type="date"
            value={currentStartDate}
            onChange={(e) => updateFilter('startDate', e.target.value)}
            className="w-full sm:w-[150px] text-sm"
            placeholder="Start date"
          />
          <span className="hidden sm:inline text-gray-400 text-sm">to</span>
          <Input
            type="date"
            value={currentEndDate}
            onChange={(e) => updateFilter('endDate', e.target.value)}
            className="w-full sm:w-[150px] text-sm"
            placeholder="End date"
          />
        </div>

        {/* Outstanding toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="outstanding-filter"
            checked={isOutstanding}
            onCheckedChange={toggleOutstanding}
          />
          <Label htmlFor="outstanding-filter" className="text-sm cursor-pointer">
            Outstanding only
          </Label>
        </div>
      </div>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {currentStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {PAYMENT_STATUSES.find(s => s.value === currentStatus)?.label}
              <button onClick={() => updateFilter('status', 'all')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentMethod !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Method: {PAYMENT_METHODS.find(m => m.value === currentMethod)?.label}
              <button onClick={() => updateFilter('paymentMethod', 'all')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentStartDate && (
            <Badge variant="secondary" className="gap-1">
              From: {currentStartDate}
              <button onClick={() => updateFilter('startDate', '')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentEndDate && (
            <Badge variant="secondary" className="gap-1">
              To: {currentEndDate}
              <button onClick={() => updateFilter('endDate', '')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {isOutstanding && (
            <Badge variant="secondary" className="gap-1">
              Outstanding only
              <button onClick={() => toggleOutstanding(false)} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs h-6 px-2"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
