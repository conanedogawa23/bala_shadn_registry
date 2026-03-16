import { logger } from '../utils/logger';
import { BaseApiService } from './baseApiService';

// Report data interfaces
export interface AccountSummaryData {
  clinicName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalClients: number;
    averageOrderValue: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
  };
  topServices: Array<{
    productKey: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  revenueBreakdown: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
}

export interface PaymentSummaryData {
  clinicName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalPayments: number;
    totalAmount: number;
    averagePayment: number;
    completedPayments: number;
    pendingPayments: number;
    refundedPayments: number;
  };
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  dailyPayments: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

export interface UserSessionData {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  lastLogin: string | null;
  lastActivity: string | null;
  totalSessions: number;
  activeSessions: number;
  sessions: Array<{
    deviceId: string;
    ipAddress: string;
    userAgent: string;
    lastActivity: string;
    isActive: boolean;
  }>;
}

export interface TimesheetData {
  clinicName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  practitioners: Array<{
    resourceId: number;
    resourceName: string;
    totalHours: number;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    averageAppointmentDuration: number;
    revenue: number;
    utilization: number;
  }>;
  userActivity: Array<UserSessionData>;
  summary: {
    totalHours: number;
    totalRevenue: number;
    averageUtilization: number;
    totalActiveUsers: number;
    totalLoginSessions: number;
  };
}

export interface OrderStatusData {
  clinicName: string;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
    totalValue: number;
  }>;
  recentOrders: Array<{
    orderId: string;
    orderNumber: string;
    clientName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
  summary: {
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
  };
}

export interface CoPaySummaryData {
  clinicName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalCoPayments: number;
    totalCoPayAmount: number;
    averageCoPayment: number;
    insurance1CoPayments: number;
    insurance2CoPayments: number;
  };
  coPayBreakdown: Array<{
    insuranceType: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export interface MarketingBudgetData {
  clinicName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSpent: number;
    totalROI: number;
    conversionRate: number;
    costPerAcquisition: number;
  };
  campaigns: Array<{
    campaignName: string;
    spent: number;
    revenue: number;
    roi: number;
    conversions: number;
  }>;
  channels: Array<{
    channel: string;
    spent: number;
    clients: number;
    revenue: number;
    roi: number;
  }>;
}

export interface AvailableReport {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
}

export interface AvailableReportsResponse {
  clinicName: string;
  reports: AvailableReport[];
  categories: string[];
}

export interface ClientStatisticsData {
  totalClients: number;
  newClientsThisMonth: number;
  activeClients: number;
}

// Query options interface
export interface ReportQueryOptions {
  startDate?: Date;
  endDate?: Date;
  variant?: string;
}

type ReportRow = Record<string, unknown>;

interface ReportData {
  clinicName?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  summary?: Record<string, unknown>;
  topServices?: Array<{
    productKey?: string | number;
    productName?: string;
    quantity?: number;
    revenue?: number;
  }>;
  revenueBreakdown?: Array<{
    date?: string;
    revenue?: number;
    orderCount?: number;
  }>;
  paymentMethods?: Array<{
    method?: string;
    count?: number;
    amount?: number;
    percentage?: number;
  }>;
  dailyPayments?: Array<{
    date?: string;
    amount?: number;
    count?: number;
  }>;
  practitioners?: Array<{
    resourceId?: number;
    resourceName?: string;
    totalHours?: number;
    totalAppointments?: number;
    completedAppointments?: number;
    cancelledAppointments?: number;
    averageAppointmentDuration?: number;
    revenue?: number;
    utilization?: number;
  }>;
  userActivity?: Array<{
    userId?: string;
    username?: string;
    fullName?: string;
    role?: string;
    lastLogin?: string | null;
    lastActivity?: string | null;
    totalSessions?: number;
    activeSessions?: number;
    sessions?: Array<{
      deviceId?: string;
      ipAddress?: string;
      userAgent?: string;
      lastActivity?: string;
      isActive?: boolean;
    }>;
  }>;
  statusBreakdown?: Array<{
    status?: string;
    count?: number;
    percentage?: number;
    totalValue?: number;
  }>;
  recentOrders?: Array<{
    orderId?: string;
    orderNumber?: string;
    clientName?: string;
    status?: string;
    totalAmount?: number;
    createdAt?: string;
  }>;
  coPayBreakdown?: Array<{
    insuranceType?: string;
    count?: number;
    amount?: number;
    percentage?: number;
  }>;
  monthlyTrends?: Array<{
    month?: string;
    amount?: number;
    count?: number;
  }>;
  campaigns?: Array<{
    campaignName?: string;
    spent?: number;
    revenue?: number;
    roi?: number;
    conversions?: number;
  }>;
  channels?: Array<{
    channel?: string;
    spent?: number;
    clients?: number;
    revenue?: number;
    roi?: number;
  }>;
  [key: string]: unknown;
}

interface ReportApiResponse {
  data?: ReportData;
  [key: string]: unknown;
}

export class ReportApiService extends BaseApiService {
  private static readonly ENDPOINT = '/reports';
  private static readonly CACHE_TTL = 300000; // 5 minutes cache for reports

  /**
   * Get client statistics using backend aggregation
   */
  static async getClientStatistics(clinicName: string): Promise<ClientStatisticsData> {
    const cacheKey = `client_stats_${clinicName}`;
    const cached = this.getCached<ClientStatisticsData>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(clinicName)}/client-statistics`;
      const response = await this.request<ClientStatisticsData>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch client statistics');
    } catch (error) {
      throw this.handleError(error, 'getClientStatistics');
    }
  }

  /**
   * Get all available reports for a clinic
   */
  static async getAvailableReports(clinicName: string): Promise<AvailableReportsResponse> {
    const cacheKey = `available_reports_${clinicName}`;
    const cached = this.getCached<AvailableReportsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(clinicName)}/available`;
      const response = await this.request<AvailableReportsResponse>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch available reports');
    } catch (error) {
      throw this.handleError(error, 'getAvailableReports');
    }
  }

  /**
   * Get Account Summary Report
   */
  static async getAccountSummary(
    clinicName: string, 
    options: ReportQueryOptions = {}
  ): Promise<AccountSummaryData> {
    const cacheKey = `account_summary_${clinicName}_${JSON.stringify(options)}`;
    const cached = this.getCached<AccountSummaryData>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString(),
        variant: options.variant
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(clinicName)}/account-summary${queryString}`;
      
      const response = await this.request<AccountSummaryData>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch account summary report');
    } catch (error) {
      throw this.handleError(error, 'getAccountSummary');
    }
  }

  /**
   * Get Payment Summary Report
   */
  static async getPaymentSummary(
    clinicName: string, 
    options: ReportQueryOptions = {}
  ): Promise<PaymentSummaryData> {
    const cacheKey = `payment_summary_${clinicName}_${JSON.stringify(options)}`;
    const cached = this.getCached<PaymentSummaryData>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString()
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(clinicName)}/payment-summary${queryString}`;
      
      const response = await this.request<PaymentSummaryData>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch payment summary report');
    } catch (error) {
      throw this.handleError(error, 'getPaymentSummary');
    }
  }

  /**
   * Get Timesheet Report
   */
  static async getTimesheetReport(
    clinicName: string, 
    options: ReportQueryOptions = {}
  ): Promise<TimesheetData> {
    const cacheKey = `timesheet_${clinicName}_${JSON.stringify(options)}`;
    const cached = this.getCached<TimesheetData>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString()
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(clinicName)}/timesheet${queryString}`;
      
      const response = await this.request<TimesheetData>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch timesheet report');
    } catch (error) {
      throw this.handleError(error, 'getTimesheetReport');
    }
  }

  /**
   * Get Order Status Report
   */
  static async getOrderStatusReport(clinicName: string): Promise<OrderStatusData> {
    const cacheKey = `order_status_${clinicName}`;
    const cached = this.getCached<OrderStatusData>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(clinicName)}/order-status`;
      const response = await this.request<OrderStatusData>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch order status report');
    } catch (error) {
      throw this.handleError(error, 'getOrderStatusReport');
    }
  }

  /**
   * Get Co-Pay Summary Report
   */
  static async getCoPaySummary(
    clinicName: string, 
    options: ReportQueryOptions = {}
  ): Promise<CoPaySummaryData> {
    const cacheKey = `copay_summary_${clinicName}_${JSON.stringify(options)}`;
    const cached = this.getCached<CoPaySummaryData>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString()
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(clinicName)}/copay-summary${queryString}`;
      
      const response = await this.request<CoPaySummaryData>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch co-pay summary report');
    } catch (error) {
      throw this.handleError(error, 'getCoPaySummary');
    }
  }

  /**
   * Get Marketing Budget Summary Report
   */
  static async getMarketingBudgetSummary(
    clinicName: string, 
    options: ReportQueryOptions = {}
  ): Promise<MarketingBudgetData> {
    const cacheKey = `marketing_budget_${clinicName}_${JSON.stringify(options)}`;
    const cached = this.getCached<MarketingBudgetData>(cacheKey);
    if (cached) return cached;

    try {
      const query = this.buildQuery({
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString()
      });

      const queryString = query ? `?${query}` : '';
      const endpoint = `${this.ENDPOINT}/${encodeURIComponent(clinicName)}/marketing-budget${queryString}`;
      
      const response = await this.request<MarketingBudgetData>(endpoint);
      
      if (response.success && response.data) {
        this.setCached(cacheKey, response.data, this.CACHE_TTL);
        return response.data;
      }
      
      throw new Error('Failed to fetch marketing budget summary report');
    } catch (error) {
      throw this.handleError(error, 'getMarketingBudgetSummary');
    }
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format date for display
   */
  static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-CA');
  }

  /**
   * Calculate growth percentage between two values
   */
  static calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get status color for various report statuses
   */
  static getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      completed: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      cancelled: 'text-red-600 bg-red-100',
      processing: 'text-blue-600 bg-blue-100',
      ready_to_bill: 'text-purple-600 bg-purple-100'
    };
    
    return statusColors[status.toLowerCase()] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Export detailed report data in multiple formats
   * Optimized implementation following Visio Rules
   */
  static async exportReport(
    reportType: string, 
    clinicName: string, 
    format: 'csv' | 'json' | 'pdf' = 'csv',
    options: ReportQueryOptions = {}
  ): Promise<void> {
    const reportData = await this.getDetailedReportData(reportType, clinicName, options);
    const filename = this.generateFilename(reportType, clinicName, format);
    
    switch (format) {
      case 'csv':
        this.exportToCSV(reportData, filename);
        break;
      case 'json':
        this.exportToJSON(reportData, filename);
        break;
      case 'pdf':
        await this.exportToPDF(reportData, filename, reportType);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get detailed report data for export
   * Data-driven approach with comprehensive information
   */
  private static async getDetailedReportData(
    reportType: string, 
    clinicName: string, 
    options: ReportQueryOptions
  ): Promise<ReportApiResponse> {
    const baseUrl = `${this.ENDPOINT}/${encodeURIComponent(clinicName)}`;
    const queryParams = this.buildQueryParams(options);
    
    switch (reportType) {
      case 'account-summary':
        return this.request(`${baseUrl}/account-summary${queryParams}`);
      case 'payment-summary':
        return this.request(`${baseUrl}/payment-summary${queryParams}`);
      case 'timesheet':
        return this.request(`${baseUrl}/timesheet${queryParams}`);
      case 'order-status':
        return this.request(`${baseUrl}/order-status${queryParams}`);
      case 'copay-summary':
        return this.request(`${baseUrl}/copay-summary${queryParams}`);
      case 'marketing-budget':
        return this.request(`${baseUrl}/marketing-budget${queryParams}`);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  /**
   * Enhanced CSV export with detailed data flattening
   */
  private static exportToCSV(reportData: ReportApiResponse, filename: string): void {
    const flattenedData = this.flattenReportData(reportData);
    if (!flattenedData.length) {
      logger.warn('No data available for export');
      return;
    }

    const headers = this.collectHeaders(flattenedData);
    const csvRows = [headers.join(',')];
    
    // Optimized row generation without forEach
    for (let i = 0; i < flattenedData.length; i++) {
      const row = flattenedData[i];
      const csvRow = headers.map(header => {
        const value = row[header];
        return this.escapeCsvValue(value);
      }).join(',');
      csvRows.push(csvRow);
    }

    this.downloadFile(csvRows.join('\n'), `${filename}.csv`, 'text/csv');
  }

  /**
   * Export to JSON format
   */
  private static exportToJSON(reportData: ReportApiResponse, filename: string): void {
    const jsonContent = JSON.stringify(reportData, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  /**
   * Export to PDF format (simplified implementation)
   */
  private static async exportToPDF(reportData: ReportApiResponse, filename: string, reportType: string): Promise<void> {
    // For now, create a formatted HTML content for PDF printing
    const htmlContent = this.generateReportHTML(reportData, reportType);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  /**
   * Generate comprehensive filename
   */
  private static generateFilename(reportType: string, clinicName: string, _format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedClinic = clinicName.replace(/[^a-zA-Z0-9]/g, '_');
    return `${reportType}_${sanitizedClinic}_${timestamp}`;
  }

  /**
   * Build query parameters for API requests
   */
  private static buildQueryParams(options: ReportQueryOptions): string {
    const params = new URLSearchParams();
    
    if (options.startDate) {
      params.append('startDate', options.startDate.toISOString().split('T')[0]);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate.toISOString().split('T')[0]);
    }
    if (options.variant) {
      params.append('variant', options.variant);
    }
    
    return params.toString() ? `?${params.toString()}` : '';
  }

  /**
   * Flatten complex report data for CSV export
   * Handles nested objects and arrays efficiently
   */
  private static flattenReportData(reportData: ReportApiResponse): ReportRow[] {
    const data = reportData.data;
    if (!data) return [];

    const flatData: ReportRow[] = [];
    const dateRange = data.dateRange
      ? `${data.dateRange.startDate} to ${data.dateRange.endDate}`
      : 'All Time';
    
    // Handle different report structures
    if (data.summary && data.topServices) {
      // Account Summary Report
      flatData.push({
        report_type: 'Summary',
        clinic_name: data.clinicName,
        date_range: dateRange,
        ...this.prefixKeys(data.summary, 'summary')
      });
      
      // Add top services data
      for (let i = 0; i < data.topServices.length; i++) {
        const service = data.topServices[i];
        flatData.push({
          report_type: 'Top Service',
          clinic_name: data.clinicName,
          service_name: service.productName,
          service_key: service.productKey,
          quantity: service.quantity,
          revenue: service.revenue
        });
      }

      if (Array.isArray(data.revenueBreakdown)) {
        for (let i = 0; i < data.revenueBreakdown.length; i++) {
          const revenue = data.revenueBreakdown[i];
          flatData.push({
            report_type: 'Revenue Breakdown',
            clinic_name: data.clinicName,
            date_range: dateRange,
            date: revenue.date,
            revenue: revenue.revenue,
            order_count: revenue.orderCount
          });
        }
      }
    } else if (data.summary && data.paymentMethods) {
      flatData.push({
        report_type: 'Summary',
        clinic_name: data.clinicName,
        date_range: dateRange,
        ...this.prefixKeys(data.summary, 'summary')
      });

      for (let i = 0; i < data.paymentMethods.length; i++) {
        const method = data.paymentMethods[i];
        flatData.push({
          report_type: 'Payment Method',
          clinic_name: data.clinicName,
          date_range: dateRange,
          method: method.method,
          count: method.count,
          amount: method.amount,
          percentage: method.percentage
        });
      }

      if (Array.isArray(data.dailyPayments)) {
        for (let i = 0; i < data.dailyPayments.length; i++) {
          const payment = data.dailyPayments[i];
          flatData.push({
            report_type: 'Daily Payment',
            clinic_name: data.clinicName,
            date_range: dateRange,
            date: payment.date,
            amount: payment.amount,
            count: payment.count
          });
        }
      }
    } else if (data.practitioners) {
      if (data.summary) {
        flatData.push({
          report_type: 'Summary',
          clinic_name: data.clinicName,
          date_range: dateRange,
          ...this.prefixKeys(data.summary, 'summary')
        });
      }

      // Timesheet Report - Practitioners
      for (let i = 0; i < data.practitioners.length; i++) {
        const practitioner = data.practitioners[i];
        flatData.push({
          report_type: 'Practitioner Hours',
          clinic_name: data.clinicName,
          date_range: dateRange,
          practitioner_name: practitioner.resourceName,
          practitioner_id: practitioner.resourceId,
          total_hours: practitioner.totalHours,
          total_appointments: practitioner.totalAppointments,
          completed_appointments: practitioner.completedAppointments,
          cancelled_appointments: practitioner.cancelledAppointments,
          average_duration: practitioner.averageAppointmentDuration,
          revenue: practitioner.revenue,
          utilization: practitioner.utilization
        });
      }
      
      // Timesheet Report - User Activity (Login/Logout Times)
      if (data.userActivity && Array.isArray(data.userActivity)) {
        for (let i = 0; i < data.userActivity.length; i++) {
          const user = data.userActivity[i];
          flatData.push({
            report_type: 'User Login Activity',
            clinic_name: data.clinicName,
            date_range: dateRange,
            user_id: user.userId,
            username: user.username,
            full_name: user.fullName,
            role: user.role,
            last_login: user.lastLogin || 'Never',
            last_activity: user.lastActivity || 'Never',
            total_sessions: user.totalSessions,
            active_sessions: user.activeSessions
          });
          
          // Add individual session details
          if (user.sessions && user.sessions.length > 0) {
            for (let j = 0; j < user.sessions.length; j++) {
              const session = user.sessions[j];
              flatData.push({
                report_type: 'User Session Detail',
                clinic_name: data.clinicName,
                date_range: dateRange,
                username: user.username,
                full_name: user.fullName,
                session_device: session.deviceId,
                session_ip: session.ipAddress,
                session_user_agent: session.userAgent?.substring(0, 100) || 'Unknown',
                session_last_activity: session.lastActivity,
                session_is_active: session.isActive ? 'Yes' : 'No'
              });
            }
          }
        }
      }
    } else if (data.summary && data.statusBreakdown) {
      flatData.push({
        report_type: 'Summary',
        clinic_name: data.clinicName,
        ...this.prefixKeys(data.summary, 'summary')
      });

      for (let i = 0; i < data.statusBreakdown.length; i++) {
        const status = data.statusBreakdown[i];
        flatData.push({
          report_type: 'Status Breakdown',
          clinic_name: data.clinicName,
          status: status.status,
          count: status.count,
          percentage: status.percentage,
          total_value: status.totalValue
        });
      }

      if (Array.isArray(data.recentOrders)) {
        for (let i = 0; i < data.recentOrders.length; i++) {
          const order = data.recentOrders[i];
          flatData.push({
            report_type: 'Recent Order',
            clinic_name: data.clinicName,
            order_id: order.orderId,
            order_number: order.orderNumber,
            client_name: order.clientName,
            status: order.status,
            total_amount: order.totalAmount,
            created_at: order.createdAt
          });
        }
      }
    } else if (data.summary && data.coPayBreakdown) {
      flatData.push({
        report_type: 'Summary',
        clinic_name: data.clinicName,
        date_range: dateRange,
        ...this.prefixKeys(data.summary, 'summary')
      });

      for (let i = 0; i < data.coPayBreakdown.length; i++) {
        const coPay = data.coPayBreakdown[i];
        flatData.push({
          report_type: 'Co-Pay Breakdown',
          clinic_name: data.clinicName,
          date_range: dateRange,
          insurance_type: coPay.insuranceType,
          count: coPay.count,
          amount: coPay.amount,
          percentage: coPay.percentage
        });
      }

      if (Array.isArray(data.monthlyTrends)) {
        for (let i = 0; i < data.monthlyTrends.length; i++) {
          const trend = data.monthlyTrends[i];
          flatData.push({
            report_type: 'Monthly Trend',
            clinic_name: data.clinicName,
            date_range: dateRange,
            month: trend.month,
            amount: trend.amount,
            count: trend.count
          });
        }
      }
    } else if (data.summary && data.campaigns) {
      flatData.push({
        report_type: 'Summary',
        clinic_name: data.clinicName,
        date_range: dateRange,
        ...this.prefixKeys(data.summary, 'summary')
      });

      for (let i = 0; i < data.campaigns.length; i++) {
        const campaign = data.campaigns[i];
        flatData.push({
          report_type: 'Campaign',
          clinic_name: data.clinicName,
          date_range: dateRange,
          campaign_name: campaign.campaignName,
          spent: campaign.spent,
          revenue: campaign.revenue,
          roi: campaign.roi,
          conversions: campaign.conversions
        });
      }

      if (Array.isArray(data.channels)) {
        for (let i = 0; i < data.channels.length; i++) {
          const channel = data.channels[i];
          flatData.push({
            report_type: 'Channel',
            clinic_name: data.clinicName,
            date_range: dateRange,
            channel: channel.channel,
            spent: channel.spent,
            clients: channel.clients,
            revenue: channel.revenue,
            roi: channel.roi
          });
        }
      }
    } else if (Array.isArray(data)) {
      // Handle array-based reports
      return data.map((item, index) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return { ...(item as ReportRow), row_index: index + 1 };
        }

        return { value: item, row_index: index + 1 };
      });
    } else {
      // Generic object flattening
      flatData.push(this.flattenObject(data));
    }
    
    return flatData;
  }

  /**
   * Flatten nested objects recursively
   */
  private static flattenObject(obj: Record<string, unknown>, prefix = ''): ReportRow {
    const flattened: ReportRow = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value as Record<string, unknown>, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = value
          .map(item => {
            if (item && typeof item === 'object') {
              return JSON.stringify(this.flattenObject(item as Record<string, unknown>));
            }

            return String(item);
          })
          .join('; ');
      } else {
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  }

  /**
   * Escape CSV values properly
   */
  private static escapeCsvValue(value: unknown): string {
    if (value == null) return '';
    
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  /**
   * Generate HTML content for PDF export
   */
  private static generateReportHTML(reportData: ReportApiResponse, reportType: string): string {
    const data = reportData.data;
    if (!data) {
      return '';
    }
    const title = `${this.formatReportLabel(reportType)} Report`;
    const sections: string[] = [];

    if (data.summary && typeof data.summary === 'object') {
      sections.push(this.renderObjectTable('Summary', data.summary));
    }

    Object.entries(data).forEach(([key, value]) => {
      if (['clinicName', 'dateRange', 'summary'].includes(key) || value == null) {
        return;
      }

      if (Array.isArray(value)) {
        sections.push(this.renderArrayTable(this.formatReportLabel(key), value));
        return;
      }

      if (typeof value === 'object') {
        sections.push(this.renderObjectTable(this.formatReportLabel(key), value as Record<string, unknown>));
      }
    });

    if (!sections.length) {
      sections.push(this.renderObjectTable('Report Data', this.flattenObject(data)));
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 24px;
          }
          h1 {
            color: #1d4ed8;
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 16px;
            padding-bottom: 10px;
          }
          h2 {
            color: #111827;
            font-size: 18px;
            margin: 0 0 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0 24px;
          }
          th, td {
            border: 1px solid #d1d5db;
            font-size: 12px;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f8fafc;
            font-weight: 700;
          }
          .meta-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin: 20px 0 24px;
          }
          .meta-card {
            background-color: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
          }
          .meta-label {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          .meta-value {
            font-size: 14px;
            font-weight: 600;
          }
          .section {
            break-inside: avoid;
          }
          @media print {
            body {
              margin: 12px;
            }
          }
        </style>
      </head>
      <body>
        <h1>${this.escapeHtml(title)}</h1>
        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">Clinic</div>
            <div class="meta-value">${this.escapeHtml(data.clinicName || 'N/A')}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Generated</div>
            <div class="meta-value">${this.escapeHtml(new Date().toLocaleString())}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Date Range</div>
            <div class="meta-value">${this.escapeHtml(data.dateRange ? `${data.dateRange.startDate} to ${data.dateRange.endDate}` : 'All Time')}</div>
          </div>
        </div>
        <div id="report-content">
          ${sections.join('')}
        </div>
      </body>
      </html>
    `;
  }

  private static collectHeaders(rows: Array<Record<string, unknown>>): string[] {
    const headerSet = new Set<string>();

    rows.forEach(row => {
      Object.keys(row).forEach(key => headerSet.add(key));
    });

    return Array.from(headerSet);
  }

  private static prefixKeys(obj: Record<string, unknown>, prefix: string): Record<string, unknown> {
    return Object.entries(obj).reduce<Record<string, unknown>>((accumulator, [key, value]) => {
      accumulator[`${prefix}_${key}`] = value;
      return accumulator;
    }, {});
  }

  private static formatReportLabel(value: string): string {
    return value
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  private static escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private static formatHtmlValue(value: unknown): string {
    if (value == null || value === '') {
      return 'N/A';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (Array.isArray(value)) {
      return this.escapeHtml(
        value.map(item => this.stringifyDisplayValue(item)).join(', ')
      );
    }

    if (typeof value === 'object') {
      const flattened = this.flattenObject(value);
      const pairs = Object.entries(flattened).map(([key, item]) => {
        return `${this.formatReportLabel(key)}: ${item}`;
      });

      return this.escapeHtml(pairs.join(' | '));
    }

    return this.escapeHtml(String(value));
  }

  private static stringifyDisplayValue(value: unknown): string {
    if (value == null) {
      return 'N/A';
    }

    if (typeof value === 'object') {
      const flattened = this.flattenObject(value);
      return Object.entries(flattened)
        .map(([key, item]) => `${this.formatReportLabel(key)}: ${item}`)
        .join(' | ');
    }

    return String(value);
  }

  private static renderObjectTable(title: string, data: Record<string, unknown>): string {
    const rows = Object.entries(data)
      .map(([key, value]) => `
        <tr>
          <th scope="row">${this.escapeHtml(this.formatReportLabel(key))}</th>
          <td>${this.formatHtmlValue(value)}</td>
        </tr>
      `)
      .join('');

    if (!rows) {
      return '';
    }

    return `
      <section class="section">
        <h2>${this.escapeHtml(title)}</h2>
        <table>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </section>
    `;
  }

  private static renderArrayTable(title: string, rows: unknown[]): string {
    if (!rows.length) {
      return '';
    }

    const normalizedRows = rows.map(row => {
      if (row && typeof row === 'object' && !Array.isArray(row)) {
        return row as Record<string, unknown>;
      }

      return { value: row };
    });

    const headers = this.collectHeaders(normalizedRows);
    const headMarkup = headers
      .map(header => `<th scope="col">${this.escapeHtml(this.formatReportLabel(header))}</th>`)
      .join('');
    const bodyMarkup = normalizedRows
      .map(row => `
        <tr>
          ${headers.map(header => `<td>${this.formatHtmlValue(row[header])}</td>`).join('')}
        </tr>
      `)
      .join('');

    return `
      <section class="section">
        <h2>${this.escapeHtml(title)}</h2>
        <table>
          <thead>
            <tr>${headMarkup}</tr>
          </thead>
          <tbody>
            ${bodyMarkup}
          </tbody>
        </table>
      </section>
    `;
  }

  /**
   * Download file helper
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Print current report view
   */
  static printReport(): void {
    window.print();
  }

  /**
   * Clear all report cache
   */
  static clearReportCache(): void {
    this.clearCache('available_reports_');
    this.clearCache('account_summary_');
    this.clearCache('payment_summary_');
    this.clearCache('timesheet_');
    this.clearCache('order_status_');
    this.clearCache('copay_summary_');
    this.clearCache('marketing_budget_');
  }
}
