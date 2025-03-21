"use client";

import { forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  options: SelectOption[];
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

/**
 * FormSelect component for use with react-hook-form
 * 
 * This component wraps the Select component with form context and validation
 */
export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  function FormSelect(
    { options, name, label, description, placeholder, className, onValueChange, ...props }, 
    ref
  ) {
    const { control } = useFormContext();

    return (
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem className={cn("w-full", className)}>
            {label && <FormLabel>{label}</FormLabel>}
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                if (onValueChange) {
                  onValueChange(value);
                }
              }}
              defaultValue={field.value}
              value={field.value}
              disabled={props.disabled}
            >
              <FormControl>
                <SelectTrigger
                  ref={ref}
                  className={cn(
                    fieldState.error && "border-destructive focus:ring-destructive"
                  )}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

FormSelect.displayName = "FormSelect";