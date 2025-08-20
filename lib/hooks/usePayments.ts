import { useState, useEffect, useCallback } from 'react';
import { PaymentApiService } from '../api/paymentService';
import type { Payment } from '../data/mockDataService';

type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded' | 'partial';

interface UsePaymentsOptions {
  clinicName: string;
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  autoFetch?: boolean;
}

interface UsePaymentsReturn {
  payments: Payment[];
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

export function usePayments({
  clinicName,
  page = 1,
  limit = 20,
  status,
  startDate,
  endDate,
  search,
  autoFetch = true
}: UsePaymentsOptions): UsePaymentsReturn {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePaymentsReturn['pagination']>(null);

  const fetchPayments = useCallback(async () => {
    if (!clinicName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await PaymentApiService.getPaymentsByClinic(clinicName, {
        page,
        limit,
        status,
        startDate,
        endDate,
        search
      });

      setPayments(response.payments);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      setPayments([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [clinicName, page, limit, status, startDate, endDate, search]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPayments();
    }
  }, [fetchPayments, autoFetch]);

  return {
    payments,
    loading,
    error,
    pagination,
    refetch: fetchPayments,
    clearError
  };
}

interface UsePaymentStatsOptions {
  clinicName?: string;
  autoFetch?: boolean;
}

interface UsePaymentStatsReturn {
  stats: {
    totalPayments: number;
    totalAmount: number;
    totalPaid: number;
    totalDue: number;
    averagePayment: number;
    statusDistribution: Record<PaymentStatus, number>;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function usePaymentStats({
  clinicName,
  autoFetch = true
}: UsePaymentStatsOptions): UsePaymentStatsReturn {
  const [stats, setStats] = useState<UsePaymentStatsReturn['stats']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const statsData = await PaymentApiService.getPaymentStats(clinicName);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment statistics');
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

interface UseInvoiceDataOptions {
  paymentId?: string;
  autoFetch?: boolean;
}

interface UseInvoiceDataReturn {
  invoiceData: {
    invoice: {
      invoiceNumber: string;
      invoiceDate: string;
      dueDate?: string;
    };
    payment: Payment;
    client: any;
    clinic: any;
    insurance: any;
    lineItems: any[];
    financials: any;
  } | null;
  loading: boolean;
  error: string | null;
  generateInvoice: (paymentId: string) => Promise<void>;
  clearError: () => void;
}

export function useInvoiceData({
  paymentId,
  autoFetch = true
}: UseInvoiceDataOptions): UseInvoiceDataReturn {
  const [invoiceData, setInvoiceData] = useState<UseInvoiceDataReturn['invoiceData']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvoice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await PaymentApiService.generateInvoiceData(id);
      setInvoiceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invoice data');
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && paymentId) {
      generateInvoice(paymentId);
    }
  }, [autoFetch, paymentId, generateInvoice]);

  return {
    invoiceData,
    loading,
    error,
    generateInvoice,
    clearError
  };
}
