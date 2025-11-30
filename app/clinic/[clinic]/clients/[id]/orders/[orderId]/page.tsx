'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Package, 
  FileText, 
  Phone, 
  Mail,
  Edit,
  Printer,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useClinic } from '@/lib/contexts/clinic-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { generateLink } from '@/lib/route-utils';

// Import real API hooks and utilities
import { 
  useOrder, 
  useClient, 
  useOrdersByClient,
  OrderUtils,
  OrderStatus,
  PaymentStatus,
  type Order,
  type OrderLineItem
} from "@/lib/hooks";

export default function ViewClientOrderPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const clientId = parseInt(params.id as string);
  const orderId = params.orderId as string;
  
  // Get clinic data from context
  const { availableClinics } = useClinic();
  const clinicData = useMemo(() => availableClinics.find(c => c.name === clinic), [availableClinics, clinic]);
  
  // Fetch order using real API
  const { 
    order, 
    loading: orderLoading, 
    error: orderError,
    refetch: refetchOrder
  } = useOrder({
    id: orderId,
    autoFetch: !!orderId
  });

  // Fetch client data for comprehensive information
  const { 
    client, 
    loading: clientLoading,
    error: clientError
  } = useClient({
    id: clientId,
    autoFetch: !!clientId
  });

  // Fetch client's order history for context
  const { 
    orders: clientOrderHistory, 
    loading: historyLoading
  } = useOrdersByClient({
    clientId: clientId,
    autoFetch: !!clientId
  });

  const handleBack = () => {
    router.push(generateLink('clinic', `clients/${clientId}`, clinic));
  };

  const handleEdit = () => {
    router.push(generateLink('clinic', `clients/${clientId}/orders/${orderId}/edit`, clinic));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Future implementation for PDF generation
    console.log('Download functionality will be implemented');
  };

  // Loading state
  if (orderLoading || clientLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="text-lg text-gray-600">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (orderError || clientError) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Order</h3>
            <p className="mt-1 text-sm text-gray-500">
              {orderError || clientError}
            </p>
            <div className="mt-4 space-x-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Client
              </Button>
              <Button onClick={refetchOrder}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Order Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The requested order could not be found.
            </p>
            <Button variant="outline" onClick={handleBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Client
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate order summary
  const orderSummary = {
    totalItems: order.items.length,
    totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
    // subtotal calculation removed (no tax structure needed for healthcare)
    totalDuration: order.totalDuration || order.items.reduce((sum, item) => sum + item.duration, 0)
  };

  // Get status colors and icons
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case OrderStatus.IN_PROGRESS:
        return <Clock className="h-5 w-5 text-blue-600" />;
      case OrderStatus.SCHEDULED:
        return <Calendar className="h-5 w-5 text-yellow-600" />;
      case OrderStatus.CANCELLED:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case OrderStatus.NO_SHOW:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case PaymentStatus.PARTIAL:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case PaymentStatus.PENDING:
        return <Clock className="h-5 w-5 text-orange-600" />;
      case PaymentStatus.OVERDUE:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case PaymentStatus.REFUNDED:
        return <RefreshCw className="h-5 w-5 text-purple-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Client
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              {clinicData?.name || clinic} • {client?.firstName} {client?.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2 flex-1 sm:flex-none no-print"
          >
            <Printer size={16} />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Download size={16} />
            Download
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Order Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <Badge className={OrderUtils.getStatusColor(order.status)}>
                    {OrderUtils.getStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Order Number:</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Order Date:</span>
                    <span className="text-sm">{OrderUtils.formatDate(order.orderDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Service Date:</span>
                    <span className="text-sm">{OrderUtils.formatDate(order.serviceDate)}</span>
                  </div>
                  {order.endDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">End Date:</span>
                      <span className="text-sm">{OrderUtils.formatDate(order.endDate)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Payment Status:</span>
                    <div className="flex items-center gap-2">
                      {getPaymentStatusIcon(order.paymentStatus)}
                      <Badge className={OrderUtils.getPaymentStatusColor(order.paymentStatus)}>
                        {OrderUtils.getPaymentStatusLabel(order.paymentStatus)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Total Items:</span>
                    <span className="text-sm">{orderSummary.totalItems}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">{orderSummary.totalDuration} minutes</span>
                  </div>
                  {order.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Location:</span>
                      <span className="text-sm">{order.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {order.description && (
                <div className="mt-4">
                  <span className="text-sm font-medium">Description:</span>
                  <p className="text-sm text-gray-600 mt-1">{order.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: OrderLineItem, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Quantity:</span> {item.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {item.duration} min
                          </div>
                          <div>
                            <span className="font-medium">Unit Price:</span> {OrderUtils.formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {OrderUtils.formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total Amount:</span>
                      <span>{OrderUtils.formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          {(order.billDate || order.invoiceDate || order.readyToBill) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign size={20} />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {order.readyToBill && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Ready to Bill</span>
                    </div>
                  )}
                  {order.billDate && (
                    <div>
                      <span className="text-sm font-medium">Bill Date:</span>
                      <p className="text-sm text-gray-600">{OrderUtils.formatDate(order.billDate)}</p>
                    </div>
                  )}
                  {order.invoiceDate && (
                    <div>
                      <span className="text-sm font-medium">Invoice Date:</span>
                      <p className="text-sm text-gray-600">{OrderUtils.formatDate(order.invoiceDate)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
            <CardContent>
              {client ? (
                <div className="space-y-3">
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
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{client.address}</span>
                    </div>
                  )}

                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(generateLink('clinic', `clients/${clientId}`, clinic))}
                    >
                      View Client Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Client information not available</div>
              )}
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
                  <p className="font-medium">{order.clinicName}</p>
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

          {/* Order History Summary */}
          {!historyLoading && clientOrderHistory && clientOrderHistory.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase size={20} />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>Total Orders: <span className="font-medium">{clientOrderHistory.length}</span></p>
                    <p>Completed: <span className="font-medium text-green-600">
                      {clientOrderHistory.filter(o => o.status === OrderStatus.COMPLETED).length}
                    </span></p>
                    <p>In Progress: <span className="font-medium text-blue-600">
                      {clientOrderHistory.filter(o => o.status === OrderStatus.IN_PROGRESS).length}
                    </span></p>
                  </div>
                  
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(generateLink('clinic', `clients/${clientId}`, clinic))}
                    >
                      View All Orders
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start no-print"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Order
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(generateLink('clinic', 'orders', clinic))}
              >
                <Package className="h-4 w-4 mr-2" />
                All Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 