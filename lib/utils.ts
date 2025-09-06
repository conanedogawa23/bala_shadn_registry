import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Check if a date string is valid
 */
export function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString || dateString.trim() === '') return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Format a date to a more readable format
 * Accepts both Date objects and date strings
 * Returns "Invalid Date" for null, undefined, or invalid dates
 */
export function formatDate(input: string | Date | null | undefined): string {
  if (!input) {
    return 'Invalid Date';
  }
  
  let date: Date;
  
  if (input instanceof Date) {
    date = input;
  } else {
    if (typeof input === 'string' && input.trim() === '') {
      return 'Invalid Date';
    }
    date = new Date(input);
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Format a time to a readable format (HH:MM AM/PM)
 * Accepts both Date objects and date strings
 * Returns "Invalid Time" for null, undefined, or invalid dates
 */
export function formatTime(input: string | Date | null | undefined): string {
  if (!input) {
    return 'Invalid Time';
  }
  
  let date: Date;
  
  if (input instanceof Date) {
    date = input;
  } else {
    if (typeof input === 'string' && input.trim() === '') {
      return 'Invalid Time';
    }
    date = new Date(input);
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Time';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Format both date and time in a single string
 * Accepts both Date objects and date strings
 */
export function formatDateTime(input: string | Date | null | undefined): string {
  if (!input) {
    return 'Invalid DateTime';
  }
  
  let date: Date;
  
  if (input instanceof Date) {
    date = input;
  } else {
    if (typeof input === 'string' && input.trim() === '') {
      return 'Invalid DateTime';
    }
    date = new Date(input);
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid DateTime';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Safely format a date with a fallback value
 */
export function safeFormatDate(input: string | Date | null | undefined, fallback: string = 'N/A'): string {
  const dateString = input instanceof Date ? input.toISOString() : input;
  return isValidDate(dateString) ? formatDate(input) : fallback;
}
