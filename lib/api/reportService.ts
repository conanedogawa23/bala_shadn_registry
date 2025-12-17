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
  ): Promise<any> {
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
  private static exportToCSV(reportData: any, filename: string): void {
    const flattenedData = this.flattenReportData(reportData);
    if (!flattenedData.length) {
      logger.warn('No data available for export');
      return;
    }

    const headers = Object.keys(flattenedData[0]);
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
  private static exportToJSON(reportData: any, filename: string): void {
    const jsonContent = JSON.stringify(reportData, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  /**
   * Export to PDF format (simplified implementation)
   */
  private static async exportToPDF(reportData: any, filename: string, reportType: string): Promise<void> {
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
  private static generateFilename(reportType: string, clinicName: string, format: string): string {
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
  private static flattenReportData(reportData: any): any[] {
    if (!reportData?.data) return [];
    
    const { data } = reportData;
    const flatData: any[] = [];
    
    // Handle different report structures
    if (data.summary && data.topServices) {
      // Account Summary Report
      flatData.push({
        report_type: 'Summary',
        clinic_name: data.clinicName,
        date_range: `${data.dateRange.startDate} to ${data.dateRange.endDate}`,
        total_revenue: data.summary.totalRevenue,
        total_orders: data.summary.totalOrders,
        total_clients: data.summary.totalClients,
        average_order_value: data.summary.averageOrderValue,
        completed_orders: data.summary.completedOrders,
        pending_orders: data.summary.pendingOrders,
        cancelled_orders: data.summary.cancelledOrders
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
    } else if (data.practitioners) {
      // Timesheet Report - Practitioners
      for (let i = 0; i < data.practitioners.length; i++) {
        const practitioner = data.practitioners[i];
        flatData.push({
          report_type: 'Practitioner Hours',
          clinic_name: data.clinicName,
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
    } else if (Array.isArray(data)) {
      // Handle array-based reports
      return data.map((item, index) => ({ ...item, row_index: index + 1 }));
    } else {
      // Generic object flattening
      flatData.push(this.flattenObject(data));
    }
    
    return flatData;
  }

  /**
   * Flatten nested objects recursively
   */
  private static flattenObject(obj: any, prefix = ''): any {
    const flattened: any = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join('; ');
      } else {
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  }

  /**
   * Escape CSV values properly
   */
  private static escapeCsvValue(value: any): string {
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
  private static generateReportHTML(reportData: any, reportType: string): string {
    const { data } = reportData;
    const title = `${reportType.replace('-', ' ').toUpperCase()} REPORT`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .summary { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="summary">
          <h3>Report Details</h3>
          <p><strong>Clinic:</strong> ${data.clinicName || 'N/A'}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Date Range:</strong> ${data.dateRange ? `${data.dateRange.startDate} to ${data.dateRange.endDate}` : 'All Time'}</p>
        </div>
        <div id="report-content">
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      </body>
      </html>
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
