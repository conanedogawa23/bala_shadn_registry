'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { AlertCircle, Check, ChevronsUpDown, Loader2, Stethoscope, X } from 'lucide-react';
import { ReferringDoctor, ReferringDoctorApiService } from '@/lib/api/referringDoctorService';
import { cn } from '@/lib/utils';

interface FormReferringDoctorSelectProps {
  clinicName: string;
  className?: string;
  defaultDoctorName?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}

export function FormReferringDoctorSelect({
  clinicName,
  className,
  defaultDoctorName,
  description,
  disabled = false,
  label,
  name,
  placeholder = 'Select a referring doctor...',
  required = false
}: FormReferringDoctorSelectProps) {
  const { control, getValues } = useFormContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<ReferringDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    const fetchDoctors = async () => {
      if (!clinicName) {
        setDoctors([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await ReferringDoctorApiService.getAll({
          clinicName,
          isActive: true,
          limit: debouncedSearchTerm ? 50 : 20,
          search: debouncedSearchTerm || undefined
        });

        if (!cancelled) {
          setDoctors(response.doctors);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setDoctors([]);
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load referring doctors');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      cancelled = true;
    };
  }, [clinicName, debouncedSearchTerm]);

  useEffect(() => {
    if (defaultDoctorName && !selectedDoctorInfo) {
      const currentValue = getValues(name);
      if (currentValue) {
        setSelectedDoctorInfo({
          id: String(currentValue),
          name: defaultDoctorName
        });
      }
    }
  }, [defaultDoctorName, getValues, name, selectedDoctorInfo]);

  const doctorOptions = useMemo(() => {
    return doctors.map((doctor) => ({
      value: doctor._id,
      label: doctor.fullName ? `Dr. ${doctor.fullName}` : `Dr. ${doctor.firstName} ${doctor.lastName}`.trim(),
      subtitle: doctor.specialty || doctor.email || doctor.phone || '',
      searchText: [
        doctor.firstName,
        doctor.lastName,
        doctor.fullName,
        doctor.specialty,
        doctor.email,
        doctor.phone
      ].filter(Boolean).join(' ').toLowerCase()
    }));
  }, [doctors]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedDoctor = doctorOptions.find((option) => option.value === field.value);
        const displayLabel = selectedDoctor
          ? selectedDoctor.label
          : (selectedDoctorInfo && field.value === selectedDoctorInfo.id)
            ? selectedDoctorInfo.name
            : null;

        return (
          <FormItem className={cn('w-full', className)}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}

            {error ? (
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
                        'w-full justify-between font-normal',
                        !field.value && 'text-muted-foreground',
                        fieldState.error && 'border-destructive focus:ring-destructive'
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {displayLabel && <Stethoscope className="h-4 w-4" />}
                        <span className="truncate">{displayLabel || placeholder}</span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Type to search referring doctors..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />

                    <CommandList className="max-h-[300px]">
                      {loading || (searchTerm !== debouncedSearchTerm) ? (
                        <CommandEmpty>
                          <div className="flex items-center justify-center gap-2 py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              {searchTerm ? 'Searching referring doctors...' : 'Loading referring doctors...'}
                            </span>
                          </div>
                        </CommandEmpty>
                      ) : doctorOptions.length === 0 ? (
                        <CommandEmpty>
                          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                            <AlertCircle className="h-8 w-8 opacity-50" />
                            {debouncedSearchTerm ? (
                              <p>No referring doctors found matching &quot;{debouncedSearchTerm}&quot;</p>
                            ) : (
                              <p>No referring doctors available</p>
                            )}
                          </div>
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {!required && (
                            <CommandItem
                              key="clear-selection"
                              value="clear selection no referring doctor"
                              onSelect={() => {
                                field.onChange(undefined);
                                setSelectedDoctorInfo(null);
                                setOpen(false);
                              }}
                              className="cursor-pointer py-3 text-muted-foreground"
                            >
                              <X className="mr-2 h-4 w-4 shrink-0" />
                              <span>Clear selection</span>
                            </CommandItem>
                          )}
                          {doctorOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.searchText}
                              onSelect={() => {
                                field.onChange(option.value);
                                setSelectedDoctorInfo({ id: option.value, name: option.label });
                                setOpen(false);
                              }}
                              className="cursor-pointer py-3"
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4 shrink-0',
                                  field.value === option.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate font-medium">{option.label}</span>
                                {option.subtitle && (
                                  <span className="truncate text-xs text-muted-foreground">{option.subtitle}</span>
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
