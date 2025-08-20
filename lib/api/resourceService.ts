import { BaseApiService } from './baseApiService';

interface Resource {
  id: string;
  resourceId: number;
  resourceName: string;
  type: 'practitioner' | 'service' | 'equipment' | 'room';
  color?: string;
  image?: string;
  practitioner?: {
    firstName?: string;
    lastName?: string;
    credentials?: string;
    licenseNumber?: string;
    specialties: string[];
    email?: string;
    phone?: string;
  };
  service?: {
    category: string;
    duration: number;
    price?: number;
    description?: string;
    requiresEquipment?: string[];
  };
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  clinics: string[];
  defaultClinic?: string;
  isActive: boolean;
  isBookable: boolean;
  requiresApproval: boolean;
  stats: {
    totalAppointments: number;
    averageDuration: number;
    rating?: number;
    lastActivity?: string;
  };
  dateCreated: string;
  dateModified: string;
}

interface ResourceQueryOptions {
  page?: number;
  limit?: number;
  type?: 'practitioner' | 'service' | 'equipment' | 'room';
  clinicName?: string;
  specialty?: string;
  isActive?: boolean;
  isBookable?: boolean;
}

interface CreateResourceRequest {
  resourceName: string;
  type: 'practitioner' | 'service' | 'equipment' | 'room';
  color?: string;
  image?: string;
  practitioner?: {
    firstName?: string;
    lastName?: string;
    credentials?: string;
    licenseNumber?: string;
    specialties: string[];
    email?: string;
    phone?: string;
  };
  service?: {
    category: string;
    duration: number;
    price?: number;
    description?: string;
    requiresEquipment?: string[];
  };
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  clinics: string[];
  defaultClinic?: string;
  isActive?: boolean;
  isBookable?: boolean;
  requiresApproval?: boolean;
}

interface UpdateResourceRequest extends Partial<CreateResourceRequest> {}

interface PaginatedResourceResponse {
  resources: Resource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface PractitionerResponse {
  practitioners: Array<{
    id: string;
    resourceId: number;
    name: string;
    firstName?: string;
    lastName?: string;
    credentials?: string;
    specialties: string[];
    clinics: string[];
    isActive: boolean;
    isBookable: boolean;
    stats: {
      totalAppointments: number;
      averageDuration: number;
      rating?: number;
      lastActivity?: string;
    };
    availability: Resource['availability'];
  }>;
  summary: {
    total: number;
    active: number;
    available: number;
    specialtyBreakdown: Record<string, number>;
  };
}

interface ServiceResponse {
  services: Array<{
    id: string;
    resourceId: number;
    name: string;
    category: string;
    duration: number;
    price?: number;
    description?: string;
    isActive: boolean;
    requiresEquipment?: string[];
    clinics: string[];
  }>;
  categories: Array<{
    category: string;
    count: number;
    averagePrice?: number;
    averageDuration: number;
  }>;
}

interface ResourceAvailabilityResponse {
  resource: Resource;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  availability: Array<{
    date: string;
    dayOfWeek: string;
    available: boolean;
    schedule: {
      start: string;
      end: string;
    };
    appointments: Array<{
      id: string;
      startTime: string;
      endTime: string;
      clientName: string;
      subject: string;
    }>;
    availableSlots: Array<{
      start: string;
      end: string;
      duration: number;
    }>;
  }>;
}

interface ResourceStatsResponse {
  resourceId: number;
  resourceName: string;
  type: string;
  period: {
    startDate: string;
    endDate: string;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    utilization: number; // percentage
  };
  schedule: {
    totalHours: number;
    bookedHours: number;
    availableHours: number;
    utilizationRate: number;
  };
  performance: {
    averageDuration: number;
    completionRate: number;
    cancellationRate: number;
    revenue?: number;
    averageRating?: number;
  };
  trends: {
    weeklyBookings: Array<{ week: string; count: number }>;
    peakHours: Array<{ hour: number; count: number }>;
    busyDays: Array<{ day: string; count: number }>;
  };
}

export class ResourceApiService extends BaseApiService {
  private static readonly ENDPOINT = '/resources';
  private static readonly CACHE_TTL = 300000; // 5 minutes

  /**
   * Get all resources with filtering and pagination
   */
  static async getAllResources(
    options: ResourceQueryOptions = {}
  ): Promise<PaginatedResourceResponse> {
    const cacheKey = `resources_all_${JSON.stringify(options)}`;
    const cached = this.getCached<PaginatedResourceResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        page: options.page || 1,
        limit: options.limit || 20,
        type: options.type,
        clinicName: options.clinicName,
        specialty: options.specialty,
        isActive: options.isActive,
        isBookable: options.isBookable
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}${queryString}`;
      
      const response = await this.request<PaginatedResourceResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw this.handleError(error, 'getAllResources');
    }
  }

  /**
   * Get resource by ID
   */
  static async getResourceById(resourceId: number): Promise<Resource> {
    const cacheKey = `resource_${resourceId}`;
    const cached = this.getCached<Resource>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/${resourceId}`;
      const response = await this.request<Resource>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Resource not found');
    } catch (error) {
      throw this.handleError(error, 'getResourceById');
    }
  }

  /**
   * Create new resource
   */
  static async createResource(resourceData: CreateResourceRequest): Promise<Resource> {
    try {
      const response = await this.request<Resource>(
        this.ENDPOINT,
        'POST',
        resourceData
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('resources_');
        this.clearCache('practitioners_');
        this.clearCache('services_');
        return response.data;
      }
      
      throw new Error('Failed to create resource');
    } catch (error) {
      throw this.handleError(error, 'createResource');
    }
  }

  /**
   * Update existing resource
   */
  static async updateResource(resourceId: number, updates: UpdateResourceRequest): Promise<Resource> {
    try {
      const response = await this.request<Resource>(
        `${this.ENDPOINT}/${resourceId}`,
        'PUT',
        updates
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('resources_');
        this.clearCache(`resource_${resourceId}`);
        this.clearCache('practitioners_');
        this.clearCache('services_');
        return response.data;
      }
      
      throw new Error('Failed to update resource');
    } catch (error) {
      throw this.handleError(error, 'updateResource');
    }
  }

  /**
   * Soft delete resource
   */
  static async deleteResource(resourceId: number): Promise<void> {
    try {
      const response = await this.request(
        `${this.ENDPOINT}/${resourceId}`,
        'DELETE'
      );
      
      if (response.success) {
        // Clear related cache entries
        this.clearCache('resources_');
        this.clearCache(`resource_${resourceId}`);
        this.clearCache('practitioners_');
        this.clearCache('services_');
        return;
      }
      
      throw new Error('Failed to delete resource');
    } catch (error) {
      throw this.handleError(error, 'deleteResource');
    }
  }

  /**
   * Get practitioners with appointment statistics
   */
  static async getPractitioners(clinicName?: string, specialty?: string): Promise<PractitionerResponse> {
    const cacheKey = `practitioners_${clinicName || 'all'}_${specialty || 'all'}`;
    const cached = this.getCached<PractitionerResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        clinicName,
        specialty
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/practitioners/list${queryString}`;
      
      const response = await this.request<PractitionerResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch practitioners');
    } catch (error) {
      throw this.handleError(error, 'getPractitioners');
    }
  }

  /**
   * Get services grouped by category
   */
  static async getServices(category?: string): Promise<ServiceResponse> {
    const cacheKey = `services_${category || 'all'}`;
    const cached = this.getCached<ServiceResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = category ? this.buildQuery({ category }) : '';
      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/services/list${queryString}`;
      
      const response = await this.request<ServiceResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch services');
    } catch (error) {
      throw this.handleError(error, 'getServices');
    }
  }

  /**
   * Get bookable resources for a clinic
   */
  static async getBookableResources(clinicName: string): Promise<Resource[]> {
    const cacheKey = `bookable_resources_${clinicName}`;
    const cached = this.getCached<Resource[]>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}/bookable`;
      const response = await this.request<Resource[]>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw this.handleError(error, 'getBookableResources');
    }
  }

  /**
   * Update resource availability schedule
   */
  static async updateResourceAvailability(
    resourceId: number,
    availability: Resource['availability']
  ): Promise<Resource> {
    try {
      const response = await this.request<Resource>(
        `${this.ENDPOINT}/${resourceId}/availability`,
        'PUT',
        { availability }
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('resources_');
        this.clearCache(`resource_${resourceId}`);
        this.clearCache('resource_availability_');
        return response.data;
      }
      
      throw new Error('Failed to update resource availability');
    } catch (error) {
      throw this.handleError(error, 'updateResourceAvailability');
    }
  }

  /**
   * Get resource availability for date range
   */
  static async getResourceAvailability(
    resourceId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ResourceAvailabilityResponse> {
    const cacheKey = `resource_availability_${resourceId}_${startDate.toISOString()}_${endDate.toISOString()}`;
    const cached = this.getCached<ResourceAvailabilityResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const endpoint = `${this.ENDPOINT}/${resourceId}/availability?${query}`;
      const response = await this.request<ResourceAvailabilityResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch resource availability');
    } catch (error) {
      throw this.handleError(error, 'getResourceAvailability');
    }
  }

  /**
   * Get resource statistics and performance metrics
   */
  static async getResourceStats(
    resourceId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<ResourceStatsResponse> {
    const cacheKey = `resource_stats_${resourceId}_${startDate?.toISOString()}_${endDate?.toISOString()}`;
    const cached = this.getCached<ResourceStatsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/${resourceId}/stats${queryString}`;
      
      const response = await this.request<ResourceStatsResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch resource statistics');
    } catch (error) {
      throw this.handleError(error, 'getResourceStats');
    }
  }

  /**
   * Search resources by name or specialty
   */
  static async searchResources(searchTerm: string, options: {
    type?: 'practitioner' | 'service' | 'equipment' | 'room';
    clinicName?: string;
    limit?: number;
  } = {}): Promise<Resource[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const cacheKey = `resource_search_${searchTerm}_${JSON.stringify(options)}`;
    const cached = this.getCached<Resource[]>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        q: searchTerm.trim(),
        type: options.type,
        clinicName: options.clinicName,
        limit: options.limit || 20
      });

      const endpoint = `${this.ENDPOINT}/search?${query}`;
      const response = await this.request<Resource[]>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, 60000); // 1 minute cache for searches
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw this.handleError(error, 'searchResources');
    }
  }

  /**
   * Get resource conflicts for scheduling
   */
  static async checkResourceConflicts(
    resourceId: number,
    startDate: Date,
    endDate: Date,
    excludeAppointmentId?: string
  ): Promise<{
    hasConflict: boolean;
    conflicts: Array<{
      appointmentId: string;
      startDate: string;
      endDate: string;
      clientName: string;
      subject: string;
    }>;
  }> {
    try {
      const query = this.buildQuery({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        exclude: excludeAppointmentId
      });

      const endpoint = `${this.ENDPOINT}/${resourceId}/conflicts?${query}`;
      const response = await this.request<any>(endpoint);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return { hasConflict: false, conflicts: [] };
    } catch (error) {
      throw this.handleError(error, 'checkResourceConflicts');
    }
  }

  /**
   * Utility: Clear all resource-related cache
   */
  static clearResourceCache(): void {
    this.clearCache('resources_');
    this.clearCache('resource_');
    this.clearCache('practitioners_');
    this.clearCache('services_');
    this.clearCache('bookable_resources_');
    this.clearCache('resource_availability_');
    this.clearCache('resource_stats_');
    this.clearCache('resource_search_');
  }
}
