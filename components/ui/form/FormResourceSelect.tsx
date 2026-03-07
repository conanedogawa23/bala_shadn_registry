'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { AlertCircle, Loader2, Check, ChevronsUpDown, User, Wrench, Building } from 'lucide-react';
import { ResourceApiService } from '@/lib/api/resourceService';
import { baseApiService } from '@/lib/api/baseApiService';
import { cn } from '@/lib/utils';

const DOCTOR_ID_OFFSET = 100000;

interface Resource {
  id: string;
  resourceId: number;
  resourceName: string;
  type: 'practitioner' | 'service' | 'equipment' | 'room';
  availability?: {
    monday?: { start: string; end: string; available: boolean };
    tuesday?: { start: string; end: string; available: boolean };
    wednesday?: { start: string; end: string; available: boolean };
    thursday?: { start: string; end: string; available: boolean };
    friday?: { start: string; end: string; available: boolean };
    saturday?: { start: string; end: string; available: boolean };
    sunday?: { start: string; end: string; available: boolean };
  };
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
  _source?: 'resource' | 'doctor';
}

interface ReferringDoctorRecord {
  _id: string;
  doctorId?: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  specialty?: string;
  clinicName?: string;
  isActive?: boolean;
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
  defaultResourceName?: string;
  includeDoctors?: boolean;
  onResourceChange?: (resource: Resource | null) => void;
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
  defaultResourceName,
  includeDoctors = true,
  onResourceChange
}: FormResourceSelectProps) {
  const { control, getValues, watch } = useFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResourceInfo, setSelectedResourceInfo] = useState<{ id: number; name: string } | null>(null);
  const selectedValue = watch(name);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchResources = useCallback(async () => {
    if (!clinicName) {
      setResources([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [resourceResponse, doctorResponse] = await Promise.all([
        ResourceApiService.getAllResources({
          clinicName,
          type,
          isActive: true,
          isBookable: true,
          limit: 100
        }),
        includeDoctors && (!type || type === 'practitioner')
          ? baseApiService.get<ReferringDoctorRecord[]>('/referring-doctors?limit=100').catch(() => null)
          : Promise.resolve(null)
      ]);

      let allResources: Resource[] = (resourceResponse.resources || []).map(r => ({
        ...r,
        _source: 'resource' as const
      }));

      if (doctorResponse?.data) {
        const doctors: Resource[] = doctorResponse.data
          .filter((doc) => doc.isActive !== false)
          .map((doc) => ({
            id: doc._id,
            resourceId: (doc.doctorId || 0) + DOCTOR_ID_OFFSET,
            resourceName: `Dr. ${doc.fullName || `${doc.firstName || ''} ${doc.lastName || ''}`.trim()}`,
            type: 'practitioner' as const,
            practitioner: {
              firstName: doc.firstName,
              lastName: doc.lastName,
              credentials: 'MD',
              specialties: doc.specialty ? [doc.specialty] : []
            },
            clinics: doc.clinicName ? [doc.clinicName] : [],
            isActive: true,
            isBookable: true,
            _source: 'doctor' as const
          }));
        allResources = [...allResources, ...doctors];
      }

      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        allResources = allResources.filter(resource => {
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

      if (!debouncedSearchTerm) {
        allResources = allResources.slice(0, 30);
      }

      setResources(allResources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [clinicName, type, includeDoctors, debouncedSearchTerm]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    if (!onResourceChange) {
      return;
    }

    if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
      onResourceChange(null);
      return;
    }

    const selectedNumericValue = Number(selectedValue);
    const matchedResource = Number.isNaN(selectedNumericValue)
      ? resources.find(
          (resource) => String(resource.resourceId || resource.id) === String(selectedValue)
        )
      : resources.find(
          (resource) => Number(resource.resourceId || resource.id) === selectedNumericValue
        );

    onResourceChange(matchedResource || null);
  }, [name, onResourceChange, resources, selectedValue]);

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
        const parts: string[] = [];
        if (specialties?.length) parts.push(specialties.join(', '));
        if (resource._source === 'doctor') parts.push('Referring Doctor');
        subtitle = parts.join(' - ');
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
  }, [resources]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Find selected resource for display - check resourceOptions first, then fallback to selectedResourceInfo
        const selectedResource = resourceOptions.find(option => option.value === field.value?.toString());
        
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
                              <p>No {type || 'resources'} found matching &quot;{debouncedSearchTerm}&quot;</p>
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
                                const selectedValue = parseInt(option.value, 10);
                                field.onChange(selectedValue);
                                setSelectedResourceInfo({ id: selectedValue, name: option.label });
                                onResourceChange?.(option.resource);
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
