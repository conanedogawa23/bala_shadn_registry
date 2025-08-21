import { useState, useEffect, useCallback } from 'react';
import {
  EventApiService,
  Event,
  EventFilters,
  EventStatsResponse,
  CreateEventRequest,
  UpdateEventRequest,
  EventType,
  EventStatus
} from '../api/eventService';

interface UseEventsOptions {
  filters?: EventFilters;
  autoFetch?: boolean;
  page?: number;
  limit?: number;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  clearError: () => void;
  createEvent: (eventData: CreateEventRequest) => Promise<void>;
  updateEvent: (id: string, eventData: UpdateEventRequest) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  approveEvent: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
}

/**
 * Hook for fetching and managing events with comprehensive functionality
 */
export function useEvents({
  filters = {},
  autoFetch = true,
  page = 1,
  limit = 20
}: UseEventsOptions = {}): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseEventsReturn['pagination']>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await EventApiService.getEvents(filters, page, limit);
      setEvents(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      setEvents([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), page, limit]);

  const createEvent = useCallback(async (eventData: CreateEventRequest) => {
    try {
      setLoading(true);
      await EventApiService.createEvent(eventData);
      await fetchEvents(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const updateEvent = useCallback(async (id: string, eventData: UpdateEventRequest) => {
    try {
      setLoading(true);
      await EventApiService.updateEvent(id, eventData);
      await fetchEvents(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await EventApiService.deleteEvent(id);
      await fetchEvents(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const approveEvent = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await EventApiService.approveEvent(id);
      await fetchEvents(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const toggleVisibility = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await EventApiService.toggleEventVisibility(id);
      await fetchEvents(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle event visibility');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [fetchEvents, autoFetch]);

  return {
    events,
    loading,
    error,
    pagination,
    refetch: fetchEvents,
    clearError,
    createEvent,
    updateEvent,
    deleteEvent,
    approveEvent,
    toggleVisibility
  };
}

interface UseEventOptions {
  id?: string;
  autoFetch?: boolean;
}

interface UseEventReturn {
  event: Event | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching a single event
 */
export function useEvent({
  id,
  autoFetch = true
}: UseEventOptions = {}): UseEventReturn {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await EventApiService.getEventById(id);
      setEvent(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && id) {
      fetchEvent();
    }
  }, [fetchEvent, autoFetch, id]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
    clearError
  };
}

interface UseEventsByClinicOptions {
  clinicName?: string;
  filters?: EventFilters;
  autoFetch?: boolean;
}

interface UseEventsByClinicReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching events by clinic
 */
export function useEventsByClinic({
  clinicName,
  filters = {},
  autoFetch = true
}: UseEventsByClinicOptions = {}): UseEventsByClinicReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!clinicName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await EventApiService.getEventsByClinic(clinicName, filters);
      setEvents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clinic events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [clinicName, JSON.stringify(filters)]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && clinicName) {
      fetchEvents();
    }
  }, [fetchEvents, autoFetch, clinicName]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    clearError
  };
}

interface UseEventsByClientOptions {
  clientId?: string;
  filters?: EventFilters;
  autoFetch?: boolean;
}

interface UseEventsByClientReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching events by client
 */
export function useEventsByClient({
  clientId,
  filters = {},
  autoFetch = true
}: UseEventsByClientOptions = {}): UseEventsByClientReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await EventApiService.getEventsByClient(clientId, filters);
      setEvents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [clientId, JSON.stringify(filters)]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && clientId) {
      fetchEvents();
    }
  }, [fetchEvents, autoFetch, clientId]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    clearError
  };
}

interface UseUpcomingEventsOptions {
  limit?: number;
  autoFetch?: boolean;
}

interface UseUpcomingEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching upcoming events
 */
export function useUpcomingEvents({
  limit = 10,
  autoFetch = true
}: UseUpcomingEventsOptions = {}): UseUpcomingEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await EventApiService.getUpcomingEvents(limit);
      setEvents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [fetchEvents, autoFetch]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    clearError
  };
}

interface UseEventStatsOptions {
  clinicName?: string;
  autoFetch?: boolean;
}

interface UseEventStatsReturn {
  stats: EventStatsResponse['data'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching event statistics
 */
export function useEventStats({
  clinicName,
  autoFetch = true
}: UseEventStatsOptions = {}): UseEventStatsReturn {
  const [stats, setStats] = useState<EventStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await EventApiService.getEventStats(clinicName);
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event statistics');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [clinicName]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [fetchStats, autoFetch]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    clearError
  };
}

interface UseEventSearchOptions {
  query?: string;
  filters?: EventFilters;
  autoFetch?: boolean;
  debounceMs?: number;
}

interface UseEventSearchReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for searching events with debouncing
 */
export function useEventSearch({
  query = '',
  filters = {},
  autoFetch = true,
  debounceMs = 300
}: UseEventSearchOptions = {}): UseEventSearchReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const searchEvents = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await EventApiService.searchEvents(searchQuery, filters);
      setEvents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && debouncedQuery) {
      searchEvents(debouncedQuery);
    }
  }, [searchEvents, debouncedQuery, autoFetch]);

  return {
    events,
    loading,
    error,
    search: searchEvents,
    clearError
  };
}
