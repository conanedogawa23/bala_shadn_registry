"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { ArrowLeft, Edit2, Printer, FileText, DollarSign, User, Calendar, AlertCircle, Package } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateLink } from "@/lib/route-utils";
import { slugToClinic } from "@/lib/data/clinics";

// Import real API hooks and utilities
import { 
  useOrder, 
  useClient, 
  OrderUtils,
  OrderStatus,
  PaymentStatus
} from "@/lib/hooks";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const orderId = params.id as string;
  
  // Get clinic data for context
  const clinicData = useMemo(() => slugToClinic(clinic), [clinic]);
  
  // Fetch order using real API
  const { 
    order, 
    loading: orderLoading, 
    error: orderError 
  } = useOrder({
    id: orderId,
    autoFetch: !!orderId
  });

  // Fetch client data when we have order client ID
  const { 
    client, 
    loading: clientLoading,
    error: clientError
  } = useClient({
    id: order?.clientId || 0,
    autoFetch: !!order?.clientId
  });

  const isLoading = orderLoading || clientLoading;
  const hasError = orderError || clientError;

  // Handle back navigation
  const handleBack = () => {
    router.push(generateLink('clinic', 'orders', clinic));
  };

  // Handle edit order
  const handleEdit = () => {
    router.push(generateLink('clinic', `orders/${orderId}/edit`, clinic));
  };

  // Handle print invoice
  const handlePrint = () => {
    window.print();
  };

  // Get status badge with our real enums
  const getStatusBadge = (orderStatus: OrderStatus, paymentStatus: PaymentStatus) => {
    const orderColor = OrderUtils.getStatusColor(orderStatus);
    const paymentColor = OrderUtils.getPaymentStatusColor(paymentStatus);
    
    return (
      <div className="flex flex-col gap-1">
        <Badge className={`${orderColor} text-xs`}>
          {orderStatus === OrderStatus.SCHEDULED && "Scheduled"}
          {orderStatus === OrderStatus.IN_PROGRESS && "In Progress"}
          {orderStatus === OrderStatus.COMPLETED && "Completed"}
          {orderStatus === OrderStatus.CANCELLED && "Cancelled"}
          {orderStatus === OrderStatus.NO_SHOW && "No Show"}
        </Badge>
        <Badge className={`${paymentColor} text-xs`}>
          {paymentStatus === PaymentStatus.PENDING && "Payment Pending"}
          {paymentStatus === PaymentStatus.PARTIAL && "Partially Paid"}
          {paymentStatus === PaymentStatus.PAID && "Paid"}
          {paymentStatus === PaymentStatus.OVERDUE && "Overdue"}
          {paymentStatus === PaymentStatus.REFUNDED && "Refunded"}
        </Badge>
      </div>
    );
  };

  // Calculate tax and totals
  const calculateTotals = () => {
    if (!order) return { subtotal: 0, tax: 0, total: 0, paid: 0, due: 0 };
    
    const subtotal = order.totalAmount;
    const tax = subtotal * 0.13; // 13% HST for Ontario
    const total = subtotal + tax;
    
    // For now, we'll use payment status to estimate paid amount
    let paid = 0;
    let due = total;
    
    if (order.paymentStatus === PaymentStatus.PAID) {
      paid = total;
      due = 0;
    } else if (order.paymentStatus === PaymentStatus.PARTIAL) {
      paid = total * 0.5; // Assume 50% paid for partial
      due = total - paid;
    }
    
    return { subtotal, tax, total, paid, due };
  };

  const totals = calculateTotals();

  // Error state
  if (hasError) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Order</h2>
            <p className="text-gray-600 mb-4">{orderError || clientError}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleBack} variant="outline">Back to Orders</Button>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
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

  if (!order) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-destructive">Order Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The order you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={handleBack} className="mt-4">
              Back to Orders
            </Button>
          </div>
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
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              {formatDate(order.serviceDate)} - {clinicData?.displayName || clinicData?.name || clinic}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start">
          {(order.status === OrderStatus.SCHEDULED || order.status === OrderStatus.IN_PROGRESS) && (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit2 size={16} />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText size={18} />
                Order Summary
              </CardTitle>
              <CardDescription>
                Details of order #{order.orderNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Order Number</div>
                    <div className="font-medium">{order.orderNumber}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Service Date</div>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(order.serviceDate)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div>{getStatusBadge(order.status, order.paymentStatus)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Client</div>
                    <div className="font-medium flex items-center gap-1">
                      <User size={14} />
                      {order.clientName}
                    </div>
                  </div>
                  {order.location && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium">{order.location}</div>
                    </div>
                  )}
                  {order.description && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Description</div>
                      <div className="font-medium">{order.description}</div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Services/Products */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Package size={16} />
                    Services & Products
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start border-b pb-3">
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            Duration: {item.duration} minutes
                          </div>
                          <div className="text-sm mt-1">
                            {OrderUtils.formatCurrency(item.unitPrice)} × {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium">
                          {OrderUtils.formatCurrency(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">Subtotal</div>
                    <div>{OrderUtils.formatCurrency(totals.subtotal)}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">Tax (13% HST)</div>
                    <div>{OrderUtils.formatCurrency(totals.tax)}</div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <div>Total</div>
                    <div>{OrderUtils.formatCurrency(totals.total)}</div>
                  </div>
                  {totals.paid > 0 && (
                    <div className="flex justify-between text-green-600">
                      <div>Paid</div>
                      <div>{OrderUtils.formatCurrency(totals.paid)}</div>
                    </div>
                  )}
                  {totals.due > 0 && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <div>Balance Due</div>
                      <div>{OrderUtils.formatCurrency(totals.due)}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Info */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User size={18} />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {client ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">
                      {client.firstName && client.lastName 
                        ? `${client.firstName} ${client.lastName}` 
                        : client.name || order.clientName}
                    </div>
                  </div>
                  {client.email && (
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{client.email}</div>
                    </div>
                  )}
                  {client.phone && (
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{client.phone}</div>
                    </div>
                  )}
                  {client.dateOfBirth && (
                    <div>
                      <div className="text-sm text-muted-foreground">Date of Birth</div>
                      <div className="font-medium">{formatDate(client.dateOfBirth)}</div>
                    </div>
                  )}
                  {client.gender && (
                    <div>
                      <div className="text-sm text-muted-foreground">Gender</div>
                      <div className="font-medium capitalize">{client.gender}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{order.clientName}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Additional client details not available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar size={18} />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Order Created</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(order.orderDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === OrderStatus.COMPLETED ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium">Service Date</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(order.serviceDate)}
                    </div>
                  </div>
                </div>
                {order.billDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">Billed</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(order.billDate)}
                      </div>
                    </div>
                  </div>
                )}
                {order.invoiceDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">Invoice Generated</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(order.invoiceDate)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {totals.due > 0 && order.status === OrderStatus.COMPLETED && (
            <Card className="shadow-sm border border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-yellow-800">
                  <DollarSign size={18} />
                  Payment Required
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-yellow-700 mb-3">
                  This order has an outstanding balance of {OrderUtils.formatCurrency(totals.due)}.
                </p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    // Navigate to payment processing
                    console.log('Process payment for order:', order._id);
                  }}
                >
                  Process Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}