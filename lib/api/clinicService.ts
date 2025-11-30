import { BaseApiService } from './baseApiService';

export interface RetainedClinic {
  name: string;
  displayName: string;
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
  totalOrders: number;
  clientCount: number;
  description: string;
  logo?: {
    data: string;
    contentType: string;
    filename: string;
    uploadedAt: Date;
  } | null;
}

export interface FullClinicsApiResponse {
  clinics: FullClinicData[];
  total: number;
  retainedOnly: boolean;
}

/**
 * Simplified ClinicApiService - uses MongoDB as single source of truth
 * All clinic data comes from /clinics/frontend-compatible endpoint
 */
export class ClinicApiService extends BaseApiService {
  private static readonly ENDPOINT = '/clinics';
  private static readonly CACHE_TTL = 300000; // 5 minutes

  /**
   * Get full clinic data from backend (MongoDB)
   * This is the primary method for fetching clinic data
   * Returns complete clinic information for frontend use
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
      
      throw new Error('Failed to fetch clinic data');
    } catch (error) {
      throw this.handleError(error, 'getFullClinics');
    }
  }

  /**
   * Get clinic names only
   */
  static async getClinicNames(): Promise<string[]> {
    const cacheKey = 'clinic_names';
    const cached = this.getCached<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<{ names: string[]; total: number }>(`${this.ENDPOINT}/names`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data.names, this.CACHE_TTL);
        return response.data.names;
      }
      
      throw new Error('Failed to fetch clinic names');
    } catch (error) {
      throw this.handleError(error, 'getClinicNames');
    }
  }

  /**
   * Find clinic by name (case-insensitive)
   */
  static async findClinicByName(name: string): Promise<RetainedClinic | null> {
    try {
      const response = await this.request<{ clinic: RetainedClinic; backendName: string }>(`${this.ENDPOINT}/find/${encodeURIComponent(name)}`);
      
      if (response.success && response.data) {
        return response.data.clinic;
      }
      
      return null;
    } catch (error) {
      // Return null for not found
      return null;
    }
  }

  /**
   * Clear clinic cache
   */
  static clearCache(): void {
    this.clearCachedItem('full_clinics_data');
    this.clearCachedItem('clinic_names');
  }
}

// Cache for clinic data
let clinicCache: {
  clinics?: FullClinicData[];
  timestamp?: number;
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get full clinic data with caching
 * Primary function for fetching clinic data
 */
export const getCachedFullClinics = async (): Promise<FullClinicData[]> => {
  const now = Date.now();
  
  if (clinicCache.clinics && clinicCache.timestamp && (now - clinicCache.timestamp) < CACHE_DURATION) {
    return clinicCache.clinics;
  }

  try {
    const data = await ClinicApiService.getFullClinics();
    clinicCache = {
      clinics: data.clinics,
      timestamp: now
    };
    return data.clinics;
  } catch (error) {
    console.error('Failed to fetch clinics:', error);
    return clinicCache.clinics || [];
  }
};

/**
 * Find clinic by name from cached data
 */
export const findClinicFromCache = (name: string): FullClinicData | undefined => {
  if (!clinicCache.clinics) return undefined;
  
  const nameLower = name.toLowerCase();
  return clinicCache.clinics.find(c => 
    c.name.toLowerCase() === nameLower ||
    c.displayName.toLowerCase() === nameLower ||
    c.backendName?.toLowerCase() === nameLower
  );
};

/**
 * Get first available clinic
 */
export const getFirstAvailableClinic = async (): Promise<FullClinicData | null> => {
  try {
    const clinics = await getCachedFullClinics();
    return clinics.length > 0 ? clinics[0] : null;
  } catch {
    return null;
  }
};
