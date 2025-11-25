'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Check, ChevronsUpDown, FileText, DollarSign } from 'lucide-react';
import { useOrderSearch } from '@/lib/hooks/useOrders';
import { OrderService } from '@/lib/api/orderService';
import { cn } from '@/lib/utils';

interface OrderOption {
  orderNumber: string;
  clientId: number;
  clientName: string;
  totalAmount: number;
  serviceDate: string;
  status: string;
  paymentStatus: string;
}

interface OrderSearchSelectProps {
  clinicName: string;
  selectedOrderNumber: string;
  onOrderSelect: (orderNumber: string, clientId: number, clientName: string, totalAmount: number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * OrderSearchSelect component for selecting orders in the payment form
 * Allows searching by order number/ID
 */
export function OrderSearchSelect({
  clinicName,
  selectedOrderNumber,
  onOrderSelect,
  placeholder = "Search by order number...",
  disabled = false,
  required = false,
  className
}: OrderSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Use order search hook
  const {
    searchOrders,
    orders,
    loading,
    error
  } = useOrderSearch({
    clinicName,
    limit: 20
  });

  // Search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchOrders(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchOrders]);

  // Transform orders into select options
  const orderOptions = useMemo<OrderOption[]>(() => {
    if (!orders || orders.length === 0) return [];

    return orders.map(order => ({
      orderNumber: order.orderNumber,
      clientId: order.clientId,
      clientName: order.clientName || 'Unknown Client',
      totalAmount: order.totalAmount || 0,
      serviceDate: order.serviceDate,
      status: order.status,
      paymentStatus: order.paymentStatus
    }));
  }, [orders]);

  // Handle order selection
  const handleSelect = useCallback((option: OrderOption) => {
    onOrderSelect(option.orderNumber, option.clientId, option.clientName, option.totalAmount);
    setOpen(false);
    setSearchTerm('');
  }, [onOrderSelect]);

  // Clear search when popover opens
  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setDebouncedSearchTerm('');
    }
  }, [open]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Display value
  const displayValue = selectedOrderNumber
    ? `Order #${selectedOrderNumber}`
    : placeholder;

  return (
    <div className={cn("w-full", className)}>
      {error ? (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to search orders: {error}</span>
          </AlertDescription>
        </Alert>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-required={required}
              disabled={disabled}
              className={cn(
                "w-full justify-between font-normal h-10",
                !selectedOrderNumber && "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 shrink-0 opacity-50" />
                <span className="truncate">{displayValue}</span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[450px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search by order number..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />

              <CommandList className="max-h-[300px]">
                {loading || (searchTerm !== debouncedSearchTerm) ? (
                  <CommandEmpty>
                    <div className="flex items-center justify-center gap-2 py-6">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Searching orders...
                      </span>
                    </div>
                  </CommandEmpty>
                ) : !debouncedSearchTerm ? (
                  <CommandEmpty>
                    <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                      <FileText className="h-8 w-8 opacity-50" />
                      <p>Enter an order number to search</p>
                    </div>
                  </CommandEmpty>
                ) : orderOptions.length === 0 ? (
                  <CommandEmpty>
                    <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                      <FileText className="h-8 w-8 opacity-50" />
                      <p>No orders found matching "{debouncedSearchTerm}"</p>
                    </div>
                  </CommandEmpty>
                ) : (
                  <CommandGroup heading={`Results for "${debouncedSearchTerm}"`}>
                    {orderOptions.map((option) => (
                      <CommandItem
                        key={option.orderNumber}
                        value={option.orderNumber}
                        onSelect={() => handleSelect(option)}
                        className="cursor-pointer py-3"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            selectedOrderNumber === option.orderNumber ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Order #{option.orderNumber}</span>
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded",
                              option.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                              option.paymentStatus === 'partial' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            )}>
                              {option.paymentStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{option.clientName}</span>
                            <span>•</span>
                            <span>{formatDate(option.serviceDate)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {OrderService.formatCurrency(option.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

