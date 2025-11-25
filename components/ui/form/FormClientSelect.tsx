'use client';

import React, { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
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
import { AlertCircle, Loader2, Search, Check, ChevronsUpDown } from 'lucide-react';
import { useClients } from '@/lib/hooks/useClients';
import { cn } from '@/lib/utils';

interface FormClientSelectProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  clinicName: string;
  required?: boolean;
  disabled?: boolean;
  defaultClientName?: string; // For pre-populated edit forms
}

/**
 * FormClientSelect component for selecting clients in forms
 * Fetches clients from the API and displays them in a searchable dropdown
 */
export function FormClientSelect({
  name,
  label,
  description,
  placeholder = "Select a client...",
  className,
  clinicName,
  required = false,
  disabled = false,
  defaultClientName
}: FormClientSelectProps) {
  const { control, getValues } = useFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedClientInfo, setSelectedClientInfo] = useState<{ id: string; name: string } | null>(null);

  // Debounce search term to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch clients - show 20 by default, or search when user types
  const { 
    clients, 
    loading, 
    error, 
    refetch 
  } = useClients({
    clinicName,
    limit: 20, // Show 20 clients by default (similar to payment page)
    search: debouncedSearchTerm || undefined,
    autoFetch: !!clinicName // Always fetch when clinic is available
  });

  // Set initial selected client info from defaultClientName
  React.useEffect(() => {
    if (defaultClientName && !selectedClientInfo) {
      const currentValue = getValues(name);
      if (currentValue) {
        setSelectedClientInfo({
          id: currentValue,
          name: defaultClientName
        });
      }
    }
  }, [defaultClientName, name, getValues, selectedClientInfo]);

  // Transform clients into select options
  const clientOptions = useMemo(() => {
    if (!clients || clients.length === 0) return [];

    // Backend already filters by search term, so we can use all returned clients
    return clients.map(client => {
      // Get client display name using actual API structure
      const firstName = client.firstName || '';
      const lastName = client.lastName || '';
      const displayName = `${firstName} ${lastName}`.trim();
      
      // Use client email and phone from flat structure
      const email = client.email || '';
      const phone = client.phone || '';
      const label = displayName || email || `Client ${client.id}`;

      return {
        value: client.id,
        label: label,
        subtitle: email || phone || '',
        client: client,
        searchText: `${label} ${email} ${phone}`.toLowerCase()
      };
    });
  }, [clients, debouncedSearchTerm]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Find selected client for display - check clientOptions first, then fallback to selectedClientInfo
        let selectedClient = clientOptions.find(option => option.value === field.value);
        
        // If not found in options but we have selectedClientInfo, use that for display
        const displayLabel = selectedClient 
          ? selectedClient.label 
          : (selectedClientInfo && field.value === selectedClientInfo.id)
            ? selectedClientInfo.name
            : null;
        
        return (
          <FormItem className={cn("w-full", className)}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
            )}
            
            {error ? (
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Failed to load clients: {error}</span>
                  <button
                    type="button"
                    onClick={refetch}
                    className="text-sm underline hover:no-underline"
                  >
                    Retry
                  </button>
                </AlertDescription>
              </Alert>
            ) : (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      disabled={disabled}
                      className={cn(
                        "w-full justify-between font-normal",
                        !field.value && "text-muted-foreground",
                        fieldState.error && "border-destructive focus:ring-destructive"
                      )}
                    >
                      <span className="truncate">
                        {displayLabel || placeholder}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Type to search clients..."
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
                            <AlertCircle className="h-8 w-8 opacity-50" />
                            {debouncedSearchTerm ? (
                              <p>No clients found matching "{debouncedSearchTerm}"</p>
                            ) : (
                              <p>No clients available</p>
                            )}
                          </div>
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {clientOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.searchText}
                              onSelect={() => {
                                field.onChange(option.value);
                                setSelectedClientInfo({ id: option.value, name: option.label });
                                setOpen(false);
                              }}
                              className="cursor-pointer py-3"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  field.value === option.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-medium truncate">{option.label}</span>
                                {option.subtitle && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {option.subtitle}
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
            
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
