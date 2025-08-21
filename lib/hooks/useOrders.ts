import { useState, useEffect, useCallback } from 'react';
import {
  OrderService,
  Order,
  OrderQuery,
  OrderStatus,
  PaymentStatus,
  CreateOrderData,
  PaymentData,
  RevenueAnalyticsData,
  ProductPerformanceData
} from '../api/orderService';

interface UseOrdersOptions {
  query?: OrderQuery;
  autoFetch?: boolean;
}

interface UseOrdersReturn {
  orders: Order[];
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
}

/**
 * Hook for fetching and managing orders with comprehensive filtering
 * Follows established patterns with loading states and error handling
 */
export function useOrders({
  query = {},
  autoFetch = true
}: UseOrdersOptions = {}): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseOrdersReturn['pagination']>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.getOrders(query);
      setOrders(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setOrders([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [fetchOrders, autoFetch]);

  return {
    orders,
    loading,
    error,
    pagination,
    refetch: fetchOrders,
    clearError
  };
}

interface UseOrderOptions {
  id: string;
  autoFetch?: boolean;
}

interface UseOrderReturn {
  order: Order | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching a single order by ID or Order Number
 * Optimized with caching and error handling
 */
export function useOrder({
  id,
  autoFetch = true
}: UseOrderOptions): UseOrderReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.getOrderById(id);
      setOrder(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && id) {
      fetchOrder();
    }
  }, [fetchOrder, autoFetch, id]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
    clearError
  };
}

interface UseOrdersByClientOptions {
  clientId: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UseOrdersByClientReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching orders by client ID
 * Client order history for appointment tracking
 */
export function useOrdersByClient({
  clientId,
  limit = 50,
  autoFetch = true
}: UseOrdersByClientOptions): UseOrdersByClientReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.getOrdersByClient(clientId, limit);
      setOrders(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [clientId, limit]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && clientId) {
      fetchOrders();
    }
  }, [fetchOrders, autoFetch, clientId]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    clearError
  };
}

interface UseOrdersByClinicOptions {
  clinicName: string;
  query?: Omit<OrderQuery, 'clinicName'>;
  autoFetch?: boolean;
}

interface UseOrdersByClinicReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching orders by clinic with date range filtering
 * Clinic-specific order management with date filtering
 */
export function useOrdersByClinic({
  clinicName,
  query = {},
  autoFetch = true
}: UseOrdersByClinicOptions): UseOrdersByClinicReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!clinicName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.getOrdersByClinic(clinicName, query);
      setOrders(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clinic orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [clinicName, JSON.stringify(query)]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && clinicName) {
      fetchOrders();
    }
  }, [fetchOrders, autoFetch, clinicName]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    clearError
  };
}

interface UseBillingOrdersOptions {
  clinicName?: string;
  autoFetch?: boolean;
}

interface UseBillingOrdersReturn {
  readyForBilling: Order[];
  overdueOrders: Order[];
  loading: boolean;
  error: string | null;
  refetchReady: () => Promise<void>;
  refetchOverdue: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing billing-related orders
 * Comprehensive billing workflow management
 */
export function useBillingOrders({
  clinicName,
  autoFetch = true
}: UseBillingOrdersOptions = {}): UseBillingOrdersReturn {
  const [readyForBilling, setReadyForBilling] = useState<Order[]>([]);
  const [overdueOrders, setOverdueOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReadyForBilling = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.getOrdersReadyForBilling(clinicName);
      setReadyForBilling(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders ready for billing');
      setReadyForBilling([]);
    } finally {
      setLoading(false);
    }
  }, [clinicName]);

  const fetchOverdueOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.getOverdueOrders();
      setOverdueOrders(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overdue orders');
      setOverdueOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchReadyForBilling();
      fetchOverdueOrders();
    }
  }, [fetchReadyForBilling, fetchOverdueOrders, autoFetch]);

  return {
    readyForBilling,
    overdueOrders,
    loading,
    error,
    refetchReady: fetchReadyForBilling,
    refetchOverdue: fetchOverdueOrders,
    clearError
  };
}

interface UseRevenueAnalyticsOptions {
  clinicName: string;
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

interface UseRevenueAnalyticsReturn {
  analytics: RevenueAnalyticsData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

/**
 * Hook for fetching revenue analytics data
 * Business intelligence for financial reporting
 */
export function useRevenueAnalytics({
  clinicName,
  startDate,
  endDate,
  autoFetch = true
}: UseRevenueAnalyticsOptions): UseRevenueAnalyticsReturn {
  const [analytics, setAnalytics] = useState<RevenueAnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!clinicName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.getRevenueAnalytics(clinicName, startDate, endDate);
      // Extract analytics array from the nested response structure
      const analyticsArray = response.data?.analytics || [];
      setAnalytics(Array.isArray(analyticsArray) ? analyticsArray : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue analytics');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  }, [clinicName, startDate, endDate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calculate totals with safe array operations
  const totalRevenue = Array.isArray(analytics) ? analytics.reduce((sum, item) => sum + (item.totalRevenue || 0), 0) : 0;
  const totalOrders = Array.isArray(analytics) ? analytics.reduce((sum, item) => sum + (item.orderCount || 0), 0) : 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  useEffect(() => {
    if (autoFetch && clinicName) {
      fetchAnalytics();
    }
  }, [fetchAnalytics, autoFetch, clinicName]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    clearError,
    totalRevenue,
    totalOrders,
    avgOrderValue
  };
}

interface UseProductPerformanceOptions {
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

interface UseProductPerformanceReturn {
  performance: ProductPerformanceData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching product performance analytics
 * Product-specific business intelligence
 */
export function useProductPerformance({
  startDate,
  endDate,
  autoFetch = true
}: UseProductPerformanceOptions = {}): UseProductPerformanceReturn {
  const [performance, setPerformance] = useState<ProductPerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.getProductPerformance(startDate, endDate);
      // Extract performance array from the nested response structure
      const performanceArray = response.data?.performance || [];
      setPerformance(Array.isArray(performanceArray) ? performanceArray : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product performance');
      setPerformance([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPerformance();
    }
  }, [fetchPerformance, autoFetch]);

  return {
    performance,
    loading,
    error,
    refetch: fetchPerformance,
    clearError
  };
}

interface UseOrderMutationReturn {
  createOrder: (orderData: CreateOrderData) => Promise<Order>;
  updateOrder: (id: string, updateData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>;
  markReadyForBilling: (id: string) => Promise<Order>;
  processPayment: (id: string, paymentData: PaymentData) => Promise<Order>;
  cancelOrder: (id: string, reason?: string) => Promise<Order>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for order mutations and lifecycle management
 * Comprehensive order operations with loading and error states
 */
export function useOrderMutation(): UseOrderMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (orderData: CreateOrderData): Promise<Order> => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.createOrder(orderData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = useCallback(async (id: string, updateData: Partial<Order>): Promise<Order> => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.updateOrder(id, updateData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus): Promise<Order> => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.updateOrderStatus(id, status);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const markReadyForBilling = useCallback(async (id: string): Promise<Order> => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.markReadyForBilling(id);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark order ready for billing';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (id: string, paymentData: PaymentData): Promise<Order> => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.processPayment(id, paymentData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async (id: string, reason?: string): Promise<Order> => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrderService.cancelOrder(id, reason);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createOrder,
    updateOrder,
    updateOrderStatus,
    markReadyForBilling,
    processPayment,
    cancelOrder,
    loading,
    error,
    clearError
  };
}

/**
 * Utility functions for order management
 */
export const OrderUtils = {
  /**
   * Get order status color for UI display
   */
  getStatusColor: (status: OrderStatus): string => {
    const statusOptions = OrderService.getOrderStatusOptions();
    return statusOptions.find(option => option.value === status)?.color || 'bg-gray-100 text-gray-800';
  },

  /**
   * Get payment status color for UI display
   */
  getPaymentStatusColor: (status: PaymentStatus): string => {
    const statusOptions = OrderService.getPaymentStatusOptions();
    return statusOptions.find(option => option.value === status)?.color || 'bg-gray-100 text-gray-800';
  },

  /**
   * Format currency for display
   */
  formatCurrency: OrderService.formatCurrency,

  /**
   * Calculate order metrics
   */
  calculateMetrics: OrderService.calculateOrderMetrics,

  /**
   * Get all status options
   */
  getOrderStatusOptions: OrderService.getOrderStatusOptions,
  getPaymentStatusOptions: OrderService.getPaymentStatusOptions
};
