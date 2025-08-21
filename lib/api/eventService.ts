import { BaseApiService } from './baseApiService';

// Event interfaces matching backend model
export interface Event {
  _id: string;
  eventId: number;
  parentEventId?: number;
  userId?: number;
  categoryId?: number;
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  eventTimeEnd?: string;
  location?: string;
  cost?: string;
  url?: string;
  isPublic: boolean;
  isApproved: boolean;
  customTextBox1?: string;
  customTextBox2?: string;
  customTextBox3?: string;
  customTextArea1?: string;
  customTextArea2?: string;
  customTextArea3?: string;
  customCheckBox1?: boolean;
  customCheckBox2?: boolean;
  customCheckBox3?: boolean;
  clientId?: string;
  clientFullName?: string;
  clientClinicName?: string;
  dateAdded: string;
  userAdded?: number;
  dateCreated: string;
  dateModified: string;
}

export enum EventType {
  APPOINTMENT = 'appointment',
  ORDER = 'order', 
  PAYMENT = 'payment',
  CLIENT = 'client',
  SYSTEM = 'system',
  CLINIC = 'clinic'
}

export enum EventStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

// API Response interfaces
export interface EventListResponse {
  success: boolean;
  data: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EventResponse {
  success: boolean;
  data: Event;
}

export interface EventStatsResponse {
  success: boolean;
  data: {
    total: number;
    pending: number;
    approved: number;
    publicEvents: number;
    privateEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    todayEvents: number;
    byCategory: Record<string, number>;
    byClient: Record<string, number>;
  };
}

// Filter and query interfaces
export interface EventFilters {
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
  isApproved?: boolean;
  categoryId?: number;
  clientId?: string;
  clinicName?: string;
  searchQuery?: string;
  type?: EventType;
  status?: EventStatus;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  eventTimeEnd?: string;
  location?: string;
  cost?: string;
  url?: string;
  isPublic?: boolean;
  categoryId?: number;
  clientId?: string;
  customTextBox1?: string;
  customTextBox2?: string;
  customTextBox3?: string;
  customTextArea1?: string;
  customTextArea2?: string;
  customTextArea3?: string;
  customCheckBox1?: boolean;
  customCheckBox2?: boolean;
  customCheckBox3?: boolean;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  isApproved?: boolean;
}

/**
 * EventApiService - Frontend service for Events API integration
 * Provides comprehensive event management functionality
 */
export class EventApiService extends BaseApiService {
  private static readonly BASE_PATH = '/events';

  /**
   * Get all events with optional filtering and pagination
   */
  static async getEvents(filters: EventFilters = {}, page = 1, limit = 20): Promise<EventListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    });

    return this.get(`${this.BASE_PATH}?${params.toString()}`);
  }

  /**
   * Get events optimized for frontend display
   */
  static async getFrontendEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    );

    return this.get(`${this.BASE_PATH}/frontend-compatible?${params.toString()}`);
  }

  /**
   * Get events by clinic name
   */
  static async getEventsByClinic(clinicName: string, filters: EventFilters = {}): Promise<EventListResponse> {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    );

    return this.get(`${this.BASE_PATH}/clinic/${encodeURIComponent(clinicName)}?${params.toString()}`);
  }

  /**
   * Get events by client ID
   */
  static async getEventsByClient(clientId: string, filters: EventFilters = {}): Promise<EventListResponse> {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    );

    return this.get(`${this.BASE_PATH}/client/${clientId}?${params.toString()}`);
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(limit = 10): Promise<EventListResponse> {
    return this.get(`${this.BASE_PATH}/upcoming?limit=${limit}`);
  }

  /**
   * Get events by date range
   */
  static async getEventsByDateRange(startDate: string, endDate: string): Promise<EventListResponse> {
    const params = new URLSearchParams({
      startDate,
      endDate
    });

    return this.get(`${this.BASE_PATH}/date-range?${params.toString()}`);
  }

  /**
   * Get events for calendar display
   */
  static async getEventsForCalendar(startDate: string, endDate: string): Promise<EventListResponse> {
    const params = new URLSearchParams({
      startDate,
      endDate
    });

    return this.get(`${this.BASE_PATH}/calendar?${params.toString()}`);
  }

  /**
   * Get public events (no authentication required)
   */
  static async getPublicEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    );

    return this.get(`${this.BASE_PATH}/public?${params.toString()}`);
  }

  /**
   * Search events
   */
  static async searchEvents(query: string, filters: EventFilters = {}): Promise<EventListResponse> {
    const params = new URLSearchParams({
      q: query,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    });

    return this.get(`${this.BASE_PATH}/search?${params.toString()}`);
  }

  /**
   * Get event statistics
   */
  static async getEventStats(clinicName?: string): Promise<EventStatsResponse> {
    const params = clinicName ? `?clinicName=${encodeURIComponent(clinicName)}` : '';
    return this.get(`${this.BASE_PATH}/stats/overview${params}`);
  }

  /**
   * Get single event by ID
   */
  static async getEventById(id: string): Promise<EventResponse> {
    return this.get(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Get event by event ID (from MSSQL)
   */
  static async getEventByEventId(eventId: number): Promise<EventResponse> {
    return this.get(`${this.BASE_PATH}/event-id/${eventId}`);
  }

  /**
   * Create a new event
   */
  static async createEvent(eventData: CreateEventRequest): Promise<EventResponse> {
    return this.post(this.BASE_PATH, eventData);
  }

  /**
   * Update an existing event
   */
  static async updateEvent(id: string, eventData: UpdateEventRequest): Promise<EventResponse> {
    return this.put(`${this.BASE_PATH}/${id}`, eventData);
  }

  /**
   * Approve an event
   */
  static async approveEvent(id: string): Promise<EventResponse> {
    return this.put(`${this.BASE_PATH}/${id}/approve`, {});
  }

  /**
   * Toggle event visibility (public/private)
   */
  static async toggleEventVisibility(id: string): Promise<EventResponse> {
    return this.put(`${this.BASE_PATH}/${id}/toggle-visibility`, {});
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    return this.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Get pending approval events
   */
  static async getPendingApprovalEvents(): Promise<EventListResponse> {
    return this.get(`${this.BASE_PATH}/pending-approval`);
  }

  // Utility methods
  
  /**
   * Format event date for display
   */
  static formatEventDate(date: string): string {
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format event time for display
   */
  static formatEventTime(time: string): string {
    return new Date(time).toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format event date and time for display
   */
  static formatEventDateTime(date: string, time?: string): string {
    const eventDate = new Date(date);
    if (time) {
      const eventTime = new Date(time);
      eventDate.setHours(eventTime.getHours(), eventTime.getMinutes());
    }
    
    return eventDate.toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if event is upcoming
   */
  static isEventUpcoming(eventDate: string, eventTime?: string): boolean {
    const now = new Date();
    const event = new Date(eventDate);
    
    if (eventTime) {
      const time = new Date(eventTime);
      event.setHours(time.getHours(), time.getMinutes());
    }
    
    return event > now;
  }

  /**
   * Check if event is today
   */
  static isEventToday(eventDate: string): boolean {
    const today = new Date();
    const event = new Date(eventDate);
    
    return today.toDateString() === event.toDateString();
  }

  /**
   * Get event type color for UI
   */
  static getEventTypeColor(type: EventType): string {
    switch (type) {
      case EventType.APPOINTMENT:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case EventType.ORDER:
        return 'bg-green-100 text-green-800 border-green-200';
      case EventType.PAYMENT:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case EventType.CLIENT:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case EventType.SYSTEM:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case EventType.CLINIC:
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get event status color for UI
   */
  static getEventStatusColor(status: EventStatus): string {
    switch (status) {
      case EventStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case EventStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case EventStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case EventStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Clear events cache
   */
  static clearEventsCache(): void {
    this.clearCache('/events');
  }
}

// Re-export for convenience
export { EventApiService as default };
