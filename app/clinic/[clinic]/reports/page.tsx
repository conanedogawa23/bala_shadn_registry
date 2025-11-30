'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
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
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Loader2,
} from 'lucide-react';
import { useClinic } from '@/lib/contexts/clinic-context';
import { generateLink } from '@/lib/route-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import chart components
import { RevenueChart, type RevenueDataPoint } from '@/components/ui/charts/RevenueChart';
import { OrderVolumeChart, type OrderVolumeDataPoint } from '@/components/ui/charts/OrderVolumeChart';
import { TopServicesChart, type ServicePerformanceDataPoint } from '@/components/ui/charts/TopServicesChart';
import { PaymentMethodChart, type PaymentMethodDataPoint } from '@/components/ui/charts/PaymentMethodChart';

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

// Metric Card Component with modern design
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default'
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}) {
  const variantStyles = {
    default: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700',
    success: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800',
    info: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800'
  };

  const iconStyles = {
    default: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    success: 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300',
    info: 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
  };

  return (
    <Card className={`${variantStyles[variant]} border shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1">
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-xs text-muted-foreground ml-1">{trendLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const params = useParams();
  const router = useRouter();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;
  
  // Get clinic data from context (API-provided with correct backendName)
  const { availableClinics } = useClinic();
  const clinic = useMemo(() => {
    // Use case-insensitive matching to handle URL slug variations
    const slugLower = clinicSlug?.toLowerCase().replace(/\s+/g, '') || '';
    return availableClinics.find(c => 
      c.name?.toLowerCase().replace(/\s+/g, '') === slugLower ||
      c.backendName?.toLowerCase().replace(/\s+/g, '') === slugLower ||
      c.displayName?.toLowerCase().replace(/\s+/g, '') === slugLower
    );
  }, [clinicSlug, availableClinics]);
  
  const orderClinicName = useMemo(() => {
    return clinic?.name || "";
  }, [clinic]);

  const backendClinicName = useMemo(() => {
    return clinic?.backendName || clinic?.name || "";
  }, [clinic]);

  const [selectedPeriod, setSelectedPeriod] = useState('last6months');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  
  // Custom date range state
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
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

  // Fetch real analytics data
  const { 
    analytics: revenueAnalytics, 
    loading: revenueLoading, 
    error: revenueError,
    totalRevenue,
    totalOrders: analyticsOrderCount,
    avgOrderValue,
    refetch: refetchRevenue
  } = useRevenueAnalytics({
    clinicName: orderClinicName,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    autoFetch: !!orderClinicName
  });

  const { 
    performance: productPerformance, 
    loading: performanceLoading, 
    error: performanceError,
    refetch: refetchPerformance
  } = useProductPerformance({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    clinicName: orderClinicName,
    autoFetch: !!orderClinicName
  });

  const { 
    orders, 
    loading: ordersLoading, 
    error: ordersError,
    pagination: ordersPagination
  } = useOrdersByClinic({
    clinicName: orderClinicName,
    query: {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    },
    autoFetch: !!orderClinicName
  });

  // Fetch client statistics using aggregation (for reference metrics only)
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
    // Use order pagination total for accurate count, fallback to orders array length
    const totalOrdersCount = ordersPagination?.total || orders?.length || 0;
    const completedOrders = orders?.filter(o => o.status === OrderStatus.COMPLETED).length || 0;
    const pendingOrders = orders?.filter(o => 
      o.paymentStatus === PaymentStatus.PENDING || 
      o.paymentStatus === PaymentStatus.PARTIAL ||
      o.paymentStatus === PaymentStatus.OVERDUE
    ).length || 0;

    // Calculate unique clients from filtered orders (clients with activity in date range)
    const uniqueClientIds = new Set(
      orders?.map(order => order.clientId).filter(Boolean) || []
    );
    const totalClients = uniqueClientIds.size || 0;
    
    // Use all-time client stats for reference metrics
    const allTimeClients = clientStats?.totalClients || totalClients;
    const newClientsThisMonth = clientStats?.newClientsThisMonth || 0;
    const activeClients = clientStats?.activeClients || allTimeClients;

    // Calculate growth rates from analytics data
    const isValidAnalytics = Array.isArray(revenueAnalytics) && revenueAnalytics.length > 1;
    let revenueGrowthRate = 0;
    let clientGrowthRate = 0;

    if (isValidAnalytics) {
      const firstMonth = revenueAnalytics[0];
      const lastMonth = revenueAnalytics[revenueAnalytics.length - 1];
      
      if (firstMonth?.totalRevenue && firstMonth.totalRevenue > 0) {
        revenueGrowthRate = ((lastMonth?.totalRevenue || 0) - firstMonth.totalRevenue) / firstMonth.totalRevenue * 100;
      }
      
      if (firstMonth?.orderCount && firstMonth.orderCount > 0) {
        clientGrowthRate = ((lastMonth?.orderCount || 0) - firstMonth.orderCount) / firstMonth.orderCount * 100;
      }
    }

    const orderCompletionRate = totalOrdersCount > 0 ? (completedOrders / Math.min(totalOrdersCount, orders?.length || 1)) * 100 : 0;

    // Calculate monthly revenue average
    const monthlyRevenue = isValidAnalytics ? 
      revenueAnalytics.reduce((sum, item) => sum + (item.totalRevenue || 0), 0) / revenueAnalytics.length : 
      totalRevenue / 6;

    return {
      totalClients,
      activeClients,
      newClientsThisMonth,
      totalOrders: totalOrdersCount,
      completedOrders,
      pendingOrders,
      totalRevenue: totalRevenue || 0,
      monthlyRevenue: monthlyRevenue || 0,
      averageOrderValue: avgOrderValue || 0,
      clientGrowthRate,
      orderCompletionRate,
      revenueGrowthRate
    };
  }, [revenueAnalytics, orders, ordersPagination, clientStats, totalRevenue, avgOrderValue]);

  // Transform analytics data for charts
  const revenueChartData = useMemo((): RevenueDataPoint[] => {
    if (!revenueAnalytics || revenueAnalytics.length === 0) return [];

    return revenueAnalytics.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: item.totalRevenue || 0,
      orders: item.orderCount || 0
    }));
  }, [revenueAnalytics]);

  const orderVolumeChartData = useMemo((): OrderVolumeDataPoint[] => {
    if (!revenueAnalytics || revenueAnalytics.length === 0) return [];

    return revenueAnalytics.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      orders: item.orderCount || 0,
      completed: item.completedOrders || 0,
      pending: (item.orderCount || 0) - (item.completedOrders || 0)
    }));
  }, [revenueAnalytics]);

  const topServicesChartData = useMemo((): ServicePerformanceDataPoint[] => {
    if (!productPerformance || productPerformance.length === 0) return [];

    return productPerformance.slice(0, 5).map(item => ({
      name: item.productName || 'Unknown Service',
      revenue: item.totalRevenue || 0,
      orders: item.totalOrders || 0,
      avgPrice: item.avgPrice || 0
    }));
  }, [productPerformance]);

  // Payment method data (derived from orders)
  const paymentMethodData = useMemo((): PaymentMethodDataPoint[] => {
    if (!orders || orders.length === 0) return [];

    const methodCounts: Record<string, { count: number; amount: number }> = {};
    
    orders.forEach(order => {
      const status = order.paymentStatus || 'pending';
      if (!methodCounts[status]) {
        methodCounts[status] = { count: 0, amount: 0 };
      }
      methodCounts[status].count += 1;
      methodCounts[status].amount += order.totalAmount || 0;
    });

    const totalAmount = Object.values(methodCounts).reduce((sum, m) => sum + m.amount, 0);

    return Object.entries(methodCounts).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
    }));
  }, [orders]);

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
  }, []);

  // Handle quick date range presets
  const handleQuickDateRange = useCallback((preset: string) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (preset) {
      case 'thisWeek':
        const dayOfWeek = endDate.getDay();
        startDate.setDate(endDate.getDate() - dayOfWeek);
        break;
      case 'thisMonth':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(endDate.getMonth() / 3);
        startDate = new Date(endDate.getFullYear(), quarter * 3, 1);
        break;
      default:
        return;
    }

    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setUseCustomRange(true);
    setSelectedQuickPreset(preset);
  }, []);

  // Force data refresh when date range changes
  useEffect(() => {
    if (orderClinicName) {
      const timeoutId = setTimeout(() => {
        refetchRevenue();
        refetchPerformance();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [dateRange.startDate, dateRange.endDate, orderClinicName, refetchRevenue, refetchPerformance]);

  const handleExportAllReports = async () => {
    if (!orderClinicName || isExporting) return;
    
    setIsExporting(true);
    const reportTypes = ['account-summary', 'payment-summary', 'timesheet', 'order-status', 'copay-summary', 'marketing-budget'];
    
    try {
      const exportPromises = reportTypes.map(reportType => 
        ReportApiService.exportReport(
          reportType,
          orderClinicName,
          selectedExportFormat,
          {
            startDate: new Date(dateRange.startDate),
            endDate: new Date(dateRange.endDate)
          }
        )
      );
      
      await Promise.all(exportPromises);
    } catch (error) {
      alert(`Bulk export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    refetchRevenue();
    refetchPerformance();
  };

  // Loading state
  const isLoading = useMemo(() => 
    revenueLoading || performanceLoading || ordersLoading || statsLoading,
    [revenueLoading, performanceLoading, ordersLoading, statsLoading]
  );

  // Error state
  const hasError = useMemo(() => 
    revenueError || performanceError || ordersError,
    [revenueError, performanceError, ordersError]
  );
  const errorMessage = revenueError || performanceError || ordersError;

  if (!clinic) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Clinic Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">The requested clinic could not be found.</p>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Reports</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                {clinic.displayName || clinic.name} • Real-time business insights
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Date Range Controls */}
        <Card className="mb-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
          <CardContent className="py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
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
                      <SelectTrigger className="w-40">
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
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">From:</span>
                      <DatePicker date={customStartDate} setDate={setCustomStartDate} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">To:</span>
                      <DatePicker date={customEndDate} setDate={setCustomEndDate} />
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant={selectedQuickPreset === 'thisWeek' ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => handleQuickDateRange('thisWeek')}
                      >
                        Week
                      </Button>
                      <Button 
                        variant={selectedQuickPreset === 'thisMonth' ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => handleQuickDateRange('thisMonth')}
                      >
                        Month
                      </Button>
                      <Button 
                        variant={selectedQuickPreset === 'thisQuarter' ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => handleQuickDateRange('thisQuarter')}
                      >
                        Quarter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
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
                  onClick={handleExportAllReports}
                  disabled={isExporting}
                  size="sm"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg shadow-lg flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading analytics...</span>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <MetricCard
            title="Total Clients"
            value={metrics.totalClients.toLocaleString()}
            subtitle={`${metrics.activeClients.toLocaleString()} active`}
            icon={Users}
            trend={metrics.clientGrowthRate}
            trendLabel="vs prev period"
            variant="info"
          />
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders.toLocaleString()}
            subtitle={`${metrics.completedOrders} completed`}
            icon={Activity}
            trend={metrics.orderCompletionRate}
            trendLabel="completion rate"
            variant="success"
          />
          <MetricCard
            title="Total Revenue"
            value={OrderUtils.formatCurrency(metrics.totalRevenue)}
            subtitle={`${OrderUtils.formatCurrency(metrics.monthlyRevenue)} avg/month`}
            icon={DollarSign}
            trend={metrics.revenueGrowthRate}
            trendLabel="vs prev period"
            variant="success"
          />
          <MetricCard
            title="Avg Order Value"
            value={OrderUtils.formatCurrency(metrics.averageOrderValue)}
            subtitle={`${metrics.newClientsThisMonth} new clients this month`}
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-background">
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-background">
              <DollarSign className="h-4 w-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-background">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="visio-reports" className="data-[state=active]:bg-background">
              <FileText className="h-4 w-4 mr-2" />
              VISIO Reports
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <RevenueChart 
                data={revenueChartData} 
                title="Revenue Trend"
                height={320}
              />
              <OrderVolumeChart 
                data={orderVolumeChartData} 
                title="Order Volume"
                height={320}
              />
            </div>

            {/* Monthly Summary Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Monthly Performance Summary
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown by month
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportAllReports}
                    disabled={isExporting}
                  >
                    <Download size={14} className="mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {revenueChartData.length > 0 ? (
                    revenueChartData.slice(-6).reverse().map((data, index) => (
                      <div 
                        key={data.month} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                          <span className="font-medium">{data.month}</span>
                        </div>
                        <div className="flex items-center gap-8 text-sm">
                          <span className="text-muted-foreground">{data.orders} orders</span>
                          <span className="font-semibold">{OrderUtils.formatCurrency(data.revenue)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
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
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-sm text-muted-foreground">Total Clients</span>
                      <span className="font-bold text-lg">{metrics.totalClients.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-sm text-muted-foreground">Active Clients</span>
                      <span className="font-bold text-lg">{metrics.activeClients.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-sm text-muted-foreground">New This Month</span>
                      <span className="font-bold text-lg">{metrics.newClientsThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-sm text-muted-foreground">Growth Rate</span>
                      <Badge variant={metrics.clientGrowthRate >= 0 ? "default" : "destructive"}>
                        {metrics.clientGrowthRate >= 0 ? '+' : ''}{metrics.clientGrowthRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <PaymentMethodChart
                data={paymentMethodData}
                title="Payment Status Distribution"
                height={280}
              />
            </div>
          </TabsContent>
          
          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">{OrderUtils.formatCurrency(metrics.totalRevenue)}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                  <p className="text-3xl font-bold mt-2">{OrderUtils.formatCurrency(metrics.averageOrderValue)}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Pending Revenue</p>
                  <p className="text-3xl font-bold mt-2">
                    {OrderUtils.formatCurrency(
                      orders?.filter(o => 
                        o.paymentStatus === PaymentStatus.PENDING || 
                        o.paymentStatus === PaymentStatus.PARTIAL
                      ).reduce((sum, o) => sum + o.totalAmount, 0) || 0
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            <RevenueChart 
              data={revenueChartData} 
              title="Revenue Over Time"
              height={350}
            />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <TopServicesChart
              data={topServicesChartData}
              title="Top Performing Services"
              height={350}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Service Performance Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(productPerformance) && productPerformance.length > 0 ? 
                    productPerformance.slice(0, 10).map((product, index) => (
                      <div 
                        key={product._id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{product.productName}</h4>
                            <p className="text-sm text-muted-foreground">{product.totalOrders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{OrderUtils.formatCurrency(product.totalRevenue)}</p>
                          <p className="text-sm text-muted-foreground">{OrderUtils.formatCurrency(product.avgPrice)} avg</p>
                        </div>
                      </div>
                    )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No product performance data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* VISIO Reports Tab */}
          <TabsContent value="visio-reports" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      VISIO Compliance Reports
                    </CardTitle>
                    <CardDescription>
                      Export reports for VISIO compliance and business analysis
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓ All Reports Available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { id: 'account-summary', name: 'Account Summary', icon: DollarSign, color: 'blue', desc: 'Revenue metrics and clinic performance' },
                    { id: 'payment-summary', name: 'Payment Summary', icon: CreditCard, color: 'green', desc: 'Payment analysis and trends' },
                    { id: 'timesheet', name: 'Time Sheet', icon: Calendar, color: 'purple', desc: 'Practitioner hours and utilization' },
                    { id: 'order-status', name: 'Order Status', icon: Activity, color: 'orange', desc: 'Current order status breakdown' },
                    { id: 'copay-summary', name: 'Co Pay Summary', icon: DollarSign, color: 'indigo', desc: 'Insurance co-payment analysis' },
                    { id: 'marketing-budget', name: 'Marketing Budget', icon: TrendingUp, color: 'pink', desc: 'Marketing spend and ROI' },
                  ].map((report) => (
                    <Card key={report.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900/30`}>
                            <report.icon className={`h-4 w-4 text-${report.color}-600 dark:text-${report.color}-400`} />
                          </div>
                          <Badge variant="secondary" className="text-xs">Report</Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{report.name}</h4>
                        <p className="text-xs text-muted-foreground mb-4">{report.desc}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => ReportApiService.exportReport(
                            report.id,
                            orderClinicName,
                            selectedExportFormat,
                            { startDate: new Date(dateRange.startDate), endDate: new Date(dateRange.endDate) }
                          )}
                          className="w-full"
                        >
                          <Download size={12} className="mr-2" />
                          Export {selectedExportFormat.toUpperCase()}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Export Information</h4>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <p><strong>CSV:</strong> Spreadsheet format for Excel/Google Sheets</p>
                        <p><strong>JSON:</strong> Structured data for API integration</p>
                        <p><strong>PDF:</strong> Formatted reports for presentation</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                          Period: {selectedPeriod.replace(/([a-z])([A-Z0-9])/g, '$1 $2')}
                        </Badge>
                        <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                          Format: {selectedExportFormat.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
