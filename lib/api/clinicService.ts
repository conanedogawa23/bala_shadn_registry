// Backend API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ff5c706e5a2e.ngrok.app/api/v1';

export interface RetainedClinic {
  name: string;
  slug: string;
  isActive: boolean;
}

export interface FullClinicData {
  id: number;
  name: string;
  displayName: string;
  backendName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone?: string;
  fax?: string;
  status: 'active' | 'inactive' | 'historical' | 'no-data';
  lastActivity?: string;
  totalAppointments: number;
  clientCount: number;
  description: string;
}

export interface ClinicMapping {
  [frontendSlug: string]: string; // Maps frontend slug to backend clinic name
}

export interface ClinicApiResponse {
  clinics: RetainedClinic[];
  mapping: ClinicMapping;
  total: number;
}

export interface FullClinicsApiResponse {
  clinics: FullClinicData[];
  total: number;
  retainedOnly: boolean;
}

export interface ClinicValidationResponse {
  clinic: RetainedClinic;
  backendName: string;
}

import { BaseApiService } from './baseApiService';

export class ClinicApiService extends BaseApiService {
  private static readonly ENDPOINT = '/clinics';
  private static readonly CACHE_TTL = 300000; // 5 minutes

  /**
   * Get full clinic data from backend (MongoDB)
   * Returns complete clinic information for frontend dropdown
   */
  static async getFullClinics(): Promise<FullClinicsApiResponse> {
    const cacheKey = 'full_clinics_data';
    const cached = this.getCached<FullClinicsApiResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<FullClinicsApiResponse>(`${this.ENDPOINT}/frontend-compatible`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch full clinic data');
    } catch (error) {
      throw this.handleError(error, 'getFullClinics');
    }
  }

  /**
   * Get all available clinics from backend
   * Data-driven approach using backend as source of truth
   */
  static async getAvailableClinics(): Promise<ClinicApiResponse> {
    const cacheKey = 'available_clinics';
    const cached = this.getCached<ClinicApiResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<ClinicApiResponse>(`${this.ENDPOINT}/available`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch available clinics');
    } catch (error) {
      throw this.handleError(error, 'getAvailableClinics');
    }
  }

  /**
   * Get clinic mapping from backend
   * Returns slug to clinic name mapping
   */
  static async getClinicMapping(): Promise<ClinicMapping> {
    const cacheKey = 'clinic_mapping';
    const cached = this.getCached<ClinicMapping>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<{ mapping: ClinicMapping }>(`${this.ENDPOINT}/mapping`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data.mapping, this.CACHE_TTL);
        return response.data.mapping;
      }
      
      throw new Error('Failed to fetch clinic mapping');
    } catch (error) {
      throw this.handleError(error, 'getClinicMapping');
    }
  }

  /**
   * Validate clinic slug with backend
   * Returns clinic info if valid, throws error if not
   */
  static async validateClinicSlug(slug: string): Promise<ClinicValidationResponse> {
    const cacheKey = `validate_slug_${slug}`;
    const cached = this.getCached<ClinicValidationResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<ClinicValidationResponse>(`${this.ENDPOINT}/validate/${encodeURIComponent(slug)}`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error(`Invalid clinic slug: ${slug}`);
    } catch (error) {
      throw this.handleError(error, 'validateClinicSlug');
    }
  }

  /**
   * Convert slug to clinic name using backend
   * Returns proper backend clinic name for API calls
   */
  static async slugToClinicName(slug: string): Promise<string> {
    const cacheKey = `slug_to_name_${slug}`;
    const cached = this.getCached<string>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<{ clinicName: string }>(`${this.ENDPOINT}/slug-to-name/${encodeURIComponent(slug)}`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data.clinicName, this.CACHE_TTL);
        return response.data.clinicName;
      }
      
      throw new Error(`Failed to convert slug: ${slug}`);
    } catch (error) {
      throw this.handleError(error, 'slugToClinicName');
    }
  }
}

// Cache for clinic data to reduce API calls
let clinicCache: {
  clinics?: RetainedClinic[];
  mapping?: ClinicMapping;
  timestamp?: number;
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get available clinics with caching
 * Optimizes performance by reducing redundant API calls
 */
export const getCachedAvailableClinics = async (): Promise<RetainedClinic[]> => {
  const now = Date.now();
  
  if (clinicCache.clinics && clinicCache.timestamp && (now - clinicCache.timestamp) < CACHE_DURATION) {
    return clinicCache.clinics;
  }

  try {
    const data = await ClinicApiService.getAvailableClinics();
    clinicCache = {
      clinics: data.clinics,
      mapping: data.mapping,
      timestamp: now
    };
    return data.clinics;
  } catch (error) {
    console.error('Failed to fetch available clinics:', error);
    // Return cached data if available, even if stale
    return clinicCache.clinics || [];
  }
};

/**
 * Get clinic mapping with caching
 * Reuses cached data to improve performance
 */
export const getCachedClinicMapping = async (): Promise<ClinicMapping> => {
  const now = Date.now();
  
  if (clinicCache.mapping && clinicCache.timestamp && (now - clinicCache.timestamp) < CACHE_DURATION) {
    return clinicCache.mapping;
  }

  try {
    const mapping = await ClinicApiService.getClinicMapping();
    clinicCache = {
      ...clinicCache,
      mapping,
      timestamp: now
    };
    return mapping;
  } catch (error) {
    console.error('Failed to fetch clinic mapping:', error);
    // Return cached data if available, even if stale
    return clinicCache.mapping || {};
  }
};

/**
 * Utility function to check if slug is valid
 * Non-throwing validation for conditional logic
 */
export const isValidClinicSlug = async (slug: string): Promise<boolean> => {
  try {
    await ClinicApiService.validateClinicSlug(slug);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get first available clinic slug
 * Fallback for invalid clinic routing
 */
export const getFirstAvailableClinicSlug = async (): Promise<string | null> => {
  try {
    const clinics = await getCachedAvailableClinics();
    return clinics.length > 0 ? clinics[0].slug : null;
  } catch {
    return null;
  }
};
