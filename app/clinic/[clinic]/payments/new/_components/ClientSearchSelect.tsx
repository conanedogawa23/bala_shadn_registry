'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { AlertCircle, Loader2, Check, ChevronsUpDown, User } from 'lucide-react';
import { useClients } from '@/lib/hooks/useClients';
import { cn } from '@/lib/utils';

interface ClientOption {
  clientId: number;
  clientName: string;
  email: string;
  phone: string;
}

interface ClientSearchSelectProps {
  clinicName: string;
  selectedClientId: number | '';
  selectedClientName: string;
  onClientSelect: (clientId: number, clientName: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * ClientSearchSelect component for selecting clients in the payment form
 * Shows 20 clients by default and allows searching by name
 */
export function ClientSearchSelect({
  clinicName,
  selectedClientId,
  selectedClientName,
  onClientSelect,
  placeholder = "Search and select a client...",
  disabled = false,
  required = false,
  className
}: ClientSearchSelectProps) {
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

  // Fetch clients - always fetch 20 by default, apply search filter if provided
  const {
    clients,
    loading,
    error,
    refetch
  } = useClients({
    clinicName,
    limit: 20,
    search: debouncedSearchTerm || undefined,
    autoFetch: !!clinicName
  });

  // Transform clients into select options
  const clientOptions = useMemo<ClientOption[]>(() => {
    if (!clients || clients.length === 0) return [];

    return clients.map(client => {
      const firstName = client.firstName || '';
      const lastName = client.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const clientId = client.clientId || parseInt(client.id, 10);

      return {
        clientId: clientId,
        clientName: fullName || `Client ${clientId}`,
        email: client.email || '',
        phone: client.phone || ''
      };
    });
  }, [clients]);

  // Handle client selection
  const handleSelect = (option: ClientOption) => {
    onClientSelect(option.clientId, option.clientName);
    setOpen(false);
    setSearchTerm('');
  };

  // Clear search when popover opens
  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setDebouncedSearchTerm('');
    }
  }, [open]);

  // Display value
  const displayValue = selectedClientId && selectedClientName
    ? `${selectedClientName} (ID: ${selectedClientId})`
    : placeholder;

  return (
    <div className={cn("w-full", className)}>
      {error ? (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load clients: {error}</span>
            <button
              type="button"
              onClick={refetch}
              className="text-sm underline hover:no-underline ml-2"
            >
              Retry
            </button>
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
                !selectedClientId && "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <User className="h-4 w-4 shrink-0 opacity-50" />
                <span className="truncate">{displayValue}</span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search by client name..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />

              <CommandList className="max-h-[300px]">
                {loading || (searchTerm !== debouncedSearchTerm) ? (
                  <CommandEmpty>
                    <div className="flex items-center justify-center gap-2 py-6">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {searchTerm ? 'Searching clients...' : 'Loading clients...'}
                      </span>
                    </div>
                  </CommandEmpty>
                ) : clientOptions.length === 0 ? (
                  <CommandEmpty>
                    <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                      <User className="h-8 w-8 opacity-50" />
                      {debouncedSearchTerm ? (
                        <p>No clients found matching "{debouncedSearchTerm}"</p>
                      ) : (
                        <p>No clients available</p>
                      )}
                    </div>
                  </CommandEmpty>
                ) : (
                  <CommandGroup heading={debouncedSearchTerm ? `Results for "${debouncedSearchTerm}"` : "Recent Clients (20)"}>
                    {clientOptions.map((option) => (
                      <CommandItem
                        key={option.clientId}
                        value={`${option.clientName} ${option.email} ${option.phone}`}
                        onSelect={() => handleSelect(option)}
                        className="cursor-pointer py-3"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            selectedClientId === option.clientId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{option.clientName}</span>
                            <span className="text-xs text-muted-foreground">ID: {option.clientId}</span>
                          </div>
                          {(option.email || option.phone) && (
                            <span className="text-xs text-muted-foreground truncate">
                              {option.email || option.phone}
                            </span>
                          )}
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

