'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { AlertCircle, Loader2, Search, Check, ChevronsUpDown, User, Wrench, Building } from 'lucide-react';
import { ResourceApiService } from '@/lib/api/resourceService';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  resourceId: number;
  resourceName: string;
  type: 'practitioner' | 'service' | 'equipment' | 'room';
  practitioner?: {
    firstName?: string;
    lastName?: string;
    credentials?: string;
    specialties: string[];
  };
  service?: {
    category: string;
    duration: number;
  };
  clinics: string[];
  isActive: boolean;
  isBookable: boolean;
}

interface FormResourceSelectProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  clinicName: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'practitioner' | 'service' | 'equipment' | 'room';
}

/**
 * FormResourceSelect component for selecting resources in forms
 * Fetches resources from the API and displays them in a searchable dropdown
 */
export function FormResourceSelect({
  name,
  label,
  description,
  placeholder = "Select a resource...",
  className,
  clinicName,
  required = false,
  disabled = false,
  type
}: FormResourceSelectProps) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Only fetch resources when there's a debounced search term (minimum 2 characters)
  const shouldFetch = debouncedSearchTerm.length >= 2;

  // Fetch resources for the clinic based on debounced search term
  const fetchResources = async () => {
    if (!clinicName || !shouldFetch) {
      setResources([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Remove clinic filtering since all resources have empty clinic arrays
      const response = await ResourceApiService.getAllResources({
        // clinicName, // Skip clinic filtering for now
        type,
        isActive: true,
        isBookable: true,
        limit: 100
      });

      // Filter resources by debounced search term (client-side filtering)
      const filteredResources = response.resources?.filter(resource => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const resourceName = resource.resourceName?.toLowerCase() || '';
        const name = resource.name?.toLowerCase() || '';
        const fullName = resource.fullName?.toLowerCase() || '';
        const practitionerName = resource.practitioner 
          ? `${resource.practitioner.firstName || ''} ${resource.practitioner.lastName || ''}`.toLowerCase()
          : '';
        const serviceCategory = resource.service?.category?.toLowerCase() || '';
        
        return resourceName.includes(searchLower) || 
               name.includes(searchLower) ||
               fullName.includes(searchLower) ||
               practitionerName.includes(searchLower) || 
               serviceCategory.includes(searchLower);
      }) || [];

      setResources(filteredResources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [clinicName, type, debouncedSearchTerm, shouldFetch]);

  // Get icon for resource type
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'practitioner':
        return <User className="h-4 w-4" />;
      case 'service':
        return <Wrench className="h-4 w-4" />;
      case 'equipment':
        return <Building className="h-4 w-4" />;
      case 'room':
        return <Building className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Transform resources into select options - only when we have search results
  const resourceOptions = useMemo(() => {
    // No options if debounced search term is too short
    if (debouncedSearchTerm.length < 2) return [];
    
    if (!resources || resources.length === 0) return [];

    return resources.map(resource => {
      // Handle field name variations from API
      const resourceName = resource.resourceName || resource.name || resource.fullName;
      let displayName = resourceName;
      let subtitle = '';

      if (resource.type === 'practitioner' && resource.practitioner) {
        const { firstName, lastName, credentials, specialties } = resource.practitioner;
        const practitionerName = `${firstName || ''} ${lastName || ''}`.trim();
        displayName = practitionerName || resourceName;
        if (credentials) displayName += `, ${credentials}`;
        subtitle = specialties?.join(', ') || '';
      } else if (resource.type === 'service' && resource.service) {
        subtitle = `${resource.service.category} • ${resource.service.duration} min`;
      }

      return {
        value: (resource.resourceId || resource.id).toString(),
        label: displayName,
        subtitle,
        type: resource.type,
        resource
      };
    });
  }, [resources, debouncedSearchTerm]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Find selected resource for display
        const selectedResource = resourceOptions.find(option => option.value === field.value?.toString());
        
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
                  <span>Failed to load resources: {error}</span>
                  <button
                    type="button"
                    onClick={fetchResources}
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
                      <div className="flex items-center gap-2 truncate">
                        {selectedResource && getResourceIcon(selectedResource.type)}
                        <span className="truncate">
                          {selectedResource ? selectedResource.label : placeholder}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={`Type to search ${type || 'resources'}...`}
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
                            <span className="text-sm text-muted-foreground">Searching resources...</span>
                          </div>
                        </CommandEmpty>
                      ) : resourceOptions.length === 0 ? (
                        <CommandEmpty>
                          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                            <AlertCircle className="h-8 w-8 opacity-50" />
                            <p>No {type || 'resources'} found matching "{debouncedSearchTerm}"</p>
                          </div>
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {resourceOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.resource.resourceName || option.resource.name || ''}
                              onSelect={() => {
                                field.onChange(parseInt(option.value, 10));
                                setOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.toString() === option.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-3">
                                {getResourceIcon(option.type)}
                                <div className="flex flex-col">
                                  <span className="font-medium">{option.label}</span>
                                  {option.subtitle && (
                                    <span className="text-xs text-muted-foreground">
                                      {option.subtitle}
                                    </span>
                                  )}
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
            
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
