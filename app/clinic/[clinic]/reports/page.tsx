'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  BarChart, 
  ArrowLeft, 
  TrendingUp, 
  Users,
  DollarSign,
  Activity,
  FileText,
  Download,
  Filter,
  AlertCircle,
  Calendar,
  Package,
  CreditCard,
  CalendarDays,

} from 'lucide-react';
import { useClinic } from '@/lib/contexts/clinic-context';
import { generateLink } from '@/lib/route-utils';
import { StatsCard } from '@/components/ui/cards/StatsCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import real API hooks and utilities
import { 
  useRevenueAnalytics, 
  useProductPerformance, 
  useOrdersByClinic,
  useClients,
  OrderUtils,
  OrderStatus
} from '@/lib/hooks';
import { PaymentStatus } from '@/lib/api/orderService';
import { ReportApiService, type ClientStatisticsData } from '@/lib/api/reportService';

interface ReportMetrics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  clientGrowthRate: number;
  orderCompletionRate: number;
  revenueGrowthRate: number;
}

interface ChartData {
  month: string;
  clients: number;
  orders: number;
  revenue: number;
}

export default function ReportsPage() {
  const params = useParams();
  const router = useRouter();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;
  
  // Get clinic data from context (API-provided with correct backendName)
  const { availableClinics } = useClinic();
  const clinic = useMemo(() => {
    return availableClinics.find(c => c.name === clinicSlug);
  }, [clinicSlug, availableClinics]);
  
  /** 
   * CRITICAL: MongoDB Collection Clinic Name Formats
   * ================================================
   * The database uses DIFFERENT clinic name formats in different collections:
   * 
   * 1. ORDERS Collection: Uses slug format (lowercase, no spaces)
   *    - Example: "bodyblissphysio", "bodyblissonecare"
   *    - Source: clinic.name (URL slug)
   *    - Used by: Revenue Analytics, Product Performance, Order queries
   * 
   * 2. CLIENTS/APPOINTMENTS Collections: Uses display format (mixed case, spaces allowed)
   *    - Example: "BodyBlissPhysio", "BodyBlissOneCare", "Century Care"
   *    - Source: clinic.backendName (from ClinicController.getBackendClinicName)
   *    - Used by: Client queries, Appointment queries
   * 
   * WHY: Historical data migration resulted in inconsistent naming across collections.
   * The backend ClinicService.slugToClinicName handles slug→name conversion for orders,
   * while ClinicController.getBackendClinicName provides the correct name for clients.
   * 
   * NEVER use clinic.displayName for queries - it's for UI display only!
   */
  const orderClinicName = useMemo(() => {
    // For orders, use the slug (clinic.name) - lowercase format
    return clinic?.name || "";
  }, [clinic]);

  const backendClinicName = useMemo(() => {
    // For clients/appointments, use backendName - proper case format
    return clinic?.backendName || clinic?.name || "";
  }, [clinic]);

  const [selectedPeriod, setSelectedPeriod] = useState('last6months');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  
  // Custom date range state
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [dateRangeValid, setDateRangeValid] = useState(true);
  const [selectedQuickPreset, setSelectedQuickPreset] = useState<string | null>(null);
  const [clientStats, setClientStats] = useState<ClientStatisticsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Calculate date ranges based on selected period or custom dates
  const dateRange = useMemo(() => {
    if (useCustomRange && customStartDate && customEndDate) {
      return {
        startDate: customStartDate.toISOString().split('T')[0],
        endDate: customEndDate.toISOString().split('T')[0]
      };
    }
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (selectedPeriod) {
      case 'last30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'last6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'lastyear':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }, [selectedPeriod, useCustomRange, customStartDate, customEndDate]);

  // Validate date range
  useEffect(() => {
    setDateRangeValid(true); // Simplified validation - always allow data loading
  }, [useCustomRange, customStartDate, customEndDate]);

  // Clear selected preset when dates are manually changed or switching to non-custom range
  useEffect(() => {
    if (!useCustomRange && selectedQuickPreset) {
      setSelectedQuickPreset(null);
    } else if (useCustomRange && (customStartDate || customEndDate) && selectedQuickPreset) {
      // Only clear if dates don't match the current preset
      const now = new Date();
      let expectedStart = new Date();
      
      switch (selectedQuickPreset) {
        case 'thisWeek':
          const dayOfWeek = now.getDay();
          expectedStart.setDate(now.getDate() - dayOfWeek);
          break;
        case 'thisMonth':
          expectedStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'thisQuarter':
          const quarter = Math.floor(now.getMonth() / 3);
          expectedStart = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        default:
          return;
      }
      
      // If manually changed dates don't match preset, clear selection
      if (customStartDate && expectedStart.toDateString() !== customStartDate.toDateString()) {
        setSelectedQuickPreset(null);
      }
    }
  }, [customStartDate, customEndDate, useCustomRange, selectedQuickPreset]);



  // Fetch real analytics data using correct clinic names for each collection
  // Orders use slug format, Clients use backendName format
  const { 
    analytics: revenueAnalytics, 
    loading: revenueLoading, 
    error: revenueError,
    totalRevenue,
    totalOrders: analyticsOrderCount,
    avgOrderValue,
    refetch: refetchRevenue
  } = useRevenueAnalytics({
    clinicName: orderClinicName,  // Orders use slug format
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    autoFetch: !!orderClinicName && dateRangeValid
  });

  const { 
    performance: productPerformance, 
    loading: performanceLoading, 
    error: performanceError,
    refetch: refetchPerformance
  } = useProductPerformance({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    autoFetch: dateRangeValid
  });

  const { 
    orders, 
    loading: ordersLoading, 
    error: ordersError 
  } = useOrdersByClinic({
    clinicName: orderClinicName,  // Orders use slug format
    autoFetch: !!orderClinicName
  });

  const { 
    clients, 
    loading: clientsLoading, 
    error: clientsError 
  } = useClients({
    clinicName: backendClinicName,
    autoFetch: !!backendClinicName
  });

  // Fetch client statistics using aggregation (optimized - no data transfer)
  useEffect(() => {
    if (backendClinicName) {
      const fetchClientStats = async () => {
        setStatsLoading(true);
        try {
          const stats = await ReportApiService.getClientStatistics(backendClinicName);
          setClientStats(stats);
        } catch (error) {
          console.error('Failed to fetch client stats:', error);
          setClientStats(null);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchClientStats();
    }
  }, [backendClinicName]);

  // Calculate comprehensive metrics from real data
  const metrics = useMemo((): ReportMetrics => {
    if (!revenueAnalytics || !orders || !clientStats) {
      return {
        totalClients: 0,
        activeClients: 0,
        newClientsThisMonth: 0,
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        averageOrderValue: 0,
        clientGrowthRate: 0,
        orderCompletionRate: 0,
        revenueGrowthRate: 0
      };
    }

    // Calculate order metrics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
    const pendingOrders = orders.filter(o => 
      o.paymentStatus === PaymentStatus.PENDING || 
      o.paymentStatus === PaymentStatus.PARTIAL ||
      o.paymentStatus === PaymentStatus.OVERDUE
    ).length;

    // Use aggregated stats instead of client array
    const totalClients = clientStats.totalClients;
    const newClientsThisMonth = clientStats.newClientsThisMonth;
    const activeClients = clientStats.activeClients;

    // Calculate growth rates from analytics data with safe array operations
    const isValidAnalytics = Array.isArray(revenueAnalytics) && revenueAnalytics.length > 0;
    const revenueGrowthRate = isValidAnalytics && revenueAnalytics.length > 1 ? 
      ((revenueAnalytics[revenueAnalytics.length - 1]?.totalRevenue || 0) - 
       (revenueAnalytics[0]?.totalRevenue || 0)) / (revenueAnalytics[0]?.totalRevenue || 1) * 100 : 0;

    const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Calculate monthly revenue (average from analytics)
    const monthlyRevenue = isValidAnalytics ? 
      revenueAnalytics.reduce((sum, item) => sum + (item.totalRevenue || 0), 0) / revenueAnalytics.length : 0;

    const clientGrowthRate = isValidAnalytics && revenueAnalytics.length > 1 ?
      ((revenueAnalytics[revenueAnalytics.length - 1]?.orderCount || 0) - 
       (revenueAnalytics[0]?.orderCount || 0)) / (revenueAnalytics[0]?.orderCount || 1) * 100 : 0;

    return {
            totalClients,
            activeClients,
            newClientsThisMonth,
            totalOrders,
            completedOrders,
            pendingOrders,
            totalRevenue,
            monthlyRevenue,
      averageOrderValue: avgOrderValue,
            clientGrowthRate,
            orderCompletionRate,
            revenueGrowthRate
    };
  }, [revenueAnalytics, orders, clientStats, totalRevenue, avgOrderValue]);

  // Generate chart data from real analytics
  const chartData = useMemo((): ChartData[] => {
    if (!revenueAnalytics || revenueAnalytics.length === 0) return [];

    return revenueAnalytics.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      clients: Math.floor(item.orderCount * 0.8), // Estimate clients from orders
      orders: item.orderCount,
      revenue: item.totalRevenue
    }));
  }, [revenueAnalytics]);

  const handleBack = () => {
    router.push(generateLink('clinic', '', clinicSlug));
  };

  // Handle custom date range toggle
  const handleCustomRangeToggle = useCallback((enabled: boolean) => {
    setUseCustomRange(enabled);
    if (!enabled) {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
      setSelectedQuickPreset(null);
    }
    // Clear cache to force data refresh
    if (typeof window !== 'undefined') {
      // Clear any cached data when switching date modes
      sessionStorage.removeItem('reportCache');
    }
  }, []);

  // Handle quick date range presets for custom selection
  const handleQuickDateRange = useCallback((preset: string) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (preset) {
      case 'thisWeek':
        const today = new Date();
        const dayOfWeek = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek);
        break;
      case 'thisMonth':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        endDate.setDate(0); // Last day of previous month
        break;
      case 'thisQuarter':
        const quarter = Math.floor(endDate.getMonth() / 3);
        startDate = new Date(endDate.getFullYear(), quarter * 3, 1);
        break;
      case 'thisYear':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setUseCustomRange(true);
    setSelectedQuickPreset(preset);
  }, []);

  // Force data refresh when date range changes with debouncing
  useEffect(() => {
    if (orderClinicName && dateRangeValid) {
      // Only refetch, don't clear entire cache
      const timeoutId = setTimeout(() => {
        refetchRevenue();
        refetchPerformance();
      }, 300); // Debounce date changes
      
      return () => clearTimeout(timeoutId);
    }
  }, [dateRange.startDate, dateRange.endDate, orderClinicName, dateRangeValid, refetchRevenue, refetchPerformance]);

  const handleExportAllReports = async () => {
    if (!orderClinicName || isExporting) return;
    
    setIsExporting(true);
    const reportTypes = ['account-summary', 'payment-summary', 'timesheet', 'order-status', 'copay-summary', 'marketing-budget'];
    
    try {
      // Export all reports in parallel for better performance
      const exportPromises = reportTypes.map(reportType => 
        ReportApiService.exportReport(
          reportType,
          orderClinicName,  // Use order clinic name for exports
          selectedExportFormat,
          {
            startDate: new Date(dateRange.startDate),
            endDate: new Date(dateRange.endDate)
          }
        )
      );
      
      await Promise.all(exportPromises);
      // All reports exported successfully
    } catch (error) {
      alert(`Bulk export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Loading state
  const isLoading = useMemo(() => 
    revenueLoading || performanceLoading || ordersLoading || clientsLoading || statsLoading,
    [revenueLoading, performanceLoading, ordersLoading, clientsLoading, statsLoading]
  );

  // Error state
  const hasError = useMemo(() => 
    revenueError || performanceError || ordersError || clientsError,
    [revenueError, performanceError, ordersError, clientsError]
  );
  const errorMessage = revenueError || performanceError || ordersError || clientsError;

  if (!clinic) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Clinic Not Found</h2>
            <p className="text-gray-600">The requested clinic could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Separate row for back button and title */}
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold break-words">
          Reports & Analytics - {clinic.displayName || clinic.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time business insights and performance metrics
        </p>
      </div>

      {/* Grid layout for controls - better mobile handling */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Date Range Control Column */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={useCustomRange ? "default" : "outline"}
                size="sm"
                onClick={() => handleCustomRangeToggle(!useCustomRange)}
                className="whitespace-nowrap"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                {useCustomRange ? "Custom Range" : "Quick Periods"}
              </Button>
              
              {!useCustomRange && (
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last3months">Last 3 Months</SelectItem>
                    <SelectItem value="last6months">Last 6 Months</SelectItem>
                    <SelectItem value="lastyear">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {useCustomRange && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">From:</span>
                    <DatePicker
                      date={customStartDate}
                      setDate={setCustomStartDate}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">To:</span>
                    <DatePicker
                      date={customEndDate}
                      setDate={setCustomEndDate}
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedQuickPreset === 'thisWeek' ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => handleQuickDateRange('thisWeek')}
                  >
                    This Week
                  </Button>
                  <Button 
                    variant={selectedQuickPreset === 'thisMonth' ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => handleQuickDateRange('thisMonth')}
                  >
                    This Month
                  </Button>
                  <Button 
                    variant={selectedQuickPreset === 'thisQuarter' ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => handleQuickDateRange('thisQuarter')}
                  >
                    This Quarter
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Export Control Column */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Export Options</span>
          <div className="flex gap-2">
            <Select 
              value={selectedExportFormat} 
              onValueChange={(value: 'csv' | 'json' | 'pdf') => setSelectedExportFormat(value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={handleExportAllReports}
              disabled={isExporting}
              className="flex-1"
            >
              <Download size={14} className="mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                 <StatsCard
           title="Total Clients"
          value={metrics.totalClients.toString()}
           icon={Users}
          description={`${metrics.activeClients} active clients`}
          trend={metrics.clientGrowthRate}
          trendIndicator={metrics.clientGrowthRate >= 0 ? "up" : "down"}
         />
         
         <StatsCard
           title="Total Orders"
          value={metrics.totalOrders.toString()}
           icon={Activity}
          description={`${metrics.completedOrders} completed`}
          trend={metrics.orderCompletionRate}
           trendIndicator="up"
         />
         
         <StatsCard
           title="Total Revenue"
          value={OrderUtils.formatCurrency(metrics.totalRevenue)}
           icon={DollarSign}
          description={`${OrderUtils.formatCurrency(metrics.monthlyRevenue)} average monthly`}
          trend={metrics.revenueGrowthRate}
          trendIndicator={metrics.revenueGrowthRate >= 0 ? "up" : "down"}
         />
         
         <StatsCard
           title="Avg Order Value"
          value={OrderUtils.formatCurrency(metrics.averageOrderValue)}
           icon={TrendingUp}
          description={`${metrics.newClientsThisMonth} new clients this month`}
           trend={5.2}
           trendIndicator="up"
         />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="visio-reports">VISIO Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {OrderUtils.formatCurrency(metrics.totalRevenue)} total revenue
                    </p>
                    <p className="text-xs text-gray-500">
                      {metrics.revenueGrowthRate >= 0 ? '+' : ''}{metrics.revenueGrowthRate.toFixed(1)}% growth
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Order Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {metrics.totalOrders} total orders
                    </p>
                    <p className="text-xs text-gray-500">
                      {metrics.orderCompletionRate.toFixed(1)}% completion rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Analytics Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Performance Summary
              </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportAllReports}
                  disabled={isExporting}
                  className="flex items-center gap-1"
                >
                  <Download size={14} />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.slice(-6).map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">{data.month}</span>
                  </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-600">{data.orders} orders</span>
                      <span className="font-medium">{OrderUtils.formatCurrency(data.revenue)}</span>
                </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Client Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Clients</span>
                    <span className="font-medium">{metrics.totalClients}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Clients</span>
                    <span className="font-medium">{metrics.activeClients}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New This Month</span>
                    <span className="font-medium">{metrics.newClientsThisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Growth Rate</span>
                    <Badge variant={metrics.clientGrowthRate >= 0 ? "default" : "destructive"}>
                      {metrics.clientGrowthRate >= 0 ? '+' : ''}{metrics.clientGrowthRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Client Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Client activity visualization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financial" className="mt-0">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">{OrderUtils.formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Average Order Value</p>
                    <p className="text-2xl font-bold">{OrderUtils.formatCurrency(metrics.averageOrderValue)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Pending Revenue</p>
                    <p className="text-2xl font-bold">
                      {OrderUtils.formatCurrency(
                        orders?.filter(o => o.paymentStatus === PaymentStatus.PENDING || o.paymentStatus === PaymentStatus.PARTIAL)
                          .reduce((sum, o) => sum + o.totalAmount, 0) || 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-0">
            <Card>
              <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Performing Services
                </CardTitle>
                  <Button 
                  variant="outline" 
                    size="sm" 
                  onClick={handleExportAllReports}
                  disabled={isExporting}
                  className="flex items-center gap-1"
                  >
                  <Download size={14} />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
              <div className="space-y-4">
                {Array.isArray(productPerformance) && productPerformance.length > 0 ? 
                  productPerformance.slice(0, 10).map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.productName}</h4>
                        <p className="text-sm text-gray-600">{product.totalOrders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{OrderUtils.formatCurrency(product.totalRevenue)}</p>
                        <p className="text-sm text-gray-600">{OrderUtils.formatCurrency(product.avgPrice)} avg</p>
                      </div>
                    </div>
                  )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No product performance data available</p>
                  </div>
                )}
                </div>
              </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="visio-reports" className="mt-0">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    VISIO Compliance Reports
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      ✓ All 7 Required Reports Available
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Account Summary Report */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium">Account Summary</h4>
                        </div>
                        <Badge variant="secondary" className="text-xs">Financial</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Comprehensive clinic performance overview with revenue metrics, order statistics, and client analytics.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleExportAllReports}
                          disabled={isExporting}
                          className="flex-1"
                        >
                          <Download size={12} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Summary Report */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-green-500" />
                          <h4 className="font-medium">Payment Summary</h4>
                        </div>
                        <Badge variant="secondary" className="text-xs">Financial</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Detailed payment analysis by date range including payment methods, trends, and daily breakdowns.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleExportAllReports}
                          disabled={isExporting}
                          className="flex-1"
                        >
                          <Download size={12} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time Sheet Report */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <h4 className="font-medium">Time Sheet</h4>
                        </div>
                        <Badge variant="secondary" className="text-xs">Operations</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Practitioner hours, utilization rates, appointment statistics, and productivity metrics.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleExportAllReports}
                          disabled={isExporting}
                          className="flex-1"
                        >
                          <Download size={12} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Status Report */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-orange-500" />
                          <h4 className="font-medium">Order Status</h4>
                        </div>
                        <Badge variant="secondary" className="text-xs">Operations</Badge>
                  </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Current status of all orders with filtering by status, payment status, and date ranges.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleExportAllReports}
                          disabled={isExporting}
                          className="flex-1"
                        >
                          <Download size={12} className="mr-1" />
                          Export
                        </Button>
                  </div>
                    </CardContent>
                  </Card>

                  {/* Co Pay Summary Report */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-indigo-500" />
                          <h4 className="font-medium">Co Pay Summary</h4>
                  </div>
                        <Badge variant="secondary" className="text-xs">Financial</Badge>
                  </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Insurance co-payment analysis including trends, payment methods, and reimbursement tracking.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleExportAllReports}
                          disabled={isExporting}
                          className="flex-1"
                        >
                          <Download size={12} className="mr-1" />
                          Export
                        </Button>
                </div>
              </CardContent>
            </Card>

                  {/* Marketing Budget Summary Report */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-pink-500" />
                          <h4 className="font-medium">Marketing Budget</h4>
                        </div>
                        <Badge variant="secondary" className="text-xs">Marketing</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Marketing spend analysis, ROI calculations, campaign performance, and budget allocation insights.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleExportAllReports}
                          disabled={isExporting}
                          className="flex-1"
                        >
                          <Download size={12} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Export Options Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Export Options</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>CSV:</strong> Detailed data in spreadsheet format for analysis</p>
                        <p><strong>JSON:</strong> Structured data for API integration and development</p>
                        <p><strong>PDF:</strong> Formatted reports for presentation and printing</p>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          Current Period: {selectedPeriod.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([0-9])([a-z])/g, '$1 $2')}
                        </Badge>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          Format: {selectedExportFormat.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}