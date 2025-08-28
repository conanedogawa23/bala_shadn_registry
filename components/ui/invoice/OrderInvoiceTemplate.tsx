"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { PaymentApiService, type Payment, type Order } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

// Props interface for the OrderInvoiceTemplate
interface OrderInvoiceTemplateProps {
  order: Order;
  payments: Payment[] | undefined;
  clinicInfo: {
    name: string;
    displayName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
    fax: string;
  };
  clientInfo: {
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    phone?: string;
    email?: string;
  };
  onDownload?: () => void;
}

// Order header component
const OrderHeader = ({ order, clinicInfo }: { order: Order; clinicInfo: OrderInvoiceTemplateProps['clinicInfo'] }) => (
  <div className="mb-8">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ORDER INVOICE</h1>
        <p className="text-lg text-gray-600">Order #{order.orderNumber}</p>
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold text-primary mb-2">{clinicInfo.displayName || clinicInfo.name}</h2>
        <div className="text-sm text-gray-600">
          <p>{clinicInfo.address}</p>
          <p>{clinicInfo.city}, {clinicInfo.province} {clinicInfo.postalCode}</p>
          {clinicInfo.phone && <p>Phone: {clinicInfo.phone}</p>}
          {clinicInfo.fax && <p>Fax: {clinicInfo.fax}</p>}
        </div>
      </div>
    </div>
  </div>
);

// Order and client information component
const OrderClientInfo = ({ order, clientInfo }: { order: Order; clientInfo: OrderInvoiceTemplateProps['clientInfo'] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div>
      <h3 className="font-semibold mb-2">Order Information</h3>
      <div className="text-sm space-y-1">
        <p><span className="font-medium">Order Number:</span> {order.orderNumber}</p>
        <p><span className="font-medium">Order Date:</span> {formatDate(order.orderDate)}</p>
        <p><span className="font-medium">Service Date:</span> {formatDate(order.serviceDate)}</p>
        <p><span className="font-medium">Status:</span> {order.status}</p>
        <p><span className="font-medium">Payment Status:</span> {order.paymentStatus}</p>
      </div>
    </div>
    <div>
      <h3 className="font-semibold mb-2">Client Information</h3>
      <div className="text-sm space-y-1">
        <p><span className="font-medium">Name:</span> {clientInfo.name}</p>
        <p><span className="font-medium">Client ID:</span> {order.clientId}</p>
        {clientInfo.email && <p><span className="font-medium">Email:</span> {clientInfo.email}</p>}
        {clientInfo.phone && <p><span className="font-medium">Phone:</span> {clientInfo.phone}</p>}
      </div>
    </div>
  </div>
);

// Order line items component
const OrderLineItems = ({ order }: { order: Order }) => {
  const calculateTotals = () => {
    const total = order.items.reduce((sum, item) => sum + (item.amount || item.subtotal || 0), 0);
    
    return { subtotal: total, total: order.totalAmount || total };
  };

  const totals = calculateTotals();

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-4">Order Details</h3>
      <table className="w-full border-collapse border border-gray-900">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-900 px-3 py-2 text-left font-bold">DESCRIPTION</th>
            <th className="border border-gray-900 px-3 py-2 text-center font-bold">QTY</th>
            <th className="border border-gray-900 px-3 py-2 text-right font-bold">UNIT PRICE</th>
            <th className="border border-gray-900 px-3 py-2 text-right font-bold">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-900 px-3 py-2">
                {item.description || item.productName || 'Service'}
                {item.duration && (
                  <div className="text-xs text-gray-600 mt-1">
                    Duration: {item.duration} minutes
                  </div>
                )}
              </td>
              <td className="border border-gray-900 px-3 py-2 text-center">{item.quantity || 1}</td>
              <td className="border border-gray-900 px-3 py-2 text-right">
                {PaymentApiService.formatCurrency(item.unitPrice || 0)}
              </td>
              <td className="border border-gray-900 px-3 py-2 text-right">
                {PaymentApiService.formatCurrency(item.amount || item.subtotal || 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Order totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-1 font-bold text-lg">
            <span>Total:</span>
            <span>{PaymentApiService.formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment breakdown component
const PaymentBreakdown = ({ payments, orderTotal }: { payments: Payment[] | undefined; orderTotal: number }) => {
  // Ensure payments is always an array
  const safePayments = payments || [];
  
  const totalPaid = safePayments.reduce((sum, payment) => {
    return sum + (payment.amounts?.totalPaymentAmount || payment.total || 0);
  }, 0);
  
  const outstandingBalance = orderTotal - totalPaid;

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-4">Payment History ({safePayments.length} payment{safePayments.length !== 1 ? 's' : ''})</h3>
      
      {safePayments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded border">
          <p className="text-gray-600">No payments recorded for this order</p>
        </div>
      ) : (
        <>
          <table className="w-full border-collapse border border-gray-900">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-900 px-3 py-2 text-left font-bold">PAYMENT ID</th>
                <th className="border border-gray-900 px-3 py-2 text-center font-bold">DATE</th>
                <th className="border border-gray-900 px-3 py-2 text-center font-bold">METHOD</th>
                <th className="border border-gray-900 px-3 py-2 text-right font-bold">AMOUNT</th>
                <th className="border border-gray-900 px-3 py-2 text-center font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {safePayments.map((payment, index) => (
                <tr key={index}>
                  <td className="border border-gray-900 px-3 py-2 text-sm">
                    {payment.paymentId || payment.paymentNumber}
                  </td>
                  <td className="border border-gray-900 px-3 py-2 text-center text-sm">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="border border-gray-900 px-3 py-2 text-center text-sm">
                    {payment.paymentMethod?.toUpperCase() || 'N/A'}
                  </td>
                  <td className="border border-gray-900 px-3 py-2 text-right">
                    {PaymentApiService.formatCurrency(payment.amounts?.totalPaymentAmount || payment.total || 0)}
                  </td>
                  <td className="border border-gray-900 px-3 py-2 text-center text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status?.toUpperCase() || 'COMPLETED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Payment summary */}
          <div className="mt-4 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-1">
                <span>Order Total:</span>
                <span>{PaymentApiService.formatCurrency(orderTotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-green-600">
                <span>Total Paid:</span>
                <span>{PaymentApiService.formatCurrency(totalPaid)}</span>
              </div>
              <Separator className="my-2" />
              <div className={`flex justify-between py-1 font-bold ${
                outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                <span>Outstanding Balance:</span>
                <span>{PaymentApiService.formatCurrency(outstandingBalance)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main OrderInvoiceTemplate component
export default function OrderInvoiceTemplate({ 
  order, 
  payments,
  clinicInfo, 
  clientInfo, 
  onDownload 
}: OrderInvoiceTemplateProps) {
  const orderTotal = order.totalAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Actions */}
      <div className="no-print bg-white border-b px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Order
          </Button>
          <div className="flex gap-2">
            {onDownload && (
              <Button
                variant="outline"
                onClick={onDownload}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </Button>
            )}
            <Button
              onClick={() => window.print()}
              className="flex items-center gap-2"
            >
              <Printer size={16} />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <Card className="max-w-5xl mx-auto">
          <CardContent className="p-8">
            <OrderHeader order={order} clinicInfo={clinicInfo} />
            <OrderClientInfo order={order} clientInfo={clientInfo} />
            <Separator className="my-6" />
            <OrderLineItems order={order} />
            <Separator className="my-6" />
            <PaymentBreakdown payments={payments} orderTotal={orderTotal} />
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
              <p>Thank you for choosing {clinicInfo.displayName || clinicInfo.name}</p>
              <p className="mt-2">
                This invoice was generated on {formatDate(new Date().toISOString())}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .container {
            max-width: none !important;
            padding: 0 !important;
          }
          
          body {
            background: white !important;
          }
          
          .card {
            border: none !important;
            box-shadow: none !important;
          }
          
          @page {
            margin: 0.75in;
            size: letter;
          }
        }
      `}</style>
    </div>
  );
}
