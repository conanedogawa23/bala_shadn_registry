import { logger } from '../utils/logger';
import { BaseApiService } from './baseApiService';

// Payment Enums (matching backend)
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  PARTIAL = 'partial',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  WRITEOFF = 'writeoff'
}

export enum PaymentType {
  POP = 'POP',                    // Patient Out of Pocket
  POPFP = 'POPFP',               // Patient Out of Pocket - Final Payment
  DPA = 'DPA',                   // Direct Payment Authorization
  DPAFP = 'DPAFP',               // DPA Final Payment
  COB_1 = 'COB_1',               // Coordination of Benefits - Primary
  COB_2 = 'COB_2',               // Coordination of Benefits - Secondary
  COB_3 = 'COB_3',               // Coordination of Benefits - Tertiary
  INSURANCE_1ST = 'INSURANCE_1ST', // 1st Insurance Payment
  INSURANCE_2ND = 'INSURANCE_2ND', // 2nd Insurance Payment
  INSURANCE_3RD = 'INSURANCE_3RD', // 3rd Insurance Payment
  SALES_REFUND = 'SALES_REFUND',   // Sales Refund
  WRITEOFF = 'WRITEOFF',           // Write-off Amount
  NO_INSUR_FP = 'NO_INSUR_FP'     // No Insurance Final Payment
}

export enum PaymentMethod {
  CASH = 'Cash',
  CREDIT_CARD = 'Credit Card',
  DEBIT = 'Debit',
  CHEQUE = 'Cheque',
  INSURANCE = 'Insurance',
  BANK_TRANSFER = 'Bank Transfer',
  OTHER = 'Other'
}

// Payment Amount Breakdown Interface
export interface PaymentAmounts {
  totalPaymentAmount: number;
  totalPaid: number;
  totalOwed: number;
  
  // Canadian Healthcare Payment Types
  popAmount: number;
  popfpAmount: number;
  dpaAmount: number;
  dpafpAmount: number;
  
  // Coordination of Benefits
  cob1Amount: number;
  cob2Amount: number;
  cob3Amount: number;
  
  // Insurance Payments
  insurance1stAmount: number;
  insurance2ndAmount: number;
  insurance3rdAmount: number;
  
  // Other Amounts
  refundAmount: number;
  salesRefundAmount: number;
  writeoffAmount: number;
  noInsurFpAmount: number;
  badDebtAmount: number;
}

// Payment Interface - Updated to match MongoDB data structure exactly
export interface Payment {
  _id: string;
  paymentNumber: string;              // Primary payment identifier (auto-generated)
  orderNumber?: string;               // Order reference
  clientId: number;                   // Client ID (number, not string)
  clientName?: string;
  clinicName: string;
  
  // Payment Details
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  status: PaymentStatus;
  
  // Amount Information (nested structure to match backend)
  amounts: PaymentAmounts;
  
  // References and Notes
  referringNo?: string;
  notes?: string;
  
  // Order/Appointment Link
  orderId?: string;
  advancedBillingId?: number;
  
  // Audit Fields
  deletedStatus?: string;
  userLoginName?: string;
  debuggingColumn?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Payment ID field (actual database field)
  paymentId?: string;                 // Primary payment identifier in database
  invoiceNumber?: string;             // Invoice number field
  total?: number;                     // Computed from amounts.totalPaymentAmount
  amountPaid?: number;                // Computed from amounts.totalPaid
  amountDue?: number;                 // Computed from amounts.totalOwed
  
  // Optional invoice-related fields for display
  subtotal?: number;
  invoiceDate?: string;
  dueDate?: string;
  
  // Line Items (optional for invoice display)
  lineItems?: Array<{
    itemId: string;
    description: string;
    serviceDate: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    category: string;
  }>;
  
  // Appointment References
  appointmentIds?: string[];
  
  // Insurance Information
  insurance?: {
    primary?: {
      companyName: string;
      policyNumber: string;
      claimAmount: number;
      coPayAmount: number;
      status: string;
    };
  };
  
  // Client Data (populated by backend for invoice display)
  clientData?: {
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
    email: string;
  } | null;
  
  // Clinic Data (populated by backend for invoice display)
  clinicData?: {
    name: string;
    displayName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
    fax: string;
    logo?: {
      data: string;
      contentType: string;
      filename: string;
    };
  } | null;
}

// API Response Interfaces
export interface PaymentListResponse {
  success: boolean;
  data: Payment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
  message?: string;
}

export interface PaymentStatsResponse {
  success: boolean;
  data: {
    statusStats: Array<{
      _id: PaymentStatus;
      count: number;
      totalAmount: number;
      totalPaid: number;
      totalOwed: number;
    }>;
    methodStats: Array<{
      _id: {
        method: PaymentMethod;
        type: PaymentType;
      };
      count: number;
      totalAmount: number;
    }>;
    totalRevenue: number;
    outstandingPayments: number;
  };
}

export interface RevenueDataResponse {
  success: boolean;
  data: {
    totalRevenue: number;
    startDate?: string;
    endDate?: string;
    clinicName: string;
  };
}

// Payment Filter Options
export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  clinicName?: string;
  clientId?: number;
  orderNumber?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  outstanding?: boolean;
}

// Create Payment Request
export interface CreatePaymentRequest {
  orderNumber?: string;
  clientId: number;
  clientName?: string;
  clinicName: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  amounts: PaymentAmounts;
  orderId?: string;
  notes?: string;
  referringNo?: string;
}

// Update Payment Request
export interface UpdatePaymentRequest {
  orderNumber?: string;
  clientName?: string;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  amounts?: PaymentAmounts;
  notes?: string;
  referringNo?: string;
  status?: PaymentStatus;
}

// Add Payment Amount Request
export interface AddPaymentAmountRequest {
  paymentType: PaymentType;
  amount: number;
}

// Process Refund Request
export interface ProcessRefundRequest {
  amount: number;
  refundType?: PaymentType;
}

export class PaymentApiService extends BaseApiService {
  private static baseUrl = '/payments';

  /**
   * Get all payments with filtering and pagination
   */
  static async getAllPayments(filters: PaymentFilters = {}): Promise<PaymentListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.paymentType) params.append('paymentType', filters.paymentType);
      if (filters.clinicName) params.append('clinicName', filters.clinicName);
      if (filters.clientId) params.append('clientId', filters.clientId.toString());
      if (filters.orderNumber) params.append('orderNumber', filters.orderNumber);
      if (filters.orderId) params.append('orderId', filters.orderId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.outstanding !== undefined) params.append('outstanding', filters.outstanding.toString());

      const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
      const response = await this.request<PaymentListResponse>(url);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch payments');
    } catch (error) {
      throw this.handleError(error, 'getAllPayments');
    }
  }

  /**
   * Get payments by order ID (MongoDB _id)
   */
  static async getPaymentsByOrderId(orderId: string): Promise<PaymentListResponse> {
    try {
      if (!orderId || orderId.trim().length === 0) {
        throw new Error('Order ID is required');
      }

      const response = await this.getAllPayments({ orderId });
      return response;
    } catch (error) {
      logger.error('[getPaymentsByOrderId] Error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch payments for order');
    }
  }

  /**
   * Get payments by order number (for backward compatibility)
   */
  static async getPaymentsByOrder(orderNumber: string): Promise<PaymentListResponse> {
    try {
      if (!orderNumber || orderNumber.trim().length === 0) {
        throw new Error('Order number is required');
      }

      const response = await this.getAllPayments({ orderNumber });
      return response;
    } catch (error) {
      logger.error('[getPaymentsByOrder] Error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch payments for order');
    }
  }

  /**
   * Get payment by ID (accepts both MongoDB _id and paymentNumber)
   */
  static async getPaymentById(id: string): Promise<PaymentResponse> {
    try {
      // Validate ID format
      if (!id || id.trim().length === 0) {
        throw new Error('Payment ID is required');
      }

      const response = await this.request<Payment>(`${this.baseUrl}/${id}`);
      
      if (response.success && response.data) {
        // Transform response data to ensure compatibility
        const payment: Payment = response.data;
        
        // Add computed fields for backward compatibility (these are optional in Payment interface)
        if (payment.amounts) {
          payment.total = payment.amounts.totalPaymentAmount;
          payment.amountPaid = payment.amounts.totalPaid;
          payment.amountDue = payment.amounts.totalOwed;
        }
        
        // Set paymentId and invoiceNumber if not present (these are optional in Payment interface)
        payment.paymentId = payment.paymentId || payment._id;
        payment.invoiceNumber = payment.invoiceNumber || payment.paymentNumber;
        
        return { success: true, data: payment };
      }
      
      throw new Error('Payment not found');
    } catch (error) {
      // Enhanced error handling with more specific messages
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw this.handleError(new Error('Payment not found - the specified payment ID does not exist'), 'getPaymentById');
        } else if (error.message.includes('400')) {
          throw this.handleError(new Error('Invalid payment ID format'), 'getPaymentById');
        } else if (error.message.includes('timeout')) {
          throw this.handleError(new Error('Request timeout - please try again'), 'getPaymentById');
        }
      }
      throw this.handleError(error, 'getPaymentById');
    }
  }

  /**
   * Get payments by clinic name
   */
  static async getPaymentsByClinic(
    clinicName: string, 
    filters: { page?: number; limit?: number; status?: PaymentStatus; outstanding?: boolean } = {}
  ): Promise<PaymentListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.outstanding !== undefined) params.append('outstanding', filters.outstanding.toString());

      const url = params.toString() 
        ? `${this.baseUrl}/clinic/${encodeURIComponent(clinicName)}?${params}`
        : `${this.baseUrl}/clinic/${encodeURIComponent(clinicName)}`;
      
      const response = await this.request<Payment[]>(url);
      
      if (response.success && response.data !== undefined && response.pagination) {
        // Backend returns: { success: true, data: Payment[], pagination: {...} }
        // BaseApiService maps: currentPage->page, totalPages->pages, totalItems->total
        return {
          success: true,
          data: response.data,
          pagination: {
            currentPage: response.pagination.page,
            totalPages: response.pagination.pages,
            totalItems: response.pagination.total,
            itemsPerPage: filters.limit || 10,
            hasNextPage: response.pagination.hasNext,
            hasPrevPage: response.pagination.hasPrev
          }
        };
      }
      
      throw new Error('Failed to fetch clinic payments');
    } catch (error) {
      throw this.handleError(error, 'getPaymentsByClinic');
    }
  }

  /**
   * Get payments by client ID
   */
  static async getPaymentsByClient(clientId: number): Promise<PaymentListResponse> {
    try {
      const response = await this.request<Payment[]>(`${this.baseUrl}/client/${clientId}`);
      
      if (response.success && response.data !== undefined && response.pagination) {
        return {
          success: true,
          data: response.data,
          pagination: {
            currentPage: response.pagination.page,
            totalPages: response.pagination.pages,
            totalItems: response.pagination.total,
            itemsPerPage: 10,
            hasNextPage: response.pagination.hasNext,
            hasPrevPage: response.pagination.hasPrev
          }
        };
      }
      
      throw new Error('Failed to fetch client payments');
    } catch (error) {
      throw this.handleError(error, 'getPaymentsByClient');
    }
  }

  /**
   * Get payment statistics for clinic
   */
  static async getPaymentStats(clinicName: string): Promise<PaymentStatsResponse> {
    try {
      const response = await this.request<PaymentStatsResponse>(`${this.baseUrl}/stats/${encodeURIComponent(clinicName)}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch payment statistics');
    } catch (error) {
      throw this.handleError(error, 'getPaymentStats');
    }
  }

  /**
   * Get outstanding payments for clinic
   */
  static async getOutstandingPayments(
    clinicName: string,
    filters: { page?: number; limit?: number } = {}
  ): Promise<PaymentListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const url = params.toString() 
      ? `${this.baseUrl}/outstanding/${encodeURIComponent(clinicName)}?${params}`
      : `${this.baseUrl}/outstanding/${encodeURIComponent(clinicName)}`;
    
    try {
      const response = await this.request<Payment[]>(url);
      
      if (response.success && response.data !== undefined && response.pagination) {
        return {
          success: true,
          data: response.data,
          pagination: {
            currentPage: response.pagination.page,
            totalPages: response.pagination.pages,
            totalItems: response.pagination.total,
            itemsPerPage: filters.limit || 10,
            hasNextPage: response.pagination.hasNext,
            hasPrevPage: response.pagination.hasPrev
          }
        };
      }
      
      throw new Error('Failed to fetch outstanding payments');
    } catch (error) {
      throw this.handleError(error, 'getOutstandingPayments');
    }
  }

  /**
   * Get revenue data for clinic with date range
   */
  static async getRevenueData(
    clinicName: string,
    startDate?: string,
    endDate?: string
  ): Promise<RevenueDataResponse> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = params.toString() 
      ? `${this.baseUrl}/revenue/${encodeURIComponent(clinicName)}?${params}`
      : `${this.baseUrl}/revenue/${encodeURIComponent(clinicName)}`;
    
    try {
      const response = await this.request<RevenueDataResponse>(url);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch revenue data');
    } catch (error) {
      throw this.handleError(error, 'getRevenueData');
    }
  }

  /**
   * Create new payment
   */
  static async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.request<PaymentResponse>(this.baseUrl, 'POST', paymentData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to create payment');
    } catch (error) {
      throw this.handleError(error, 'createPayment');
    }
  }

  /**
   * Update payment
   */
  static async updatePayment(id: string, paymentData: UpdatePaymentRequest): Promise<PaymentResponse> {
    const response = await this.request<PaymentResponse>(`${this.baseUrl}/${id}`, 'PUT', paymentData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update payment');
  }

  /**
   * Delete payment (soft delete)
   */
  static async deletePayment(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`, 'DELETE');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to delete payment');
  }

  /**
   * Add payment amount to existing payment
   */
  static async addPaymentAmount(id: string, amountData: AddPaymentAmountRequest): Promise<PaymentResponse> {
    const response = await this.request<PaymentResponse>(`${this.baseUrl}/${id}/add-amount`, 'POST', amountData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to add payment amount');
  }

  /**
   * Process payment refund
   */
  static async processRefund(id: string, refundData: ProcessRefundRequest): Promise<PaymentResponse> {
    const response = await this.request<PaymentResponse>(`${this.baseUrl}/${id}/refund`, 'POST', refundData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to process refund');
  }

  // Utility Methods

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format date and time for display
   */
  static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'text-green-600 bg-green-100';
      case PaymentStatus.PENDING:
        return 'text-yellow-600 bg-yellow-100';
      case PaymentStatus.PARTIAL:
        return 'text-blue-600 bg-blue-100';
      case PaymentStatus.FAILED:
        return 'text-red-600 bg-red-100';
      case PaymentStatus.REFUNDED:
        return 'text-purple-600 bg-purple-100';
      case PaymentStatus.WRITEOFF:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get payment type description
   */
  static getPaymentTypeDescription(paymentType: PaymentType): string {
    switch (paymentType) {
      case PaymentType.POP:
        return 'Patient Out of Pocket';
      case PaymentType.POPFP:
        return 'Patient Out of Pocket - Final Payment';
      case PaymentType.DPA:
        return 'Direct Payment Authorization';
      case PaymentType.DPAFP:
        return 'DPA Final Payment';
      case PaymentType.COB_1:
        return 'Coordination of Benefits - Primary';
      case PaymentType.COB_2:
        return 'Coordination of Benefits - Secondary';
      case PaymentType.COB_3:
        return 'Coordination of Benefits - Tertiary';
      case PaymentType.INSURANCE_1ST:
        return '1st Insurance Payment';
      case PaymentType.INSURANCE_2ND:
        return '2nd Insurance Payment';
      case PaymentType.INSURANCE_3RD:
        return '3rd Insurance Payment';
      case PaymentType.SALES_REFUND:
        return 'Sales Refund';
      case PaymentType.WRITEOFF:
        return 'Write-off Amount';
      case PaymentType.NO_INSUR_FP:
        return 'No Insurance Final Payment';
      default:
        return paymentType;
    }
  }

  /**
   * Calculate payment completion percentage
   */
  static getPaymentCompletionPercentage(amounts: PaymentAmounts): number {
    if (amounts.totalPaymentAmount === 0) return 0;
    return Math.round((amounts.totalPaid / amounts.totalPaymentAmount) * 100);
  }

  /**
   * Check if payment is overdue (for pending/partial payments)
   */
  static isPaymentOverdue(payment: Payment, dueDays: number = 30): boolean {
    if (payment.status === PaymentStatus.COMPLETED || payment.status === PaymentStatus.REFUNDED) {
      return false;
    }
    
    const paymentDate = new Date(payment.paymentDate);
    const dueDate = new Date(paymentDate);
    dueDate.setDate(dueDate.getDate() + dueDays);
    
    return new Date() > dueDate;
  }

  /**
   * Export payments to CSV
   */
  static exportToCSV(payments: Payment[], filename: string = 'payments.csv'): void {
    const headers = [
      'Payment Number', 'Client Name', 'Clinic Name', 'Payment Date', 
      'Payment Method', 'Payment Type', 'Status', 'Total Amount', 
      'Total Paid', 'Total Owed', 'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...payments.map(payment => [
        payment.paymentNumber,
        payment.clientName || '',
        payment.clinicName,
        this.formatDate(payment.paymentDate),
        payment.paymentMethod,
        payment.paymentType,
        payment.status,
        payment.amounts.totalPaymentAmount,
        payment.amounts.totalPaid,
        payment.amounts.totalOwed,
        payment.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Clear payment cache
   */
  static clearPaymentCache(): void {
    this.clearCache('/api/v1/payments');
  }

  /**
   * Debug utility: Get all payment IDs for testing
   */
  static async getAllPaymentIds(): Promise<{ _id: string; paymentId?: string; paymentNumber?: string; clientName?: string }[]> {
    try {
      const response = await this.getAllPayments({ limit: 100 });
      return response.data.map(payment => ({
        _id: payment._id,
        paymentId: payment.paymentId || payment.paymentNumber, // Support both fields
        paymentNumber: payment.paymentNumber,
        clientName: payment.clientName
      }));
    } catch (error) {
      logger.error('Error fetching payment IDs:', error);
      return [];
    }
  }

  /**
   * Validate payment ID format
   */
  static isValidPaymentId(id: string): boolean {
    if (!id || id.trim().length === 0) return false;
    
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    
    // Check if it's a valid payment ID format
    // Supports multiple formats:
    // - PAY-XXX-YYYY-XXX (e.g., PAY-001-2025-001) - main format
    // - PAY-XXXXXXXX (8 digits) - legacy format
    // - PAY-YYYY-XXX (year-sequence format) - legacy format
    const paymentIdRegex = /^PAY-\d{3}-\d{4}-\d{3}$/; // Main format: PAY-001-2025-001
    const paymentLegacyRegex = /^PAY-[\d-]+$/; // Legacy formats
    
    return mongoIdRegex.test(id) || paymentIdRegex.test(id) || paymentLegacyRegex.test(id);
  }
}

// Export utility functions for convenience
export const formatCurrency = PaymentApiService.formatCurrency;
export const formatDate = PaymentApiService.formatDate;
export const formatDateTime = PaymentApiService.formatDateTime;
export const getStatusColor = PaymentApiService.getStatusColor;
export const getPaymentTypeDescription = PaymentApiService.getPaymentTypeDescription;
