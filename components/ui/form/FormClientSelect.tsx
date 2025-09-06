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
  disabled = false
}: FormClientSelectProps) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Only fetch clients when there's a debounced search term (minimum 2 characters)
  const shouldFetch = debouncedSearchTerm.length >= 2;
  
  const { 
    clients, 
    loading, 
    error, 
    refetch 
  } = useClients({
    clinicName,
    limit: 100, // Backend maximum allowed limit
    search: debouncedSearchTerm,
    autoFetch: !!clinicName && shouldFetch // Only fetch when search term exists
  });

  // Transform clients into select options - only when we have search results
  const clientOptions = useMemo(() => {
    // No options if debounced search term is too short
    if (debouncedSearchTerm.length < 2) return [];
    
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
        // Find selected client for display
        const selectedClient = clientOptions.find(option => option.value === field.value);
        
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
                        {selectedClient ? selectedClient.label : placeholder}
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
                      {searchTerm.length < 2 ? (
                        <CommandEmpty>
                          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                            <Search className="h-8 w-8 opacity-50" />
                            <p>Type at least 2 characters to search</p>
                          </div>
                        </CommandEmpty>
                      ) : loading || (searchTerm !== debouncedSearchTerm && searchTerm.length >= 2) ? (
                        <CommandEmpty>
                          <div className="flex items-center justify-center gap-2 py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Searching clients...</span>
                          </div>
                        </CommandEmpty>
                      ) : clientOptions.length === 0 ? (
                        <CommandEmpty>
                          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                            <AlertCircle className="h-8 w-8 opacity-50" />
                            <p>No clients found matching "{debouncedSearchTerm}"</p>
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
                                setOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === option.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                {option.subtitle && (
                                  <span className="text-xs text-muted-foreground">
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
