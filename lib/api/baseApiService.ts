interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
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
}

export abstract class BaseApiService {
  protected static getApiBaseUrl(): string {
    // Always use environment variable
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    }
    // Server-side or build time
    return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  }
  protected static get API_BASE_URL(): string {
    return this.getApiBaseUrl();
  }
  protected static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  
  /**
   * Optimized request handler with comprehensive error management
   * Follows established patterns from clinicService.ts
   */
  protected static async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = this.DEFAULT_TIMEOUT, ...fetchOptions } = options;
    
    // Get auth token if available (for future authentication integration)
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;
    
    try {
      console.log(`[API] ${method} ${this.API_BASE_URL}${endpoint}`, data ? { body: data } : '');
      
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, config);
      clearTimeout(timeoutId);
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error(`Failed to parse response as JSON: ${response.statusText}, ${parseError}`);
      }
      
      console.log(`[API] Response ${response.status}:`, result);
      
      if (!response.ok) {
        const errorMessage = result.error?.message || result.message || `HTTP ${response.status}: ${response.statusText}`;
        const errorDetails = result.error?.details || result.details;
        console.error(`[API] Error ${response.status}:`, { errorMessage, errorDetails, result });
        throw new Error(errorMessage);
      }
      
      if (!result.success) {
        const errorMessage = result.error?.message || result.message || 'API request failed';
        const errorDetails = result.error?.details || result.details;
        console.error('[API] Request failed:', { errorMessage, errorDetails, result });
        throw new Error(errorMessage);
      }
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[API] Request timeout after ${timeout}ms for ${method} ${endpoint}`);
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      console.error(`[API] Request failed for ${method} ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Optimized query parameter builder without forEach
   * Handles undefined/null values and proper encoding
   */
  protected static buildQuery(params: Record<string, unknown>): string {
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
  
  /**
   * Standardized error handler for consistent error reporting
   */
  protected static handleError(error: unknown, context?: string): Error {
    const prefix = context ? `[${context}] ` : '';
    
    if (error instanceof Error) {
      return new Error(`${prefix}${error.message}`);
    }
    
    return new Error(`${prefix}Unknown error occurred: ${String(error)}`);
  }
  
  /**
   * Cache management utilities
   */
  private static cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  
  protected static getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  protected static setCached<T>(key: string, data: T, ttlMs: number = 300000): void { // 5min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  protected static clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }
}
