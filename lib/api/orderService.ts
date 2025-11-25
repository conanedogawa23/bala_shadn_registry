import { BaseApiService } from './baseApiService';

// Order Enums matching backend
export enum OrderStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded'
}

// Order Interfaces
export interface OrderLineItem {
  productKey: number;
  productName: string;
  quantity: number;
  duration: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  appointmentId: number;
  clientId: number;
  clientName: string;
  clinicName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  serviceDate: string;
  endDate: string;
  items: OrderLineItem[];
  totalAmount: number;
  billDate?: string;
  readyToBill: boolean;
  invoiceDate?: string;
  location?: string;
  description?: string;
  appointmentStatus: number;
  totalDuration?: number;
  daysSinceService?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  clinicName?: string;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  readyToBill?: boolean;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

export interface RevenueAnalyticsData {
  _id: {
    year: number;
    month: number;
  };
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  completedOrders: number;
  paidOrders: number;
}

export interface RevenueAnalyticsResponse {
  success: boolean;
  data: {
    analytics: RevenueAnalyticsData[];
    summary: {
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
      maxOrderValue: number;
      minOrderValue: number;
      uniqueClientCount: number;
    };
    dateRange: {
      start: string;
      end: string;
    };
    matchingOrdersCount: number;
  };
}

export interface ProductPerformanceData {
  _id: number;
  productName: string;
  totalOrders: number;
  totalRevenue: number;
  avgPrice: number;
  totalDuration: number;
}

export interface ProductPerformanceResponse {
  success: boolean;
  data: {
    performance: ProductPerformanceData[];
    summary: {
      uniqueProductCount: number;
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
    };
    dateRange: {
      start: string;
      end: string;
    };
    matchingOrdersCount: number;
  };
}

export interface CreateOrderData {
  clientId: number;
  clientName: string;
  clinicName: string;
  serviceDate: string;
  endDate?: string;
  items: Partial<OrderLineItem>[];
  location?: string;
  description?: string;
}

export interface PaymentData {
  amount: number;
  paymentDate?: string;
}

/**
 * OrderService - Comprehensive order lifecycle management API service
 * Extends BaseApiService for consistent error handling and caching
 */
export class OrderService extends BaseApiService {
  private static readonly ENDPOINT = '/orders';
  private static readonly CACHE_TTL = 180000; // 3 minutes (orders change frequently)

  /**
   * Get all orders with comprehensive filtering and pagination
   * Optimized for performance with caching and efficient queries
   */
  static async getOrders(query: OrderQuery = {}): Promise<OrdersResponse> {
    const queryString = this.buildQuery(query);
    const cacheKey = `orders_${queryString}`;
    const cached = this.getCached<OrdersResponse>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = queryString ? `${this.ENDPOINT}?${queryString}` : this.ENDPOINT;
      const response = await this.request<OrdersResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch orders');
    } catch (error) {
      throw this.handleError(error, 'getOrders');
    }
  }

  /**
   * Get order by ID or Order Number
   * Supports both MongoDB ObjectId and Order Number lookup
   */
  static async getOrderById(id: string): Promise<OrderResponse> {
    const cacheKey = `order_${id}`;
    const cached = this.getCached<OrderResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.request<OrderResponse>(`${this.ENDPOINT}/${id}`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch order');
    } catch (error) {
      throw this.handleError(error, 'getOrderById');
    }
  }

  /**
   * Search orders by order number
   * Used for searching orders by order ID/number in the payment form
   */
  static async searchOrders(
    searchTerm: string, 
    clinicName?: string, 
    limit: number = 20
  ): Promise<Order[]> {
    try {
      const query: OrderQuery = {
        search: searchTerm,
        limit
      };
      
      if (clinicName) {
        query.clinicName = clinicName;
      }

      const queryString = this.buildQuery(query);
      const endpoint = queryString ? `${this.ENDPOINT}?${queryString}` : this.ENDPOINT;
      const response = await this.request<OrdersResponse>(endpoint);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw this.handleError(error, 'searchOrders');
    }
  }

  /**
   * Get orders by client ID
   * Client order history for appointment tracking
   */
  static async getOrdersByClient(clientId: number, limit: number = 50): Promise<OrdersResponse> {
    const cacheKey = `orders_client_${clientId}_${limit}`;
    const cached = this.getCached<OrdersResponse>(cacheKey);
    if (cached) return cached;

    try {
      const queryString = this.buildQuery({ limit });
      const endpoint = `${this.ENDPOINT}/client/${clientId}?${queryString}`;
      const response = await this.request<OrdersResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch client orders');
    } catch (error) {
      throw this.handleError(error, 'getOrdersByClient');
    }
  }

  /**
   * Get orders by clinic with date range filtering
   * Clinic-specific order management with date filtering
   */
  static async getOrdersByClinic(
    clinicName: string, 
    query: Omit<OrderQuery, 'clinicName'> = {}
  ): Promise<OrdersResponse> {
    const queryString = this.buildQuery(query);
    const cacheKey = `orders_clinic_${clinicName}_${queryString}`;
    const cached = this.getCached<OrdersResponse>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = queryString 
        ? `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}?${queryString}`
        : `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}`;
      
      const response = await this.request<OrdersResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch clinic orders');
    } catch (error) {
      throw this.handleError(error, 'getOrdersByClinic');
    }
  }

  /**
   * Get orders ready for billing
   * Billing workflow management
   */
  static async getOrdersReadyForBilling(clinicName?: string): Promise<OrdersResponse> {
    const cacheKey = `orders_billing_ready_${clinicName || 'all'}`;
    const cached = this.getCached<OrdersResponse>(cacheKey);
    if (cached) return cached;

    try {
      const queryString = clinicName ? this.buildQuery({ clinicName }) : '';
      const endpoint = queryString 
        ? `${this.ENDPOINT}/billing/ready?${queryString}`
        : `${this.ENDPOINT}/billing/ready`;
      
      const response = await this.request<OrdersResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, 60000); // 1 minute cache for billing data
        return response;
      }
      
      throw new Error('Failed to fetch orders ready for billing');
    } catch (error) {
      throw this.handleError(error, 'getOrdersReadyForBilling');
    }
  }

  /**
   * Get overdue orders
   * Financial management and follow-up tracking
   */
  static async getOverdueOrders(daysOverdue: number = 30): Promise<OrdersResponse> {
    const cacheKey = `orders_overdue_${daysOverdue}`;
    const cached = this.getCached<OrdersResponse>(cacheKey);
    if (cached) return cached;

    try {
      const queryString = this.buildQuery({ daysOverdue });
      const response = await this.request<OrdersResponse>(`${this.ENDPOINT}/billing/overdue?${queryString}`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, this.CACHE_TTL);
        return response;
      }
      
      throw new Error('Failed to fetch overdue orders');
    } catch (error) {
      throw this.handleError(error, 'getOverdueOrders');
    }
  }

  /**
   * Create new order
   * Order creation with product validation and pricing
   */
  static async createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
    try {
      const response = await this.request<OrderResponse>(
        this.ENDPOINT,
        'POST',
        orderData
      );
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache('orders_');
        return response;
      }
      
      throw new Error('Failed to create order');
    } catch (error) {
      throw this.handleError(error, 'createOrder');
    }
  }

  /**
   * Update existing order
   * Order modification with validation
   */
  static async updateOrder(id: string, updateData: Partial<Order>): Promise<OrderResponse> {
    try {
      const response = await this.request<OrderResponse>(
        `${this.ENDPOINT}/${id}`,
        'PUT',
        updateData
      );
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache('orders_');
        this.clearCache(`order_${id}`);
        return response;
      }
      
      throw new Error('Failed to update order');
    } catch (error) {
      throw this.handleError(error, 'updateOrder');
    }
  }

  /**
   * Update order status with business rule validation
   * Status lifecycle management
   */
  static async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderResponse> {
    try {
      const response = await this.request<OrderResponse>(
        `${this.ENDPOINT}/${id}/status`,
        'PUT',
        { status }
      );
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache('orders_');
        this.clearCache(`order_${id}`);
        return response;
      }
      
      throw new Error('Failed to update order status');
    } catch (error) {
      throw this.handleError(error, 'updateOrderStatus');
    }
  }

  /**
   * Mark order ready for billing
   * Billing workflow initiation
   */
  static async markReadyForBilling(id: string): Promise<OrderResponse> {
    try {
      const response = await this.request<OrderResponse>(
        `${this.ENDPOINT}/${id}/billing/ready`,
        'PUT'
      );
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache('orders_');
        this.clearCache(`order_${id}`);
        this.clearCache('orders_billing_ready');
        return response;
      }
      
      throw new Error('Failed to mark order ready for billing');
    } catch (error) {
      throw this.handleError(error, 'markReadyForBilling');
    }
  }

  /**
   * Process payment for order
   * Payment processing and status updates
   */
  static async processPayment(id: string, paymentData: PaymentData): Promise<OrderResponse> {
    try {
      const response = await this.request<OrderResponse>(
        `${this.ENDPOINT}/${id}/payment`,
        'POST',
        paymentData
      );
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache('orders_');
        this.clearCache(`order_${id}`);
        this.clearCache('orders_billing_ready');
        this.clearCache('orders_overdue');
        return response;
      }
      
      throw new Error('Failed to process payment');
    } catch (error) {
      throw this.handleError(error, 'processPayment');
    }
  }

  /**
   * Cancel order with reason
   * Order cancellation with audit trail
   */
  static async cancelOrder(id: string, reason?: string): Promise<OrderResponse> {
    try {
      const response = await this.request<OrderResponse>(
        `${this.ENDPOINT}/${id}/cancel`,
        'PUT',
        { reason }
      );
      
      if (response.success && response.data) {
        // Clear related caches
        this.clearCache('orders_');
        this.clearCache(`order_${id}`);
        return response;
      }
      
      throw new Error('Failed to cancel order');
    } catch (error) {
      throw this.handleError(error, 'cancelOrder');
    }
  }

  /**
   * Get revenue analytics for clinic
   * Business intelligence and financial reporting
   */
  static async getRevenueAnalytics(
    clinicName: string,
    startDate?: string,
    endDate?: string
  ): Promise<RevenueAnalyticsResponse> {
    const cacheKey = `revenue_analytics_${clinicName}_${startDate || 'all'}_${endDate || 'all'}`;
    const cached = this.getCached<RevenueAnalyticsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const queryString = this.buildQuery({ clinicName, startDate, endDate });
      const response = await this.request<RevenueAnalyticsResponse>(`${this.ENDPOINT}/analytics/revenue?${queryString}`);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, 600000); // 10 minutes cache for analytics
        return response;
      }
      
      throw new Error('Failed to fetch revenue analytics');
    } catch (error) {
      throw this.handleError(error, 'getRevenueAnalytics');
    }
  }

  /**
   * Get product performance analytics
   * Product-specific business intelligence
   */
  static async getProductPerformance(
    startDate?: string,
    endDate?: string,
    clinicName?: string
  ): Promise<ProductPerformanceResponse> {
    const cacheKey = `product_performance_${clinicName || 'all'}_${startDate || 'all'}_${endDate || 'all'}`;
    const cached = this.getCached<ProductPerformanceResponse>(cacheKey);
    if (cached) return cached;

    try {
      const queryString = this.buildQuery({ startDate, endDate, clinicName });
      const endpoint = queryString 
        ? `${this.ENDPOINT}/analytics/products?${queryString}`
        : `${this.ENDPOINT}/analytics/products`;
      
      const response = await this.request<ProductPerformanceResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response, 600000); // 10 minutes cache for analytics
        return response;
      }
      
      throw new Error('Failed to fetch product performance');
    } catch (error) {
      throw this.handleError(error, 'getProductPerformance');
    }
  }

  /**
   * Get order status options
   * UI utility for status selection
   */
  static getOrderStatusOptions(): Array<{ value: OrderStatus; label: string; color: string }> {
    return [
      { value: OrderStatus.SCHEDULED, label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
      { value: OrderStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
      { value: OrderStatus.COMPLETED, label: 'Completed', color: 'bg-green-100 text-green-800' },
      { value: OrderStatus.CANCELLED, label: 'Cancelled', color: 'bg-red-100 text-red-800' },
      { value: OrderStatus.NO_SHOW, label: 'No Show', color: 'bg-gray-100 text-gray-800' }
    ];
  }

  /**
   * Get payment status options
   * UI utility for payment status selection
   */
  static getPaymentStatusOptions(): Array<{ value: PaymentStatus; label: string; color: string }> {
    return [
      { value: PaymentStatus.PENDING, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      { value: PaymentStatus.PARTIAL, label: 'Partial', color: 'bg-orange-100 text-orange-800' },
      { value: PaymentStatus.PAID, label: 'Paid', color: 'bg-green-100 text-green-800' },
      { value: PaymentStatus.OVERDUE, label: 'Overdue', color: 'bg-red-100 text-red-800' },
      { value: PaymentStatus.REFUNDED, label: 'Refunded', color: 'bg-blue-100 text-blue-800' }
    ];
  }

  /**
   * Format currency for display
   * UI utility for consistent currency formatting
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  }

  /**
   * Calculate order metrics
   * Business logic for order calculations
   */
  static calculateOrderMetrics(orders: Order[]) {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const completedOrders = orders.filter(order => order.status === OrderStatus.COMPLETED).length;
    const paidOrders = orders.filter(order => order.paymentStatus === PaymentStatus.PAID).length;
    
    return {
      totalOrders: orders.length,
      totalRevenue,
      avgOrderValue,
      completedOrders,
      paidOrders,
      completionRate: orders.length > 0 ? (completedOrders / orders.length) * 100 : 0,
      paymentRate: orders.length > 0 ? (paidOrders / orders.length) * 100 : 0
    };
  }

  /**
   * Clear order-related caches
   * Utility for cache management
   */
  static clearOrderCache(): void {
    this.clearCache('orders_');
    this.clearCache('order_');
    this.clearCache('revenue_analytics_');
    this.clearCache('product_performance_');
  }
}
