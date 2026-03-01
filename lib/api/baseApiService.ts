import { logger } from '../utils/logger';

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
  private static inFlightGetRequests = new Map<string, Promise<ApiResponse<unknown>>>();
  private static refreshTokenPromise: Promise<string | null> | null = null;

  private static setServerReadableCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  private static async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    if (BaseApiService.refreshTokenPromise) {
      return BaseApiService.refreshTokenPromise;
    }

    BaseApiService.refreshTokenPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          return null;
        }

        const refreshEndpoint = `${this.API_BASE_URL}/auth/refresh`;
        const response = await fetch(refreshEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          cache: 'no-store',
          credentials: 'include',
          body: JSON.stringify({ refreshToken }),
        });

        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !result?.data?.accessToken) {
          logger.warn('[Auth] Token refresh failed', { status: response.status, result });
          localStorage.removeItem('authToken');
          return null;
        }

        const newAccessToken = result.data.accessToken as string;
        localStorage.setItem('authToken', newAccessToken);

        const newRefreshToken = result.data.refreshToken as string | undefined;
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
          this.setServerReadableCookie('refreshToken', newRefreshToken, 7);
        }

        const expiresInSeconds = typeof result.data.expiresIn === 'number'
          ? result.data.expiresIn
          : 3600;
        this.setServerReadableCookie('accessToken', newAccessToken, expiresInSeconds / 86400);

        logger.debug('[Auth] Access token refreshed successfully');
        return newAccessToken;
      } catch (error) {
        logger.error('[Auth] Refresh token request failed:', error);
        return null;
      } finally {
        BaseApiService.refreshTokenPromise = null;
      }
    })();

    return BaseApiService.refreshTokenPromise;
  }
  
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
    
    const requestUrl = `${this.API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        // Disable browser caching to avoid 304 responses without body
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...fetchOptions.headers,
      },
      // Force fetch to bypass cache
      cache: 'no-store',
      ...fetchOptions,
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      config.body = JSON.stringify(data);
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    const isGetRequest = method === 'GET';
    const inFlightKey = isGetRequest ? `${requestUrl}|${authToken || 'anon'}` : null;

    if (inFlightKey) {
      const existingRequest = BaseApiService.inFlightGetRequests.get(inFlightKey);
      if (existingRequest) {
        return existingRequest as Promise<ApiResponse<T>>;
      }
    }

    const executeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        logger.api.request(method, requestUrl, data);

        const executeFetch = async (tokenOverride?: string): Promise<{ response: Response; result: any }> => {
          const requestHeaders = {
            ...(config.headers as Record<string, string>),
            ...(tokenOverride ? { 'Authorization': `Bearer ${tokenOverride}` } : {}),
          };

          const response = await fetch(requestUrl, { ...config, headers: requestHeaders });
          logger.api.response(response.status, endpoint);

          let result;
          try {
            result = await response.json();
          } catch (parseError) {
            logger.error(`[API] Failed to parse response:`, {
              status: response.status,
              statusText: response.statusText,
              contentType: response.headers.get('content-type'),
              error: parseError
            });
            throw new Error(`Failed to parse response as JSON: ${response.statusText}`);
          }

          logger.debug(`[API] Response ${response.status}:`, result);
          return { response, result };
        };

        let { response, result } = await executeFetch();

        const authErrorCode = result?.error?.code;
        const shouldAttemptRefresh =
          response.status === 401 &&
          endpoint !== '/auth/refresh' &&
          typeof window !== 'undefined' &&
          ['TOKEN_EXPIRED', 'INVALID_TOKEN', 'MISSING_ACCESS_TOKEN'].includes(authErrorCode);

        if (shouldAttemptRefresh) {
          const refreshedToken = await this.refreshAccessToken();
          if (refreshedToken) {
            logger.warn(`[API] Retrying ${method} ${endpoint} after token refresh`);
            ({ response, result } = await executeFetch(refreshedToken));
          }
        }

        if (!response.ok) {
          const errorMessage = result.error?.message || result.message || `HTTP ${response.status}: ${response.statusText}`;
          const errorDetails = result.error?.details || result.details;
          logger.api.error(response.status, endpoint, { errorMessage, errorDetails, result });
          throw new Error(errorMessage);
        }

        if (!result.success) {
          const errorMessage = result.error?.message || result.message || 'API request failed';
          const errorDetails = result.error?.details || result.details;
          logger.error('[API] Request failed:', { errorMessage, errorDetails, result });
          throw new Error(errorMessage);
        }

        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          logger.error(`[API] Request timeout after ${timeout}ms for ${method} ${endpoint}`);
          throw new Error(`Request timeout after ${timeout}ms`);
        }

        logger.error(`[API] Request failed for ${method} ${endpoint}:`, error);
        throw error;
      }
    };

    const requestPromise = executeRequest();
    if (inFlightKey) {
      BaseApiService.inFlightGetRequests.set(inFlightKey, requestPromise as Promise<ApiResponse<unknown>>);
    }

    try {
      return await requestPromise;
    } finally {
      if (inFlightKey) {
        BaseApiService.inFlightGetRequests.delete(inFlightKey);
      }
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

  public static async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }

  public static async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, options);
  }

  public static async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, options);
  }

  public static async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }

  /**
   * Public method to clear all cached data - called during logout
   */
  public static clearAllCache(): void {
    this.cache.clear();
    logger.info('[API] All cache cleared');
  }
}

class ApiService extends BaseApiService {}
export const baseApiService = ApiService;
