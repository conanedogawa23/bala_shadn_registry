/**
 * Frontend Logger Utility
 * Conditionally logs based on environment to avoid performance issues in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },

  /**
   * API-specific logging with structured format
   */
  api: {
    request: (method: string, url: string, data?: any) => {
      if (isDevelopment) {
        console.log(`[API] ${method} ${url}`, data ? { body: data } : '');
      }
    },

    response: (status: number, url: string, data?: any) => {
      if (isDevelopment) {
        console.log(`[API] Response ${status} for ${url}`, data || '');
      }
    },

    error: (status: number, url: string, error: any) => {
      console.error(`[API] Error ${status} for ${url}:`, error);
    }
  }
};

