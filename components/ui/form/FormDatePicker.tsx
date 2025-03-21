"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { forwardRef } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface FormDatePickerProps {
  name: string;
  label?: string;
  description?: string;
  className?: string;
  dateFormat?: string;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

/**
 * FormDatePicker component for use with react-hook-form
 * 
 * This component provides a date picker with form context and validation
 */
export const FormDatePicker = forwardRef<HTMLButtonElement, FormDatePickerProps>(
  function FormDatePicker({
    name,
    label,
    description,
    className,
    dateFormat = "PPP",
    disablePastDates,
    disableFutureDates,
    minDate = new Date("1900-01-01"),
    maxDate = new Date("2100-01-01"),
    disabled,
  }, ref) {
    const { control } = useFormContext();

    const getDisabledDays = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (disablePastDates && date < today) {
        return true;
      }
      
      if (disableFutureDates && date > today) {
        return true;
      }
      
      if (date < minDate || date > maxDate) {
        return true;
      }
      
      return false;
    };

    return (
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem className={cn("flex flex-col", className)}>
            {label && <FormLabel>{label}</FormLabel>}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    ref={ref}
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                      fieldState.error && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={disabled}
                  >
                    {field.value ? (
                      format(field.value, dateFormat)
                    ) : (
                      <span>Select date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={getDisabledDays}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

FormDatePicker.displayName = "FormDatePicker";