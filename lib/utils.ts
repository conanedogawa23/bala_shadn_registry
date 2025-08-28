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
 * Format a date string (YYYY-MM-DD) to a more readable format
 * Returns "Invalid Date" for null, undefined, or invalid date strings
 */
export function formatDate(dateString: string | null | undefined): string {
  // Handle null, undefined, or empty strings
  if (!dateString || dateString.trim() === '') {
    return 'Invalid Date';
  }
  
  const date = new Date(dateString);
  
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
 * Safely format a date with a fallback value
 */
export function safeFormatDate(dateString: string | null | undefined, fallback: string = 'N/A'): string {
  return isValidDate(dateString) ? formatDate(dateString) : fallback;
}
