'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  ArrowLeft, 
  TrendingUp, 
  Users,
  DollarSign,
  Activity,
  FileText,
  Download,
  Filter
} from 'lucide-react';
import { slugToClinic } from '@/lib/data/clinics';
import { generateLink } from '@/lib/route-utils';
import { MockDataService } from '@/lib/data/mockDataService';
import { StatsCard } from '@/components/ui/cards/StatsCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const clinic = slugToClinic(clinicSlug);

  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('last6months');

  useEffect(() => {
    const fetchReportsData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        if (clinic) {
          // Get real data from MockDataService
          const clients = MockDataService.getClientsByClinic(clinic.name);
          const orders = MockDataService.getOrdersByClinic(clinic.name);
          
          // Calculate metrics
          const totalClients = clients.length;
          // Since MockDataService Client interface doesn't have status, assume most clients are active
          const activeClients = Math.floor(totalClients * 0.85);
          const newClientsThisMonth = Math.floor(totalClients * 0.15); // Simulate new clients
          
          const totalOrders = orders.length;
          const completedOrders = orders.filter(o => o.status === 'paid').length;
          const pendingOrders = orders.filter(o => o.status === 'unpaid' || o.status === 'partially paid').length;
          
          const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
          const monthlyRevenue = Math.floor(totalRevenue * 0.25); // Simulate monthly revenue
          const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
          
          // Calculate growth rates (simulated)
          const clientGrowthRate = 8.5;
          const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
          const revenueGrowthRate = 12.3;

          setMetrics({
            totalClients,
            activeClients,
            newClientsThisMonth,
            totalOrders,
            completedOrders,
            pendingOrders,
            totalRevenue,
            monthlyRevenue,
            averageOrderValue,
            clientGrowthRate,
            orderCompletionRate,
            revenueGrowthRate
          });

          // Generate chart data for the last 6 months
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
          const chartData = months.map((month, index) => ({
            month,
            clients: Math.floor(totalClients * (0.7 + index * 0.05)),
            orders: Math.floor(totalOrders * (0.6 + index * 0.07)),
            revenue: Math.floor(monthlyRevenue * (0.8 + index * 0.04))
          }));
          
          setChartData(chartData);
        }
        setIsLoading(false);
      }, 1000);
    };

    fetchReportsData();
  }, [clinic, clinicSlug]);

  const handleBack = () => {
    router.push(generateLink('clinic', '', clinicSlug));
  };

  const handleExportReport = (type: string) => {
    // Simulate report export
    console.log(`Exporting ${type} report for ${clinic?.displayName}`);
    alert(`${type} report export started. You will receive an email when ready.`);
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Reports & Analytics - {clinic?.displayName || clinicSlug}
            </h1>
            <p className="text-gray-600 mt-1">
              Business insights and performance metrics
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-48">
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
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => handleExportReport('Summary')}
          >
            <Download size={16} />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                 <StatsCard
           title="Total Clients"
           value={metrics?.totalClients.toString() || '0'}
           icon={Users}
           description={`${metrics?.activeClients || 0} active clients`}
           trend={metrics?.clientGrowthRate}
           trendIndicator="up"
         />
         
         <StatsCard
           title="Total Orders"
           value={metrics?.totalOrders.toString() || '0'}
           icon={Activity}
           description={`${metrics?.completedOrders || 0} completed`}
           trend={metrics?.orderCompletionRate}
           trendIndicator="up"
         />
         
         <StatsCard
           title="Total Revenue"
           value={`$${metrics?.totalRevenue?.toLocaleString() || '0'}`}
           icon={DollarSign}
           description={`$${metrics?.monthlyRevenue?.toLocaleString() || '0'} this month`}
           trend={metrics?.revenueGrowthRate}
           trendIndicator="up"
         />
         
         <StatsCard
           title="Avg Order Value"
           value={`$${metrics?.averageOrderValue?.toFixed(0) || '0'}`}
           icon={TrendingUp}
           description={`${metrics?.newClientsThisMonth || 0} new clients this month`}
           trend={5.2}
           trendIndicator="up"
         />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="operational">Operational Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Client Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Client Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {chartData.length > 0 ? 
                        `${chartData[chartData.length - 1]?.clients || 0} clients this month` :
                        'Chart visualization would go here'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
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
                    <p className="text-sm text-gray-600">
                      ${metrics?.revenueGrowthRate?.toFixed(1) || 0}% growth this period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics?.orderCompletionRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-gray-600">Order Completion Rate</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics?.clientGrowthRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-gray-600">Client Growth Rate</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((metrics?.activeClients || 0) / (metrics?.totalClients || 1) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600">Client Retention Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Clients</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {metrics?.activeClients || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Inactive Clients</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {(metrics?.totalClients || 0) - (metrics?.activeClients || 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New This Month</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {metrics?.newClientsThisMonth || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Client activity chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financial" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Revenue</span>
                    <span className="font-semibold">${metrics?.totalRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Revenue</span>
                    <span className="font-semibold">${metrics?.monthlyRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Order Value</span>
                    <span className="font-semibold">${metrics?.averageOrderValue?.toFixed(0) || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Trends</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExportReport('Financial')}
                  >
                    <FileText size={14} className="mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Revenue trend visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="operational" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Orders</span>
                    <span className="font-semibold">{metrics?.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed Orders</span>
                    <span className="font-semibold text-green-600">{metrics?.completedOrders || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Orders</span>
                    <span className="font-semibold text-yellow-600">{metrics?.pendingOrders || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-semibold">{metrics?.orderCompletionRate?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Efficiency metrics visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handleExportReport('Client Summary')}
            >
              <Download size={16} />
              Client Report
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handleExportReport('Financial Summary')}
            >
              <Download size={16} />
              Financial Report
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handleExportReport('Operational Summary')}
            >
              <Download size={16} />
              Operations Report
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handleExportReport('Custom Report')}
            >
              <Download size={16} />
              Custom Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}