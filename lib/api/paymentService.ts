import { BaseApiService } from './baseApiService';
import type { Payment, PaymentLineItem } from '../data/mockDataService';

type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded' | 'partial';
type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'cheque' | 'bank_transfer' | 'insurance_primary' | 'insurance_secondary';

interface PaymentQueryOptions {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

interface CreatePaymentRequest {
  clientId: string;
  clientKey?: number;
  clinicName: string;
  appointmentIds: string[];
  lineItems: Array<{
    serviceCode: string;
    serviceName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  invoiceDate?: Date;
  dueDate?: Date;
  referringMD?: string;
  dispensedBy?: string;
  dispensedDate?: Date;
  notes?: string;
  insurance?: {
    primary?: {
      companyName: string;
      policyNumber: string;
      groupNumber?: string;
      claimNumber?: string;
      authorizationNumber?: string;
      amountCovered: number;
      amountPaid: number;
    };
    secondary?: {
      companyName: string;
      policyNumber: string;
      groupNumber?: string;
      claimNumber?: string;
      authorizationNumber?: string;
      amountCovered: number;
      amountPaid: number;
    };
  };
}

interface UpdatePaymentRequest extends Partial<CreatePaymentRequest> {
  amountPaid?: number;
  status?: PaymentStatus;
}

interface PaginatedPaymentResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface InvoiceDataResponse {
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
  };
  payment: Payment;
  client: {
    name: string;
    address: any;
    birthday: any;
    cellphone?: any;
    homePhone?: any;
    email?: string;
    company?: string;
    referringMD?: string;
    gender: string;
  };
  clinic: any;
  insurance: {
    primary?: any;
    secondary?: any;
  };
  lineItems: PaymentLineItem[];
  financials: {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    amountPaid: number;
    amountDue: number;
  };
}

interface PaymentStatsResponse {
  totalPayments: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  averagePayment: number;
  statusDistribution: Record<PaymentStatus, number>;
  methodDistribution: Record<PaymentMethod, number>;
}

interface PaymentSummaryResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  totals: {
    payments: number;
    revenue: number;
    outstanding: number;
    refunds: number;
  };
  breakdown: {
    byStatus: Record<PaymentStatus, { count: number; amount: number }>;
    byMethod: Record<PaymentMethod, { count: number; amount: number }>;
    byDay: Array<{ date: string; amount: number; count: number }>;
  };
}

export class PaymentApiService extends BaseApiService {
  private static readonly ENDPOINT = '/payments';
  private static readonly CACHE_TTL = 300000; // 5 minutes

  /**
   * Get payments by clinic with frontend-compatible format
   */
  static async getPaymentsByClinic(
    clinicName: string,
    options: PaymentQueryOptions = {}
  ): Promise<PaginatedPaymentResponse> {
    const cacheKey = `payments_${clinicName}_${JSON.stringify(options)}`;
    const cached = this.getCached<PaginatedPaymentResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        page: options.page || 1,
        limit: options.limit || 20,
        status: options.status,
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString(),
        search: options.search
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/clinic/${encodeURIComponent(clinicName)}/frontend-compatible${queryString}`;
      
      const response = await this.request<PaginatedPaymentResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw this.handleError(error, 'getPaymentsByClinic');
    }
  }

  /**
   * Get payment by ID with frontend-compatible format
   */
  static async getPaymentById(paymentId: string): Promise<Payment> {
    const cacheKey = `payment_${paymentId}`;
    const cached = this.getCached<Payment>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(paymentId)}/frontend-compatible`;
      const response = await this.request<Payment>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Payment not found');
    } catch (error) {
      throw this.handleError(error, 'getPaymentById');
    }
  }

  /**
   * Create new payment
   */
  static async createPayment(paymentData: CreatePaymentRequest): Promise<Payment> {
    try {
      const response = await this.request<Payment>(
        this.ENDPOINT,
        'POST',
        {
          ...paymentData,
          paymentDate: paymentData.paymentDate.toISOString(),
          invoiceDate: paymentData.invoiceDate?.toISOString(),
          dueDate: paymentData.dueDate?.toISOString(),
          dispensedDate: paymentData.dispensedDate?.toISOString()
        }
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('payments_');
        return response.data;
      }
      
      throw new Error('Failed to create payment');
    } catch (error) {
      throw this.handleError(error, 'createPayment');
    }
  }

  /**
   * Update existing payment
   */
  static async updatePayment(paymentId: string, updates: UpdatePaymentRequest): Promise<Payment> {
    try {
      const processedUpdates = {
        ...updates,
        paymentDate: updates.paymentDate?.toISOString(),
        invoiceDate: updates.invoiceDate?.toISOString(),
        dueDate: updates.dueDate?.toISOString(),
        dispensedDate: updates.dispensedDate?.toISOString()
      };

      const response = await this.request<Payment>(
        `${this.ENDPOINT}/${encodeURIComponent(paymentId)}`,
        'PUT',
        processedUpdates
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('payments_');
        this.clearCache(`payment_${paymentId}`);
        return response.data;
      }
      
      throw new Error('Failed to update payment');
    } catch (error) {
      throw this.handleError(error, 'updatePayment');
    }
  }

  /**
   * Process payment refund
   */
  static async processRefund(paymentId: string, refundData: {
    refundAmount: number;
    reason: string;
    refundMethod?: PaymentMethod;
  }): Promise<Payment> {
    try {
      const response = await this.request<Payment>(
        `${this.ENDPOINT}/${encodeURIComponent(paymentId)}/refund`,
        'POST',
        refundData
      );
      
      if (response.success && response.data) {
        // Clear related cache entries
        this.clearCache('payments_');
        this.clearCache(`payment_${paymentId}`);
        return response.data;
      }
      
      throw new Error('Failed to process refund');
    } catch (error) {
      throw this.handleError(error, 'processRefund');
    }
  }

  /**
   * Get payments by client
   */
  static async getPaymentsByClient(clientId: string): Promise<Payment[]> {
    const cacheKey = `payments_client_${clientId}`;
    const cached = this.getCached<Payment[]>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/client/${encodeURIComponent(clientId)}`;
      const response = await this.request<Payment[]>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw this.handleError(error, 'getPaymentsByClient');
    }
  }

  /**
   * Generate invoice data for payment
   */
  static async generateInvoiceData(paymentId: string): Promise<InvoiceDataResponse> {
    const cacheKey = `invoice_${paymentId}`;
    const cached = this.getCached<InvoiceDataResponse>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(paymentId)}/invoice`;
      const response = await this.request<InvoiceDataResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to generate invoice data');
    } catch (error) {
      throw this.handleError(error, 'generateInvoiceData');
    }
  }

  /**
   * Get payments ready for invoicing
   */
  static async getPaymentsReadyForInvoice(clinicName?: string): Promise<Payment[]> {
    const cacheKey = `payments_ready_invoice_${clinicName || 'all'}`;
    const cached = this.getCached<Payment[]>(cacheKey);
    if (cached) return cached;

    try {
      const query = clinicName ? this.buildQuery({ clinicName }) : '';
      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/ready-for-invoice${queryString}`;
      
      const response = await this.request<Payment[]>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw this.handleError(error, 'getPaymentsReadyForInvoice');
    }
  }

  /**
   * Get payment summary report by date range
   */
  static async getPaymentSummaryByDateRange(
    startDate: Date,
    endDate: Date,
    clinicName?: string
  ): Promise<PaymentSummaryResponse> {
    const cacheKey = `payment_summary_${startDate.toISOString()}_${endDate.toISOString()}_${clinicName || 'all'}`;
    const cached = this.getCached<PaymentSummaryResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        clinicName
      });

      const endpoint = `${this.ENDPOINT}/reports/summary?${query}`;
      const response = await this.request<PaymentSummaryResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch payment summary');
    } catch (error) {
      throw this.handleError(error, 'getPaymentSummaryByDateRange');
    }
  }

  /**
   * Get Co-Pay summary report (renamed from Sales Refund per CSV)
   */
  static async getCoPaySummary(clinicName?: string): Promise<any> {
    const cacheKey = `copay_summary_${clinicName || 'all'}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    try {
      const query = clinicName ? this.buildQuery({ clinicName }) : '';
      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/reports/co-pay-summary${queryString}`;
      
      const response = await this.request<any>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch co-pay summary');
    } catch (error) {
      throw this.handleError(error, 'getCoPaySummary');
    }
  }

  /**
   * Get Marketing Budget summary (renamed from Shoe Allowance per CSV)
   */
  static async getMarketingBudgetSummary(clinicName?: string): Promise<any> {
    const cacheKey = `marketing_budget_${clinicName || 'all'}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    try {
      const query = clinicName ? this.buildQuery({ clinicName }) : '';
      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/reports/marketing-budget-summary${queryString}`;
      
      const response = await this.request<any>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch marketing budget summary');
    } catch (error) {
      throw this.handleError(error, 'getMarketingBudgetSummary');
    }
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(clinicName?: string): Promise<PaymentStatsResponse> {
    const cacheKey = `payment_stats_${clinicName || 'all'}`;
    const cached = this.getCached<PaymentStatsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const query = clinicName ? this.buildQuery({ clinicName }) : '';
      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/stats${queryString}`;
      
      const response = await this.request<PaymentStatsResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch payment statistics');
    } catch (error) {
      throw this.handleError(error, 'getPaymentStats');
    }
  }

  /**
   * Search payments by various criteria
   */
  static async searchPayments(searchTerm: string, options: {
    clinicName?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    limit?: number;
  } = {}): Promise<Payment[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const cacheKey = `payment_search_${searchTerm}_${JSON.stringify(options)}`;
    const cached = this.getCached<Payment[]>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        q: searchTerm.trim(),
        clinicName: options.clinicName,
        status: options.status,
        method: options.method,
        limit: options.limit || 20
      });

      const endpoint = `${this.ENDPOINT}/search?${query}`;
      const response = await this.request<Payment[]>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, 60000); // 1 minute cache for searches
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw this.handleError(error, 'searchPayments');
    }
  }

  /**
   * Bulk operations on payments
   */
  static async bulkOperations(operation: string, paymentIds: string[], data?: any): Promise<any> {
    try {
      const response = await this.request(
        `${this.ENDPOINT}/bulk`,
        'POST',
        {
          operation,
          paymentIds,
          data
        }
      );
      
      if (response.success) {
        // Clear related cache entries
        this.clearCache('payments_');
        return response.data;
      }
      
      throw new Error('Failed to perform bulk operation');
    } catch (error) {
      throw this.handleError(error, 'bulkOperations');
    }
  }

  /**
   * Utility: Clear all payment-related cache
   */
  static clearPaymentCache(): void {
    this.clearCache('payments_');
    this.clearCache('payment_');
    this.clearCache('invoice_');
    this.clearCache('copay_summary_');
    this.clearCache('marketing_budget_');
    this.clearCache('payment_stats_');
    this.clearCache('payment_search_');
  }
}

/**
 * Legacy export for backwards compatibility
 * @deprecated Use PaymentApiService instead
 */
export const PaymentService = PaymentApiService;
