import { BaseApiService } from './baseApiService';

interface Appointment {
  id: string;
  appointmentId?: number;
  type: number;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  subject: string;
  location?: string;
  description?: string;
  status: number; // 0=scheduled, 1=completed, 2=cancelled, 3=no-show, 4=rescheduled
  label: number;
  resourceId: number;
  duration: number;
  clientId: string;
  clientKey?: number;
  productKey?: number;
  billDate?: string;
  invoiceDate?: string;
  readyToBill: boolean;
  advancedBilling: boolean;
  advancedBillingId?: number;
  clinicName: string;
  resourceName?: string;
  reminderInfo?: string;
  recurrenceInfo?: string;
  isActive: boolean;
  shadowId?: number;
  groupId?: string;
  dateCreated: string;
  dateModified: string;
}

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

interface AppointmentQueryOptions {
  startDate?: Date;
  endDate?: Date;
  status?: number;
  resourceId?: number;
  clientId?: string;
  page?: number;
  limit?: number;
}

interface CreateAppointmentRequest {
  startDate: Date;
  endDate: Date;
  subject: string;
  clientId: string;
  resourceId: number;
  clinicName: string;
  duration?: number;
  type?: number;
  status?: number;
  label?: number;
  location?: string;
  description?: string;
  reminderInfo?: string;
  recurrenceInfo?: string;
}

interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
  isActive?: boolean;
}

interface PaginatedAppointmentResponse {
  appointments: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface AppointmentStatsResponse {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  completionRate: number;
  cancellationRate: number;
  averageDuration: number;
  upcomingCount: number;
  overdueCount: number;
}

interface ResourceScheduleResponse {
  resource: Resource;
  date: string;
  availability: {
    start: string;
    end: string;
    available: boolean;
  };
  appointments: Appointment[];
  availableSlots: Array<{
    start: string;
    end: string;
    duration: number;
  }>;
}

interface BillingReadyResponse {
  appointments: Appointment[];
  summary: {
    totalAppointments: number;
    totalAmount: number;
    clientCount: number;
  };
}

export class AppointmentApiService extends BaseApiService {
  private static readonly ENDPOINT = '/appointments';
  private static readonly CACHE_TTL = 180000; // 3 minutes (shorter for real-time data)

  /**
   * Get appointments by clinic with comprehensive filtering
   */
  static async getAppointmentsByClinic(
    clinicName: string,
    options: AppointmentQueryOptions = {}
  ): Promise<PaginatedAppointmentResponse> {
    const cacheKey = `appointments_${clinicName}_${JSON.stringify(options)}`;
    
    // Bypass cache for client-specific queries to ensure accurate real-time data
    const bypassCache = !!options.clientId;
    const cached = bypassCache ? null : this.getCached<PaginatedAppointmentResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString(),
        status: options.status,
        resourceId: options.resourceId,
        clientId: options.clientId,
        page: options.page || 1,
        limit: options.limit || 20
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}${queryString}`;
      
      const response = await this.request<any>(endpoint);
      
      if (response.success && response.data) {
        const formattedResponse: PaginatedAppointmentResponse = {
          appointments: response.data,
          pagination: response.pagination
        };
        if (!bypassCache) {
          this.setCached(cacheKey, formattedResponse, this.CACHE_TTL);
        }
        return formattedResponse;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw this.handleError(error, 'getAppointmentsByClinic');
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(appointmentId: string): Promise<Appointment> {
    const cacheKey = `appointment_${appointmentId}`;
    const cached = this.getCached<Appointment>(cacheKey);
    if (cached) return cached;

    try {
      // Use business ID endpoint if appointmentId is a number, otherwise use ObjectId endpoint
      const isBusinessId = /^\d+$/.test(appointmentId);
      const endpoint = isBusinessId 
        ? `${this.ENDPOINT}/business/${encodeURIComponent(appointmentId)}`
        : `${this.ENDPOINT}/${encodeURIComponent(appointmentId)}`;
      
      const response = await this.request<Appointment>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Appointment not found');
    } catch (error) {
      throw this.handleError(error, 'getAppointmentById');
    }
  }

  /**
   * Create new appointment with conflict detection
   */
  static async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    try {
      const response = await this.request<Appointment>(
        this.ENDPOINT,
        'POST',
        {
          ...appointmentData,
          startDate: appointmentData.startDate.toISOString(),
          endDate: appointmentData.endDate.toISOString()
        }
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('appointments_');
        this.clearCache('resource_schedule_');
        this.clearCache('billing_ready');
        return response.data;
      }
      
      throw new Error('Failed to create appointment');
    } catch (error) {
      throw this.handleError(error, 'createAppointment');
    }
  }

  /**
   * Update existing appointment
   */
  static async updateAppointment(appointmentId: string, updates: UpdateAppointmentRequest): Promise<Appointment> {
    try {
      const processedUpdates = {
        ...updates,
        startDate: updates.startDate?.toISOString(),
        endDate: updates.endDate?.toISOString()
      };

      const response = await this.request<Appointment>(
        `${this.ENDPOINT}/${encodeURIComponent(appointmentId)}`,
        'PUT',
        processedUpdates
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('appointments_');
        this.clearCache(`appointment_${appointmentId}`);
        this.clearCache('resource_schedule_');
        return response.data;
      }
      
      throw new Error('Failed to update appointment');
    } catch (error) {
      throw this.handleError(error, 'updateAppointment');
    }
  }

  /**
   * Cancel appointment with reason
   */
  static async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    try {
      const response = await this.request(
        `${this.ENDPOINT}/${encodeURIComponent(appointmentId)}/cancel`,
        'DELETE',
        { reason }
      );
      
      if (response.success) {
        // Clear related cache entries
        this.clearCache('appointments_');
        this.clearCache(`appointment_${appointmentId}`);
        this.clearCache('resource_schedule_');
        return;
      }
      
      throw new Error('Failed to cancel appointment');
    } catch (error) {
      throw this.handleError(error, 'cancelAppointment');
    }
  }

  /**
   * Complete appointment and mark ready for billing
   */
  static async completeAppointment(appointmentId: string, notes?: string): Promise<Appointment> {
    try {
      const response = await this.request<Appointment>(
        `${this.ENDPOINT}/${encodeURIComponent(appointmentId)}/complete`,
        'PUT',
        { notes }
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('appointments_');
        this.clearCache(`appointment_${appointmentId}`);
        this.clearCache('billing_ready');
        return response.data;
      }
      
      throw new Error('Failed to complete appointment');
    } catch (error) {
      throw this.handleError(error, 'completeAppointment');
    }
  }

  /**
   * Get appointments ready for billing
   */
  static async getAppointmentsReadyToBill(clinicName?: string): Promise<BillingReadyResponse> {
    const cacheKey = `billing_ready_${clinicName || 'all'}`;
    const cached = this.getCached<BillingReadyResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = clinicName ? this.buildQuery({ clinicName }) : '';
      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/billing/ready${queryString}`;
      
      const response = await this.request<BillingReadyResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch billing-ready appointments');
    } catch (error) {
      throw this.handleError(error, 'getAppointmentsReadyToBill');
    }
  }

  /**
   * Get resource schedule for specific date
   */
  static async getResourceSchedule(resourceId: number, date: Date): Promise<ResourceScheduleResponse> {
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = `resource_schedule_${resourceId}_${dateStr}`;
    const cached = this.getCached<ResourceScheduleResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({ date: dateStr });
      const endpoint = `${this.ENDPOINT}/resource/${resourceId}/schedule?${query}`;
      
      const response = await this.request<ResourceScheduleResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch resource schedule');
    } catch (error) {
      throw this.handleError(error, 'getResourceSchedule');
    }
  }

  /**
   * Get client appointment history
   */
  static async getClientAppointmentHistory(clientId: string): Promise<{
    client: { id: string; name: string };
    appointments: Appointment[];
    summary: {
      totalAppointments: number;
      completedAppointments: number;
      cancelledAppointments: number;
      upcomingAppointments: number;
    };
  }> {
    const cacheKey = `client_history_${clientId}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/client/${encodeURIComponent(clientId)}/history`;
      const response = await this.request<any>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch client appointment history');
    } catch (error) {
      throw this.handleError(error, 'getClientAppointmentHistory');
    }
  }

  /**
   * Get clinic appointment statistics
   */
  static async getClinicAppointmentStats(
    clinicName: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AppointmentStatsResponse> {
    const cacheKey = `appointment_stats_${clinicName}_${startDate?.toISOString()}_${endDate?.toISOString()}`;
    const cached = this.getCached<AppointmentStatsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/stats/clinic/${encodeURIComponent(clinicName)}${queryString}`;
      
      const response = await this.request<any>(endpoint);
      
      if (response.success && response.data && response.data.statistics) {
        const stats = response.data.statistics;
        const formattedStats: AppointmentStatsResponse = {
          totalAppointments: stats.totalAppointments,
          completedAppointments: stats.completedAppointments,
          cancelledAppointments: stats.cancelledAppointments,
          pendingAppointments: stats.pendingAppointments,
          completionRate: stats.completionRate,
          cancellationRate: stats.cancellationRate,
          averageDuration: stats.averageDuration,
          upcomingCount: stats.pendingAppointments, // Use pending as upcoming for now
          overdueCount: 0   // Would need additional backend calculation
        };
        this.setCached(cacheKey, formattedStats, this.CACHE_TTL);
        return formattedStats;
      }
      
      throw new Error('Failed to fetch appointment statistics');
    } catch (error) {
      throw this.handleError(error, 'getClinicAppointmentStats');
    }
  }

  /**
   * Utility: Clear all appointment-related cache
   */
  static clearAppointmentCache(): void {
    this.clearCache('appointments_');
    this.clearCache('appointment_');
    this.clearCache('resource_schedule_');
    this.clearCache('billing_ready');
    this.clearCache('client_history_');
    this.clearCache('appointment_stats_');
  }
}
