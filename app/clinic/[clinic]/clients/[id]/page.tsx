'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Package, 
  Phone, 
  Mail,
  Edit,
  Plus,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Building,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Search,
  Download,
  Eye,
  Shield
} from 'lucide-react';
import { useClinic } from '@/lib/contexts/clinic-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { generateLink } from '@/lib/route-utils';
import { InsuranceSummaryCard } from '@/components/ui/client/InsuranceSection';

// Import real API hooks and utilities
import { 
  useClient, 
  useOrdersByClient,
  useAppointments,
  OrderUtils,
  OrderStatus,
} from "@/lib/hooks";

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const clientId = params.id as string;
  
  // State for order filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // State for appointment pagination
  const [appointmentPage, setAppointmentPage] = useState(1);
  const appointmentsPerPage = 10;

  // Get clinic data from context
  const { availableClinics } = useClinic();
  const clinicData = useMemo(() => availableClinics.find(c => c.name === clinic), [availableClinics, clinic]);
  
  // Fetch client data
  const { 
    client, 
    loading: clientLoading, 
    error: clientError,
    refetch: refetchClient
  } = useClient({
    clientId: clientId,
    autoFetch: !!clientId
  });

  // State to control when to load orders and appointments
  const [shouldLoadOrders, setShouldLoadOrders] = useState(true);
  // Auto-load appointments on client detail page to show accurate statistics
  const [shouldLoadAppointments] = useState(true);

  // Fetch client's order history only when needed
  const { 
    orders, 
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useOrdersByClient({
    clientId: parseInt(clientId),
    autoFetch: shouldLoadOrders && !!clientId && !isNaN(parseInt(clientId))
  });

  // Get real clinic name for API calls (maps slug to backend clinic name)
  const clinicName = clinicData?.backendName || clinicData?.displayName || clinic;

  // Fetch client's appointments automatically to show accurate statistics
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    pagination: appointmentPagination,
    refetch: refetchAppointments
  } = useAppointments({
    clinicName,
    clientId,
    page: appointmentPage,
    limit: appointmentsPerPage,
    autoFetch: shouldLoadAppointments && !!clientId && !!clinicName
  });

  const handleBack = () => {
    router.push(generateLink('clinic', 'clients', clinic));
  };

  const handleEditClient = () => {
    router.push(generateLink('clinic', `clients/${clientId}/edit`, clinic));
  };

  const handleCreateOrder = () => {
    router.push(generateLink('clinic', 'orders/new', clinic));
  };

  const handleViewOrder = (orderId: string) => {
    router.push(generateLink('clinic', `clients/${clientId}/orders/${orderId}`, clinic));
  };

  const handleEditOrder = (orderId: string) => {
    router.push(generateLink('clinic', `clients/${clientId}/orders/${orderId}/edit`, clinic));
  };

  // Appointment handlers
  const handleNewAppointment = () => {
    router.push(generateLink('clinic', 'appointments/new', clinic) + `?clientId=${clientId}`);
  };

  const handleViewAppointment = (appointmentId: string | number) => {
    router.push(generateLink('clinic', `appointments/${appointmentId}`, clinic));
  };

  const handleEditAppointment = (appointmentId: string | number) => {
    router.push(generateLink('clinic', `appointments/${appointmentId}/edit`, clinic));
  };

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.description?.toLowerCase().includes(query) ||
        order.items.some(item => item.productName.toLowerCase().includes(query))
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Sort by most recent first
    return filtered.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Calculate client statistics
  const clientStats = useMemo(() => {
    if (!orders) return { totalOrders: 0, completedOrders: 0, totalSpent: 0, avgOrderValue: 0 };
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    return { totalOrders, completedOrders, totalSpent, avgOrderValue };
  }, [orders]);

  // Calculate client appointment statistics
  const appointmentStats = useMemo(() => {
    // Use total from pagination for accurate count, current page data for other stats
    const totalAppointments = appointmentPagination?.total || appointments?.length || 0;
    
    if (!appointments || appointments.length === 0) {
      return {
        totalAppointments,
        completedAppointments: 0,
        upcomingAppointments: 0,
        cancelledAppointments: 0
      };
    }

    const completed = appointments.filter(apt => apt.status === 1); // Completed status
    const upcoming = appointments.filter(apt => apt.status === 0 && new Date(apt.startDate) > new Date()); // Scheduled and future
    const cancelled = appointments.filter(apt => apt.status === 2); // Cancelled status

    return {
      totalAppointments,
      completedAppointments: completed.length,
      upcomingAppointments: upcoming.length,
      cancelledAppointments: cancelled.length
    };
  }, [appointments, appointmentPagination]);

  // Get appointment ID helper
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getAppointmentId = (appointment: any): string | number => {
    return appointment.appointmentId || appointment._id || appointment.id;
  };

  // Get status icon and color
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case OrderStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-blue-600" />;
      case OrderStatus.SCHEDULED:
        return <Calendar className="h-4 w-4 text-yellow-600" />;
      case OrderStatus.CANCELLED:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case OrderStatus.NO_SHOW:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Loading state
  if (clientLoading || ordersLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="text-lg text-gray-600">Loading client information...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (clientError || ordersError) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Client</h3>
            <p className="mt-1 text-sm text-gray-500">
              {clientError || ordersError}
            </p>
            <div className="mt-4 space-x-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
              <Button onClick={() => { refetchClient(); refetchOrders(); refetchAppointments(); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client not found
  if (!client) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Client Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The requested client could not be found.
            </p>
            <Button variant="outline" onClick={handleBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Clients
          </Button>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
          {client.firstName} {client.lastName}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {clinicData?.name || clinic} • Client ID: {client.clientId}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClient}
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Client
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleNewAppointment}
            className="flex items-center gap-2"
          >
            <Calendar size={16} />
            Schedule
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleCreateOrder}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            New Order
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Statistics */}
          <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-6">
            {/* Order Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{clientStats.totalOrders}</p>
                    <p className="text-xs text-gray-600">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{clientStats.completedOrders}</p>
                    <p className="text-xs text-gray-600">Completed Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Appointment Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{appointmentStats.totalAppointments}</p>
                    <p className="text-xs text-gray-600">Total Appointments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{appointmentStats.upcomingAppointments}</p>
                    <p className="text-xs text-gray-600">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {OrderUtils.formatCurrency(clientStats.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-600">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {OrderUtils.formatCurrency(clientStats.avgOrderValue)}
                    </p>
                    <p className="text-xs text-gray-600">Avg Order</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Appointments ({appointmentsLoading ? '...' : appointmentPagination?.total || appointments?.length || 0})
                </CardTitle>
                
                <Button
                  onClick={handleNewAppointment}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  New Appointment
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-gray-600">Loading appointments...</span>
                  </div>
                </div>
              ) : appointmentsError ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-300" />
                  <p className="mt-2">Error loading appointments: {appointmentsError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetchAppointments}
                    className="mt-4"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : !appointments || appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2">No appointments found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewAppointment}
                    className="mt-4"
                  >
                    <Plus size={16} className="mr-2" />
                    Schedule First Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const appointmentId = getAppointmentId(appointment);
                    const isUpcoming = new Date(appointment.startDate) > new Date();
                    const isCompleted = appointment.status === 1;
                    
                    return (
                      <div key={appointment.id || appointmentId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {appointment.subject || 'Appointment'}
                              </h4>
                              <Badge className={`${
                                isCompleted ? 'bg-green-100 text-green-800' : 
                                isUpcoming ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isCompleted ? 'Completed' : isUpcoming ? 'Upcoming' : 'Past'}
                              </Badge>
                            </div>
                            
                            <div className="grid gap-2 sm:grid-cols-3 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(appointment.startDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {new Date(appointment.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {new Date(appointment.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {appointment.resourceName || 'Resource'}
                              </div>
                            </div>
                            
                            {appointment.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <MapPin className="h-4 w-4" />
                                {appointment.location}
                              </div>
                            )}
                            
                            {appointment.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {appointment.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="ml-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAppointment(appointmentId)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAppointment(appointmentId)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Appointments Pagination */}
              {appointmentPagination && appointmentPagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppointmentPage(prev => Math.max(1, prev - 1))}
                    disabled={appointmentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {appointmentPage} of {appointmentPagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppointmentPage(prev => Math.min(appointmentPagination.pages, prev + 1))}
                    disabled={appointmentPage === appointmentPagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order History */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Order History {shouldLoadOrders ? `(${filteredOrders.length})` : ''}
                </CardTitle>
                
                {!shouldLoadOrders && (
                  <Button 
                    onClick={() => setShouldLoadOrders(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Load Order History
                  </Button>
                )}
                
                {shouldLoadOrders && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.values(OrderStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {OrderUtils.getStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!shouldLoadOrders ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2">Click &quot;Load Order History&quot; to view client orders</p>
                  </div>
                ) : ordersLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                    <p className="mt-2 text-gray-500">Loading order history...</p>
                  </div>
                ) : paginatedOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2">
                      {searchQuery || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateOrder}
                        className="mt-4"
                      >
                        <Plus size={16} className="mr-2" />
                        Create First Order
                      </Button>
                    )}
                  </div>
                ) : (
                  paginatedOrders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              Order #{order.orderNumber}
                            </h4>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <Badge className={OrderUtils.getStatusColor(order.status)}>
                                {OrderUtils.getStatusLabel(order.status)}
                              </Badge>
                            </div>
                            <Badge className={OrderUtils.getPaymentStatusColor(order.paymentStatus)}>
                              {OrderUtils.getPaymentStatusLabel(order.paymentStatus)}
                            </Badge>
                          </div>
                          
                          <div className="grid gap-2 sm:grid-cols-3 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {OrderUtils.formatDate(order.serviceDate)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {order.totalDuration || order.items.reduce((sum, item) => sum + item.duration, 0)} min
                            </div>
                          </div>
                          
                          {order.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {order.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Created: {OrderUtils.formatDate(order.orderDate)}</span>
                            {order.location && <span>Location: {order.location}</span>}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-gray-900 mb-2">
                            {OrderUtils.formatCurrency(order.totalAmount)}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(order._id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditOrder(order._id)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-lg">
                  {client.firstName} {client.lastName}
                </p>
                <p className="text-sm text-gray-600">ID: {client.clientId}</p>
              </div>
              
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.email}</span>
                </div>
              )}
              
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.phone}</span>
                </div>
              )}
              
              {client.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm">{client.address}</span>
                </div>
              )}
              
              {client.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Born: {new Date(client.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleEditClient}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Client Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information - Always visible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Insurance Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.insurance && client.insurance.length > 0 ? (
                // Display existing insurance information
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                client.insurance.map((insurance: any, index: number) => (
                  <InsuranceSummaryCard 
                    key={index}
                    insurance={{
                      type: insurance.type,
                      company: insurance.company,
                      certificateNumber: insurance.certificateNumber,
                      policyHolder: insurance.policyHolder,
                      policyHolderName: insurance.policyHolderName,
                      groupNumber: insurance.groupNumber,
                      dpa: insurance.dpa,
                      cob: insurance.cob,
                      coverage: {
                        physiotherapy: insurance.coverage?.physiotherapy,
                        massage: insurance.coverage?.massage,
                        orthopedicShoes: insurance.coverage?.orthopedicShoes,
                        compressionStockings: insurance.coverage?.compressionStockings,
                        other: insurance.coverage?.other,
                      }
                    }}
                  />
                ))
              ) : (
                // Prompt to add insurance when none exists
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    No insurance information on file
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(generateLink('clinic', `clients/${clientId}/edit`, clinic))}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Insurance Information
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!shouldLoadOrders ? (
                  <p className="text-sm text-gray-500">Load order history to see recent activity</p>
                ) : ordersLoading ? (
                  <p className="text-sm text-gray-500">Loading recent activity...</p>
                ) : orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="truncate">Order #{order.orderNumber}</span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {OrderUtils.formatDate(order.orderDate)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleCreateOrder}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Order
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleEditClient}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Client
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(generateLink('clinic', 'clients', clinic))}
              >
                <User className="h-4 w-4 mr-2" />
                All Clients
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {/* TODO: Implement export */}}
              >
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
            </CardContent>
          </Card>

          {/* Clinic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building size={20} />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">{clinicData?.name || clinic}</p>
                </div>
                {clinicData && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">{clinicData.address}</p>
                      <p className="text-sm text-gray-600">
                        {clinicData.city}, {clinicData.province} {clinicData.postalCode}
                      </p>
                    </div>
                    {clinicData.description && (
                      <div>
                        <p className="text-sm text-gray-600">{clinicData.description}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
