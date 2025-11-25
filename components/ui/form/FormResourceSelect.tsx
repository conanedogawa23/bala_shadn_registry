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
  defaultResourceName?: string; // For pre-populated edit forms
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
  type,
  defaultResourceName
}: FormResourceSelectProps) {
  const { control, getValues } = useFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResourceInfo, setSelectedResourceInfo] = useState<{ id: number; name: string } | null>(null);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch resources for the clinic - show 20 by default, filter when user searches
  const fetchResources = async () => {
    if (!clinicName) {
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

      // Filter resources by debounced search term if provided (client-side filtering)
      let filteredResources = response.resources || [];
      
      if (debouncedSearchTerm) {
        filteredResources = filteredResources.filter(resource => {
          const searchLower = debouncedSearchTerm.toLowerCase();
          const resourceName = resource.resourceName?.toLowerCase() || '';
          const practitionerName = resource.practitioner 
            ? `${resource.practitioner.firstName || ''} ${resource.practitioner.lastName || ''}`.toLowerCase()
            : '';
          const serviceCategory = resource.service?.category?.toLowerCase() || '';
          
          return resourceName.includes(searchLower) || 
                 practitionerName.includes(searchLower) || 
                 serviceCategory.includes(searchLower);
        });
      }
      
      // Limit to first 20 if no search term
      if (!debouncedSearchTerm) {
        filteredResources = filteredResources.slice(0, 20);
      }

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
  }, [clinicName, type, debouncedSearchTerm]);

  // Set initial selected resource info from defaultResourceName
  useEffect(() => {
    if (defaultResourceName && !selectedResourceInfo) {
      const currentValue = getValues(name);
      if (currentValue) {
        setSelectedResourceInfo({
          id: currentValue,
          name: defaultResourceName
        });
      }
    }
  }, [defaultResourceName, name, getValues, selectedResourceInfo]);

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

  // Transform resources into select options
  const resourceOptions = useMemo(() => {
    if (!resources || resources.length === 0) return [];

    return resources.map(resource => {
      // Handle field name from API
      const resourceName = resource.resourceName;
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
        // Find selected resource for display - check resourceOptions first, then fallback to selectedResourceInfo
        let selectedResource = resourceOptions.find(option => option.value === field.value?.toString());
        
        // If not found in options but we have selectedResourceInfo, use that for display
        const displayLabel = selectedResource 
          ? selectedResource.label 
          : (selectedResourceInfo && field.value === selectedResourceInfo.id)
            ? selectedResourceInfo.name
            : null;
        
        const displayType = selectedResource?.type || 'practitioner';
        
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
                        {(displayLabel || selectedResource) && getResourceIcon(displayType)}
                        <span className="truncate">
                          {displayLabel || placeholder}
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
                      {loading || (searchTerm !== debouncedSearchTerm) ? (
                        <CommandEmpty>
                          <div className="flex items-center justify-center gap-2 py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              {searchTerm ? `Searching ${type || 'resources'}...` : `Loading ${type || 'resources'}...`}
                            </span>
                          </div>
                        </CommandEmpty>
                      ) : resourceOptions.length === 0 ? (
                        <CommandEmpty>
                          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                            <AlertCircle className="h-8 w-8 opacity-50" />
                            {debouncedSearchTerm ? (
                              <p>No {type || 'resources'} found matching "{debouncedSearchTerm}"</p>
                            ) : (
                              <p>No {type || 'resources'} available</p>
                            )}
                          </div>
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {resourceOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.resource.resourceName || ''}
                              onSelect={() => {
                                field.onChange(parseInt(option.value, 10));
                                setSelectedResourceInfo({ id: parseInt(option.value, 10), name: option.label });
                                setOpen(false);
                              }}
                              className="cursor-pointer py-3"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  field.value?.toString() === option.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {getResourceIcon(option.type)}
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-medium truncate">{option.label}</span>
                                  {option.subtitle && (
                                    <span className="text-xs text-muted-foreground truncate">
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
