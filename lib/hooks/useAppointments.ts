import { useState, useEffect, useCallback } from 'react';
import { AppointmentApiService } from '../api/appointmentService';

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
  status: number;
  label: number;
  resourceId: number;
  duration: number;
  clientId: string;
  clientKey?: number;
  readyToBill: boolean;
  clinicName: string;
  resourceName?: string;
  isActive: boolean;
  dateCreated: string;
  dateModified: string;
}

interface UseAppointmentsOptions {
  clinicName: string;
  startDate?: Date;
  endDate?: Date;
  status?: number;
  resourceId?: number;
  clientId?: string;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useAppointments({
  clinicName,
  startDate,
  endDate,
  status,
  resourceId,
  clientId,
  page = 1,
  limit = 20,
  autoFetch = true
}: UseAppointmentsOptions): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseAppointmentsReturn['pagination']>(null);

  const fetchAppointments = useCallback(async () => {
    if (!clinicName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await AppointmentApiService.getAppointmentsByClinic(clinicName, {
        startDate,
        endDate,
        status,
        resourceId,
        clientId,
        page,
        limit
      });

      setAppointments(response.appointments);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointments';
      setError(errorMessage);
      setAppointments([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [clinicName, startDate, endDate, status, resourceId, clientId, page, limit]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchAppointments();
    }
  }, [fetchAppointments, autoFetch]);

  return {
    appointments,
    loading,
    error,
    pagination,
    refetch: fetchAppointments,
    clearError
  };
}

interface UseAppointmentStatsOptions {
  clinicName: string;
  startDate?: Date;
  endDate?: Date;
  autoFetch?: boolean;
}

interface UseAppointmentStatsReturn {
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    pendingAppointments: number;
    completionRate: number;
    cancellationRate: number;
    averageDuration: number;
    upcomingCount: number;
    overdueCount: number;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useAppointmentStats({
  clinicName,
  startDate,
  endDate,
  autoFetch = true
}: UseAppointmentStatsOptions): UseAppointmentStatsReturn {
  const [stats, setStats] = useState<UseAppointmentStatsReturn['stats']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!clinicName) return;

    setLoading(true);
    setError(null);

    try {
      const statsData = await AppointmentApiService.getClinicAppointmentStats(
        clinicName,
        startDate,
        endDate
      );
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointment statistics');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [clinicName, startDate, endDate]);

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
