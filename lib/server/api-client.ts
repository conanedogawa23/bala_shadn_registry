/**
 * Server-side API Client for Next.js Server Components
 * 
 * This utility handles all server-to-backend communication:
 * - Direct fetch to Express backend from Next.js server
 * - No CORS issues (server-to-server)
 * - Proper error handling and response transformation
 * - Type-safe API responses
 */

import { cookies } from 'next/headers';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  revalidate?: number | false;
  tags?: string[];
}

export class ServerApiClient {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  
  /**
   * Get the backend API base URL
   * This should be the direct URL to the Express backend (not the Next.js proxy)
   */
  private static getBackendUrl(): string {
    // For server-side, use the backend API URL from environment
    // Default to localhost if not set
    return process.env.BACKEND_API_URL || 'http://localhost:5001/api/v1';
  }
  
  /**
   * Generic request handler for server-side API calls
   * Supports Next.js caching and revalidation options
   */
  static async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { 
      timeout = this.DEFAULT_TIMEOUT,
      revalidate,
      tags,
      ...fetchOptions 
    } = options;
    
    const backendUrl = this.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    // Read accessToken from HttpOnly cookie (server-side only)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    
    // Build fetch configuration
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    };
    
    // Add Next.js cache options
    if (revalidate !== undefined) {
      config.next = { 
        revalidate,
        ...(tags && { tags })
      };
    }
    
    // Add request body for POST/PUT
    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }
    
    // Set up abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;
    
    try {
      console.log(`[Server API] ${method} ${url}`, data ? { body: data } : '');
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      // Parse response
      let result: ApiResponse<T>;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error(`Failed to parse response as JSON: ${response.statusText}`);
      }
      
      console.log(`[Server API] Response ${response.status}:`, result);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorMessage = result.error?.message || result.message || `HTTP ${response.status}: ${response.statusText}`;
        const errorDetails = result.error?.details || result.details;
        console.error(`[Server API] Error ${response.status}:`, { errorMessage, errorDetails });
        throw new Error(errorMessage);
      }
      
      // Handle API-level errors
      if (!result.success) {
        const errorMessage = result.error?.message || result.message || 'API request failed';
        console.error('[Server API] Request failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[Server API] Request timeout after ${timeout}ms for ${method} ${endpoint}`);
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      console.error(`[Server API] Request failed for ${method} ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * GET request helper
   */
  static async get<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }
  
  /**
   * POST request helper
   */
  static async post<T>(
    endpoint: string,
    data: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, options);
  }
  
  /**
   * PUT request helper
   */
  static async put<T>(
    endpoint: string,
    data: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, options);
  }
  
  /**
   * DELETE request helper
   */
  static async delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }
  
  /**
   * Build query string from params object
   */
  static buildQuery(params: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }
    
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(String(value));
        return `${encodedKey}=${encodedValue}`;
      })
      .join('&');
  }
}

