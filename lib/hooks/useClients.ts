/**
 * @deprecated This hook is deprecated in favor of Server Components with server-side data fetching.
 * For new pages, use fetchClientsByClinic from '@/lib/server/data-fetchers' in Server Components.
 * This hook remains for backward compatibility with existing client-side implementations.
 * 
 * Migration Guide:
 * - Replace useClients hook with fetchClientsByClinic in Server Components
 * - Move interactive logic to separate Client Components
 * - See app/clinic/[clinic]/clients/page.tsx for reference implementation
 */

import { useState, useEffect, useCallback } from 'react';
import { ClientApiService } from '../api/clientService';
import type { Client } from '../data/mockDataService';
import { logger } from '../utils/logger';

interface UseClientsOptions {
  clinicName: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  autoFetch?: boolean;
}

interface UseClientsReturn {
  clients: Client[];
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

export function useClients({
  clinicName,
  page = 1,
  limit = 20,
  search,
  status,
  autoFetch = true
}: UseClientsOptions): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseClientsReturn['pagination']>(null);

  const fetchClients = useCallback(async () => {
    if (!clinicName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ClientApiService.getClientsByClinic(clinicName, {
        page,
        limit,
        search,
        status
      });

      setClients(response.clients);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      setClients([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [clinicName, page, limit, search, status]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchClients();
    }
  }, [fetchClients, autoFetch]);

  return {
    clients,
    loading,
    error,
    pagination,
    refetch: fetchClients,
    clearError
  };
}

interface UseClientOptions {
  clientId: string;
  autoFetch?: boolean;
}

interface UseClientReturn {
  client: Client | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useClient({
  clientId,
  autoFetch = true
}: UseClientOptions): UseClientReturn {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      // Debug: Log what we're requesting
      logger.debug('[useClient] Fetching client with ID:', clientId);
      const clientData = await ClientApiService.getClientById(clientId);
      logger.debug('[useClient] Received client data:', {
        requestedId: clientId,
        receivedClientId: clientData.clientId,
        receivedName: `${clientData.personalInfo?.firstName || ''} ${clientData.personalInfo?.lastName || ''}`.trim()
      });
      setClient(clientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client');
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchClient();
    }
  }, [fetchClient, autoFetch]);

  return {
    client,
    loading,
    error,
    refetch: fetchClient,
    clearError
  };
}

interface UseClientSearchOptions {
  autoFetch?: boolean;
}

interface UseClientSearchReturn {
  searchResults: Client[];
  loading: boolean;
  error: string | null;
  search: (searchTerm: string, clinicName?: string) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export function useClientSearch({
  autoFetch = false
}: UseClientSearchOptions = {}): UseClientSearchReturn {
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm: string, clinicName?: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await ClientApiService.searchClients(searchTerm, clinicName);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search clients');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    search,
    clearResults,
    clearError
  };
}

interface UseClientStatsOptions {
  clinicName: string;
  autoFetch?: boolean;
}

interface UseClientStatsReturn {
  stats: {
    totalClients: number;
    activeClients: number;
    newThisMonth: number;
    withInsurance: number;
    averageAge: number;
    genderDistribution: Record<string, number>;
    topCities: Array<{ city: string; count: number }>;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useClientStats({
  clinicName,
  autoFetch = true
}: UseClientStatsOptions): UseClientStatsReturn {
  const [stats, setStats] = useState<UseClientStatsReturn['stats']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!clinicName) return;

    setLoading(true);
    setError(null);

    try {
      const statsData = await ClientApiService.getClientStats(clinicName);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client statistics');
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
