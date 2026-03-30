import { logger } from '../utils/logger';
import { BaseApiService } from './baseApiService';
import { ClinicApiService, type FullClinicData } from './clinicService';

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

interface ClinicBranding {
  clinic?: FullClinicData;
  logo?: FullClinicData['logo'];
}

interface ReportDetailSection {
  rows: Array<Record<string, unknown>>;
  title: string;
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
    format: 'xlsx' | 'csv' | 'json' | 'pdf' = 'xlsx',
    options: ReportQueryOptions = {}
  ): Promise<void> {
    const reportData = await this.getDetailedReportData(reportType, clinicName, options);
    const filename = this.generateFilename(reportType, clinicName, format);
    const clinicBranding = await this.getClinicBranding(clinicName);
    
    switch (format) {
      case 'xlsx':
        await this.exportToExcel(reportData, filename, reportType, clinicBranding);
        break;
      case 'csv':
        this.exportToCSV(reportData, filename);
        break;
      case 'json':
        this.exportToJSON(reportData, filename);
        break;
      case 'pdf':
        await this.exportToPDF(reportData, filename, reportType, clinicBranding);
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
        return this.request<ReportData>(`${baseUrl}/account-summary${queryParams}`) as unknown as Promise<ReportApiResponse>;
      case 'payment-summary':
        return this.request<ReportData>(`${baseUrl}/payment-summary${queryParams}`) as unknown as Promise<ReportApiResponse>;
      case 'timesheet':
        return this.request<ReportData>(`${baseUrl}/timesheet${queryParams}`) as unknown as Promise<ReportApiResponse>;
      case 'order-status':
        return this.request<ReportData>(`${baseUrl}/order-status${queryParams}`) as unknown as Promise<ReportApiResponse>;
      case 'copay-summary':
        return this.request<ReportData>(`${baseUrl}/copay-summary${queryParams}`) as unknown as Promise<ReportApiResponse>;
      case 'marketing-budget':
        return this.request<ReportData>(`${baseUrl}/marketing-budget${queryParams}`) as unknown as Promise<ReportApiResponse>;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  /**
   * Enhanced CSV export with detailed data flattening
   */
  private static async exportToExcel(
    reportData: ReportApiResponse,
    filename: string,
    reportType: string,
    clinicBranding: ClinicBranding
  ): Promise<void> {
    const excelJsModule = await import('exceljs');
    const ExcelJS = excelJsModule.default ?? excelJsModule;
    const workbook = new ExcelJS.Workbook();
    const summarySheet = workbook.addWorksheet('Summary', {
      views: [{ state: 'frozen', ySplit: 6 }]
    });
    const detailSheet = workbook.addWorksheet('Detail', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });
    const reportPayload = reportData.data;

    workbook.creator = 'Visio Reports';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    let summaryStartRow = 1;
    if (clinicBranding.logo) {
      const imageExtension = this.getImageExtension(clinicBranding.logo.contentType);
      if (imageExtension) {
        const imageId = workbook.addImage({
          base64: `data:${clinicBranding.logo.contentType};base64,${clinicBranding.logo.data}`,
          extension: imageExtension
        });
        summarySheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 180, height: 60 }
        });
        summaryStartRow = 5;
      }
    }

    summarySheet.getCell(`A${summaryStartRow}`).value = `${this.formatReportLabel(reportType)} Report`;
    summarySheet.getCell(`A${summaryStartRow}`).font = { bold: true, size: 18 };
    summarySheet.getCell(`A${summaryStartRow + 1}`).value = `Clinic: ${clinicBranding.clinic?.displayName || reportPayload?.clinicName || filename}`;
    summarySheet.getCell(`A${summaryStartRow + 2}`).value = `Generated: ${new Date().toLocaleString('en-CA')}`;
    summarySheet.getCell(`A${summaryStartRow + 3}`).value = `Date Range: ${this.formatDateRange(reportPayload?.dateRange)}`;

    let summaryRowIndex = summaryStartRow + 5;
    summaryRowIndex = this.writeSummarySection(summarySheet, summaryRowIndex, 'Summary', reportPayload?.summary);

    Object.entries(reportPayload || {}).forEach(([key, value]) => {
      if (['clinicName', 'dateRange', 'summary'].includes(key) || value == null) {
        return;
      }

      if (!Array.isArray(value) && typeof value === 'object') {
        summaryRowIndex = this.writeSummarySection(
          summarySheet,
          summaryRowIndex,
          this.formatReportLabel(key),
          value as Record<string, unknown>
        );
      }
    });

    if (summaryRowIndex === summaryStartRow + 5) {
      summaryRowIndex = this.writeSummarySection(
        summarySheet,
        summaryRowIndex,
        'Report Data',
        this.flattenObject(reportPayload || {})
      );
    }

    const detailSections = this.extractDetailSections(reportPayload);
    let detailRowIndex = 1;
    detailSections.forEach((section) => {
      detailRowIndex = this.writeDetailSection(detailSheet, detailRowIndex, section.title, section.rows);
    });

    if (detailRowIndex === 1) {
      this.writeDetailSection(detailSheet, detailRowIndex, 'Detail', this.flattenReportData(reportData));
    }

    this.autoFitWorksheetColumns(summarySheet);
    this.autoFitWorksheetColumns(detailSheet);

    const buffer = await workbook.xlsx.writeBuffer();
    this.downloadBlob(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      `${filename}.xlsx`
    );
  }

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
  private static async exportToPDF(
    reportData: ReportApiResponse,
    filename: string,
    reportType: string,
    clinicBranding: ClinicBranding
  ): Promise<void> {
    // For now, create a formatted HTML content for PDF printing
    const htmlContent = this.generateReportHTML(reportData, reportType, clinicBranding);
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

  private static async getClinicBranding(clinicName: string): Promise<ClinicBranding> {
    try {
      const { clinics } = await ClinicApiService.getFullClinics();
      const normalizedClinicName = clinicName.toLowerCase();
      const clinic = clinics.find((candidate) => {
        return [candidate.backendName, candidate.displayName, candidate.name]
          .filter(Boolean)
          .some((value) => value.toLowerCase() === normalizedClinicName);
      });

      return {
        clinic,
        logo: clinic?.logo || null
      };
    } catch (error) {
      logger.warn('Unable to load clinic branding for report export', error);
      return {};
    }
  }

  private static getImageExtension(contentType?: string): 'png' | 'jpeg' | null {
    if (!contentType) {
      return null;
    }

    if (contentType.includes('png')) {
      return 'png';
    }

    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      return 'jpeg';
    }

    return null;
  }

  private static formatDateRange(dateRange?: { startDate?: string; endDate?: string }): string {
    if (!dateRange?.startDate && !dateRange?.endDate) {
      return 'All Time';
    }

    if (dateRange?.startDate && dateRange?.endDate) {
      return `${dateRange.startDate} to ${dateRange.endDate}`;
    }

    return dateRange?.startDate || dateRange?.endDate || 'All Time';
  }

  private static extractDetailSections(data?: ReportData): ReportDetailSection[] {
    if (!data) {
      return [];
    }

    const sections: ReportDetailSection[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (['clinicName', 'dateRange', 'summary'].includes(key) || value == null) {
        return;
      }

      if (Array.isArray(value)) {
        const rows = value.map((item, index) => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            return item as Record<string, unknown>;
          }

          return {
            rowIndex: index + 1,
            value: item
          };
        });

        if (rows.length > 0) {
          sections.push({
            title: this.formatReportLabel(key),
            rows
          });
        }
        return;
      }

      if (typeof value === 'object') {
        sections.push({
          title: this.formatReportLabel(key),
          rows: [this.flattenObject(value as Record<string, unknown>)]
        });
      }
    });

    return sections;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static writeSummarySection(worksheet: any, startRow: number, title: string, data?: Record<string, unknown>): number {
    if (!data || Object.keys(data).length === 0) {
      return startRow;
    }

    const titleCell = worksheet.getCell(startRow, 1);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF1D4ED8' } };

    let rowIndex = startRow + 1;
    Object.entries(data).forEach(([key, value]) => {
      worksheet.getCell(rowIndex, 1).value = this.formatReportLabel(key);
      worksheet.getCell(rowIndex, 1).font = { bold: true };
      this.setWorksheetCellValue(worksheet.getCell(rowIndex, 2), key, value);
      rowIndex += 1;
    });

    return rowIndex + 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static writeDetailSection(worksheet: any, startRow: number, title: string, rows: Array<Record<string, unknown>>): number {
    if (!rows.length) {
      return startRow;
    }

    const headers = this.collectHeaders(rows);
    const titleCell = worksheet.getCell(startRow, 1);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF1D4ED8' } };

    const headerRowNumber = startRow + 1;
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(headerRowNumber, index + 1);
      cell.value = this.formatReportLabel(header);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' }
      };
    });

    let rowIndex = headerRowNumber + 1;
    rows.forEach((row) => {
      headers.forEach((header, index) => {
        this.setWorksheetCellValue(worksheet.getCell(rowIndex, index + 1), header, row[header]);
      });
      rowIndex += 1;
    });

    return rowIndex + 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static setWorksheetCellValue(cell: any, key: string, value: unknown): void {
    if (value == null || value === '') {
      cell.value = '';
      return;
    }

    if (typeof value === 'number') {
      cell.value = this.getRoundedNumber(key, value);
      cell.numFmt = this.isWholeNumberMetricKey(key) || this.isIdentifierKey(key) ? '0' : '0.000';
      return;
    }

    if ((value instanceof Date || typeof value === 'string') && this.isDateLikeKey(key)) {
      const dateValue = value instanceof Date ? value : new Date(value);
      if (!Number.isNaN(dateValue.getTime())) {
        cell.value = dateValue;
        cell.numFmt = this.hasNonMidnightTime(dateValue) ? 'yyyy-mm-dd hh:mm' : 'yyyy-mm-dd';
        return;
      }
    }

    if (Array.isArray(value)) {
      cell.value = value.map((item) => this.stringifyDisplayValue(item)).join(', ');
      return;
    }

    if (typeof value === 'object') {
      cell.value = this.stringifyDisplayValue(value);
      return;
    }

    cell.value = String(value);
  }

  private static getRoundedNumber(key: string, value: number): number {
    if (this.isIdentifierKey(key) || this.isWholeNumberMetricKey(key)) {
      return Math.round(value);
    }

    return Number(value.toFixed(3));
  }

  private static isIdentifierKey(key: string): boolean {
    return /(^|_)(id|key)$/.test(key.toLowerCase());
  }

  private static isWholeNumberMetricKey(key: string): boolean {
    return /(count|orders|clients|appointments|sessions|users|quantity|completed|pending|cancelled|active)/i.test(key);
  }

  private static isDateLikeKey(key: string): boolean {
    return /(date|month|created|generated|last_login|lastlogin|last_activity|lastactivity)/i.test(key);
  }

  private static hasNonMidnightTime(date: Date): boolean {
    return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static autoFitWorksheetColumns(worksheet: any): void {
    worksheet.columns.forEach((column: any) => {
      let maxLength = 12;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const rawValue = cell.value;
        const cellText = rawValue == null
          ? ''
          : rawValue instanceof Date
            ? this.formatDateTimeValue(rawValue)
            : String(rawValue);
        maxLength = Math.max(maxLength, cellText.length + 2);
      });
      column.width = Math.min(maxLength, 40);
    });
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
  private static generateReportHTML(
    reportData: ReportApiResponse,
    reportType: string,
    clinicBranding: ClinicBranding
  ): string {
    const data = reportData.data;
    if (!data) {
      return '';
    }
    const title = `${this.formatReportLabel(reportType)} Report`;
    const sections: string[] = [];
    const detailSections = this.extractDetailSections(data);
    const logoMarkup = clinicBranding.logo
      ? `<img src="data:${clinicBranding.logo.contentType};base64,${clinicBranding.logo.data}" alt="Clinic logo" class="report-logo" />`
      : '';

    if (data.summary && typeof data.summary === 'object') {
      sections.push(this.renderObjectTable('Summary', data.summary));
    }

    detailSections.forEach((section) => {
      sections.push(this.renderArrayTable(section.title, section.rows));
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
          .report-header {
            align-items: center;
            display: flex;
            gap: 16px;
            margin-bottom: 20px;
          }
          .report-logo {
            height: 60px;
            max-width: 180px;
            object-fit: contain;
          }
          h1 {
            color: #1d4ed8;
            border-bottom: 2px solid #e5e7eb;
            margin: 0 0 16px;
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
        <div class="report-header">
          ${logoMarkup}
          <div>
            <h1>${this.escapeHtml(title)}</h1>
          </div>
        </div>
        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">Clinic</div>
            <div class="meta-value">${this.escapeHtml(clinicBranding.clinic?.displayName || data.clinicName || 'N/A')}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Generated</div>
            <div class="meta-value">${this.escapeHtml(this.formatDateTimeValue(new Date()))}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Date Range</div>
            <div class="meta-value">${this.escapeHtml(this.formatDateRange(data.dateRange))}</div>
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

  private static formatHtmlValue(key: string, value: unknown): string {
    if (value == null || value === '') {
      return 'N/A';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'number') {
      return this.escapeHtml(
        this.isWholeNumberMetricKey(key) || this.isIdentifierKey(key)
          ? String(Math.round(value))
          : value.toFixed(3)
      );
    }

    if ((value instanceof Date || typeof value === 'string') && this.isDateLikeKey(key)) {
      const dateValue = value instanceof Date ? value : new Date(value);
      if (!Number.isNaN(dateValue.getTime())) {
        return this.escapeHtml(this.formatDateTimeValue(dateValue));
      }
    }

    if (Array.isArray(value)) {
      return this.escapeHtml(
        value.map(item => this.stringifyDisplayValue(item)).join(', ')
      );
    }

    if (typeof value === 'object') {
      const flattened = this.flattenObject(value as Record<string, unknown>);
      const pairs = Object.entries(flattened).map(([key, item]) => {
        return `${this.formatReportLabel(key)}: ${this.stringifyDisplayValue(item, key)}`;
      });

      return this.escapeHtml(pairs.join(' | '));
    }

    return this.escapeHtml(String(value));
  }

  private static stringifyDisplayValue(value: unknown, key = ''): string {
    if (value == null) {
      return 'N/A';
    }

    if (typeof value === 'number') {
      return this.isWholeNumberMetricKey(key) || this.isIdentifierKey(key)
        ? String(Math.round(value))
        : value.toFixed(3);
    }

    if ((value instanceof Date || typeof value === 'string') && this.isDateLikeKey(key)) {
      const dateValue = value instanceof Date ? value : new Date(value);
      if (!Number.isNaN(dateValue.getTime())) {
        return this.formatDateTimeValue(dateValue);
      }
    }

    if (typeof value === 'object') {
      const flattened = this.flattenObject(value as Record<string, unknown>);
      return Object.entries(flattened)
        .map(([nestedKey, item]) => `${this.formatReportLabel(nestedKey)}: ${this.stringifyDisplayValue(item, nestedKey)}`)
        .join(' | ');
    }

    return String(value);
  }

  private static renderObjectTable(title: string, data: Record<string, unknown>): string {
    const rows = Object.entries(data)
      .map(([key, value]) => `
        <tr>
          <th scope="row">${this.escapeHtml(this.formatReportLabel(key))}</th>
          <td>${this.formatHtmlValue(key, value)}</td>
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
          ${headers.map(header => `<td>${this.formatHtmlValue(header, row[header])}</td>`).join('')}
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
  private static formatDateTimeValue(date: string | Date): string {
    const dateValue = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(dateValue.getTime())) {
      return String(date);
    }

    return dateValue.toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private static downloadBlob(blob: Blob, filename: string): void {
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

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    this.downloadBlob(
      new Blob([content], { type: `${mimeType};charset=utf-8;` }),
      filename
    );
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
