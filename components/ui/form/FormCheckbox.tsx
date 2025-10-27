"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * FormCheckbox Component
 * 
 * A form checkbox field integrated with react-hook-form
 * Provides automatic error handling and form state management
 */
export function FormCheckbox({
  name,
  label,
  description,
  disabled = false,
  className,
}: FormCheckboxProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4", className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && <FormLabel>{label}</FormLabel>}
            {description && (
              <FormDescription>
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

