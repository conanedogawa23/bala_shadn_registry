/**
 * @deprecated This hook is deprecated in favor of Server Components with server-side data fetching.
 * For new pages, use fetchPaymentsByClinic from '@/lib/server/data-fetchers' in Server Components.
 * This hook remains for backward compatibility with existing client-side implementations.
 * 
 * Migration Guide:
 * - Replace usePayments hook with fetchPaymentsByClinic in Server Components
 * - Move interactive logic to separate Client Components
 * - See app/clinic/[clinic]/payments/page.tsx for reference implementation
 */

import { logger } from '../utils/logger';
import { useState, useEffect, useCallback } from 'react';
import { 
  PaymentApiService, 
  Payment, 
  PaymentFilters, 
  PaymentStatus,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  AddPaymentAmountRequest,
  ProcessRefundRequest,
  PaymentStatsResponse,
  RevenueDataResponse
} from '../api/paymentService';

// Hook return types
interface UsePaymentsResult {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  refetch: () => Promise<void>;
  createPayment: (data: CreatePaymentRequest) => Promise<Payment>;
  updatePayment: (id: string, data: UpdatePaymentRequest) => Promise<Payment>;
  deletePayment: (id: string) => Promise<void>;
  addPaymentAmount: (id: string, data: AddPaymentAmountRequest) => Promise<Payment>;
  processRefund: (id: string, data: ProcessRefundRequest) => Promise<Payment>;
  clearError: () => void;
}

interface UsePaymentResult {
  payment: Payment | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

interface UsePaymentStatsResult {
  stats: PaymentStatsResponse['data'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

interface UseRevenueDataResult {
  revenueData: RevenueDataResponse['data'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing multiple payments with filtering and pagination
 */
export function usePayments(filters: PaymentFilters = {}): UsePaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePaymentsResult['pagination']>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentApiService.getAllPayments(filters);
      
      setPayments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments';
      setError(errorMessage);
      logger.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createPayment = useCallback(async (data: CreatePaymentRequest): Promise<Payment> => {
    try {
      setError(null);
      const response = await PaymentApiService.createPayment(data);
      
      // Refresh the payments list
      await fetchPayments();
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment';
      setError(errorMessage);
      throw err;
    }
  }, [fetchPayments]);

  const updatePayment = useCallback(async (id: string, data: UpdatePaymentRequest): Promise<Payment> => {
    try {
      setError(null);
      const response = await PaymentApiService.updatePayment(id, data);
      
      // Update the payment in the local state
      setPayments(prev => prev.map(payment => 
        payment._id === id ? response.data : payment
      ));
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deletePayment = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await PaymentApiService.deletePayment(id);
      
      // Remove the payment from local state
      setPayments(prev => prev.filter(payment => payment._id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const addPaymentAmount = useCallback(async (id: string, data: AddPaymentAmountRequest): Promise<Payment> => {
    try {
      setError(null);
      const response = await PaymentApiService.addPaymentAmount(id, data);
      
      // Update the payment in the local state
      setPayments(prev => prev.map(payment => 
        payment._id === id ? response.data : payment
      ));
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment amount';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const processRefund = useCallback(async (id: string, data: ProcessRefundRequest): Promise<Payment> => {
    try {
      setError(null);
      const response = await PaymentApiService.processRefund(id, data);
      
      // Update the payment in the local state
      setPayments(prev => prev.map(payment => 
        payment._id === id ? response.data : payment
      ));
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process refund';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    pagination,
    refetch: fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    addPaymentAmount,
    processRefund,
    clearError
  };
}

/**
 * Hook for managing payments by clinic
 */
export function usePaymentsByClinic(
  clinicName: string, 
  filters: { page?: number; limit?: number; status?: PaymentStatus; outstanding?: boolean; autoFetch?: boolean } = {}
): UsePaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePaymentsResult['pagination']>(null);

  const fetchPayments = useCallback(async () => {
    if (!clinicName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Extract autoFetch from filters before passing to API
      const { autoFetch, ...apiFilters } = filters;
      const response = await PaymentApiService.getPaymentsByClinic(clinicName, apiFilters);
      
      setPayments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clinic payments';
      setError(errorMessage);
      logger.error('Error fetching clinic payments:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicName, filters]);

  const createPayment = useCallback(async (data: CreatePaymentRequest): Promise<Payment> => {
    try {
      setError(null);
      const response = await PaymentApiService.createPayment(data);
      
      // Refresh the payments list
      await fetchPayments();
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment';
      setError(errorMessage);
      throw err;
    }
  }, [fetchPayments]);

  const updatePayment = useCallback(async (id: string, data: UpdatePaymentRequest): Promise<Payment> => {
    try {
      setError(null);
      const response = await PaymentApiService.updatePayment(id, data);
      
      setPayments(prev => prev.map(payment => 
        payment._id === id ? response.data : payment
      ));
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deletePayment = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await PaymentApiService.deletePayment(id);
      
      setPayments(prev => prev.filter(payment => payment._id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const addPaymentAmount = useCallback(async (id: string, data: AddPaymentAmountRequest): Promise<Payment> => {
    try {
      setError(null);
      const response = await PaymentApiService.addPaymentAmount(id, data);
      
      setPayments(prev => prev.map(payment => 
        payment._id === id ? response.data : payment
      ));
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment amount';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const processRefund = useCallback(async (id: string, data: ProcessRefundRequest): Promise<Payment> => {
    try {
      setError(null);
      const response = await PaymentApiService.processRefund(id, data);
      
      setPayments(prev => prev.map(payment => 
        payment._id === id ? response.data : payment
      ));
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process refund';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    // Only auto-fetch if autoFetch is not explicitly set to false
    if (filters.autoFetch !== false) {
      fetchPayments();
    }
  }, [fetchPayments, filters.autoFetch]);

  return {
    payments,
    loading,
    error,
    pagination,
    refetch: fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    addPaymentAmount,
    processRefund,
    clearError
  };
}

/**
 * Hook for managing a single payment
 */
export function usePayment(paymentId: string | null): UsePaymentResult {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayment = useCallback(async () => {
    if (!paymentId) {
      setPayment(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      logger.debug('usePayment: Fetching payment with ID:', paymentId);
      
      const response = await PaymentApiService.getPaymentById(paymentId);
      
      logger.debug('usePayment: Response received:', response);
      
      if (response.success && response.data) {
        setPayment(response.data);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment';
      setError(errorMessage);
      logger.error('usePayment: Error fetching payment:', {
        paymentId,
        error: err,
        errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  return {
    payment,
    loading,
    error,
    refetch: fetchPayment,
    clearError
  };
}

/**
 * Hook for managing payments by client
 */
export function usePaymentsByClient(clientId: number | null): UsePaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!clientId) {
      setPayments([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentApiService.getPaymentsByClient(clientId);
      setPayments(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch client payments';
      setError(errorMessage);
      logger.error('Error fetching client payments:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    pagination: null,
    refetch: fetchPayments,
    createPayment: async () => { throw new Error('Not implemented for client payments'); },
    updatePayment: async () => { throw new Error('Not implemented for client payments'); },
    deletePayment: async () => { throw new Error('Not implemented for client payments'); },
    addPaymentAmount: async () => { throw new Error('Not implemented for client payments'); },
    processRefund: async () => { throw new Error('Not implemented for client payments'); },
    clearError
  };
}

/**
 * Hook for payment statistics
 */
export function usePaymentStats(clinicName: string): UsePaymentStatsResult {
  const [stats, setStats] = useState<PaymentStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!clinicName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentApiService.getPaymentStats(clinicName);
      setStats(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment statistics';
      setError(errorMessage);
      logger.error('Error fetching payment stats:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicName]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    clearError
  };
}

/**
 * Hook for payments by order number
 */
export function usePaymentsByOrder(orderNumber: string): UsePaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePaymentsResult['pagination']>(null);

  const fetchPayments = useCallback(async () => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentApiService.getPaymentsByOrder(orderNumber);
      
      setPayments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order payments';
      setError(errorMessage);
      logger.error('Error fetching order payments:', err);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    pagination,
    refetch: fetchPayments,
    createPayment: async () => { throw new Error('Not implemented for order payments'); },
    updatePayment: async () => { throw new Error('Not implemented for order payments'); },
    deletePayment: async () => { throw new Error('Not implemented for order payments'); },
    addPaymentAmount: async () => { throw new Error('Not implemented for order payments'); },
    processRefund: async () => { throw new Error('Not implemented for order payments'); },
    clearError
  };
}

/**
 * Hook for payments by order ID (MongoDB _id)
 */
export function usePaymentsByOrderId(orderId: string): UsePaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePaymentsResult['pagination']>(null);

  const fetchPayments = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentApiService.getPaymentsByOrderId(orderId);
      
      setPayments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order payments';
      setError(errorMessage);
      logger.error('Error fetching order payments by ID:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    pagination,
    refetch: fetchPayments,
    createPayment: async () => { throw new Error('Not implemented for order payments'); },
    updatePayment: async () => { throw new Error('Not implemented for order payments'); },
    deletePayment: async () => { throw new Error('Not implemented for order payments'); },
    addPaymentAmount: async () => { throw new Error('Not implemented for order payments'); },
    processRefund: async () => { throw new Error('Not implemented for order payments'); },
    clearError
  };
}

/**
 * Hook for outstanding payments
 */
export function useOutstandingPayments(
  clinicName: string,
  filters: { page?: number; limit?: number } = {}
): UsePaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePaymentsResult['pagination']>(null);

  const fetchPayments = useCallback(async () => {
    if (!clinicName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentApiService.getOutstandingPayments(clinicName, filters);
      
      setPayments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch outstanding payments';
      setError(errorMessage);
      logger.error('Error fetching outstanding payments:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicName, filters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    pagination,
    refetch: fetchPayments,
    createPayment: async () => { throw new Error('Not implemented for outstanding payments'); },
    updatePayment: async () => { throw new Error('Not implemented for outstanding payments'); },
    deletePayment: async () => { throw new Error('Not implemented for outstanding payments'); },
    addPaymentAmount: async () => { throw new Error('Not implemented for outstanding payments'); },
    processRefund: async () => { throw new Error('Not implemented for outstanding payments'); },
    clearError
  };
}

/**
 * Hook for revenue data
 */
export function useRevenueData(
  clinicName: string,
  startDate?: string,
  endDate?: string
): UseRevenueDataResult {
  const [revenueData, setRevenueData] = useState<RevenueDataResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = useCallback(async () => {
    if (!clinicName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentApiService.getRevenueData(clinicName, startDate, endDate);
      setRevenueData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch revenue data';
      setError(errorMessage);
      logger.error('Error fetching revenue data:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicName, startDate, endDate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  return {
    revenueData,
    loading,
    error,
    refetch: fetchRevenueData,
    clearError
  };
}
