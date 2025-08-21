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
}

export abstract class BaseApiService {
  protected static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, config);
      clearTimeout(timeoutId);
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || result.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (!result.success) {
        throw new Error(result.error?.message || result.message || 'API request failed');
      }
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
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
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  protected static getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
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
    keysToDelete.map(key => this.cache.delete(key));
  }
}
