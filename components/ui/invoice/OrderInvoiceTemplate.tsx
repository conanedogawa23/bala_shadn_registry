"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer } from "lucide-react";
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
}

// Invoice header component - Exact BodyBliss PDF format
const InvoiceHeader = ({ order, clinicInfo, clientInfo }: { 
  order: Order; 
  clinicInfo: OrderInvoiceTemplateProps['clinicInfo']; 
  clientInfo: OrderInvoiceTemplateProps['clientInfo'];
}) => {
  const isBodyBliss = clinicInfo.name.toLowerCase().includes('bodybliss');

  return (
    <div className="mb-8">
      {/* Logo with outlined "one care" text */}
      {isBodyBliss ? (
        <div className="mb-4">
          <div className="text-xl font-normal text-black">bodybliss</div>
          <div className="text-xl outlined-text font-light tracking-wide">one care</div>
        </div>
      ) : (
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{clinicInfo.displayName || clinicInfo.name}</h1>
        </div>
      )}
      
      {/* Company Information */}
      <div className="text-sm mb-6">
        <p>{clinicInfo.displayName || clinicInfo.name}</p>
        <p>{clinicInfo.address}</p>
        <p>{clinicInfo.city}, {clinicInfo.province} {clinicInfo.postalCode}</p>
        {clinicInfo.phone && <p>T: {clinicInfo.phone}</p>}
        {clinicInfo.fax && <p>F: {clinicInfo.fax}</p>}
      </div>

      {/* INVOICE Title */}
      <h2 className="text-2xl font-bold mb-6">INVOICE</h2>

      {/* Metadata - 3 Row Layout */}
      <div className="text-sm space-y-1 mb-6">
        <div className="flex justify-between">
          <span>Invoice No. {order.orderNumber}</span>
          <span>Date: {formatDate(order.orderDate)}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer Name: {clientInfo.name}</span>
          <span>Referring MD: N/A</span>
        </div>
        <div>
          Address: {clientInfo.address || `${clinicInfo.city}, ${clinicInfo.province}`}
        </div>
      </div>
    </div>
  );
};

// Service details table - Exact PDF format with dotted borders
const ServiceDetailsTable = ({ order }: { order: Order }) => {
  const total = order.items.reduce((sum, item) => sum + (item.amount || item.subtotal || 0), 0);

  return (
    <div className="mb-6">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-dotted border border-black px-3 py-2 text-left font-bold uppercase text-sm">Item Description</th>
            <th className="border-dotted border border-black px-3 py-2 text-center font-bold uppercase text-sm">QTY</th>
            <th className="border-dotted border border-black px-3 py-2 text-right font-bold uppercase text-sm">Price</th>
            <th className="border-dotted border border-black px-3 py-2 text-right font-bold uppercase text-sm">Amount</th>
            <th className="border-dotted border border-black px-3 py-2 text-center font-bold uppercase text-sm">Service Date</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td className="border-dotted border border-black px-3 py-2">
                {item.description || item.productName || 'Service'}
              </td>
              <td className="border-dotted border border-black px-3 py-2 text-center">{item.quantity || 1}</td>
              <td className="border-dotted border border-black px-3 py-2 text-right">
                {PaymentApiService.formatCurrency(item.unitPrice || 0)}
              </td>
              <td className="border-dotted border border-black px-3 py-2 text-right">
                {PaymentApiService.formatCurrency(item.amount || item.subtotal || 0)}
              </td>
              <td className="border-dotted border border-black px-3 py-2 text-center text-sm">
                {formatDate(order.serviceDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Total - Right aligned, no tax breakdown */}
      <div className="text-right mt-4">
        <span className="text-lg font-bold">Total: {PaymentApiService.formatCurrency(total)}</span>
      </div>
    </div>
  );
};

// Payment information - Simple list format from PDF
const PaymentInformation = ({ payments, orderTotal }: { payments: Payment[] | undefined; orderTotal: number }) => {
  const safePayments = payments || [];
  
  const totalPaid = safePayments.reduce((sum, payment) => {
    return sum + (payment.amounts?.totalPaymentAmount || payment.total || 0);
  }, 0);
  
  const amountDue = orderTotal - totalPaid;
  const latestPayment = safePayments.length > 0 ? safePayments[0] : null;
  
  return (
    <div className="text-sm space-y-1 mt-8">
      <p>Amount: {PaymentApiService.formatCurrency(orderTotal)}</p>
      <p>Amount Due: {PaymentApiService.formatCurrency(amountDue)}</p>
      {latestPayment && (
        <>
          <p>Dispense Date: {formatDate(latestPayment.paymentDate)}</p>
          <p>Payment Method: {latestPayment.paymentMethod?.toUpperCase() || 'N/A'}</p>
          <p>Payment Date: {formatDate(latestPayment.paymentDate)}</p>
        </>
      )}
      
      {/* Simple Signature Line */}
      <div className="mt-8 pt-4">
        <span>Signed: </span>
        <span className="inline-block border-b border-black w-48 ml-2"></span>
      </div>
    </div>
  );
};

// Main OrderInvoiceTemplate component
export default function OrderInvoiceTemplate({ 
  order, 
  payments,
  clinicInfo, 
  clientInfo
}: OrderInvoiceTemplateProps) {
  const router = useRouter();
  const params = useParams();
  
  // Use order total directly (no tax calculation)
  const orderTotal = order.items.reduce((sum, item) => sum + (item.amount || item.subtotal || 0), 0);

  const handleBackToOrder = () => {
    const orderId = order.id || order._id || params.id;
    router.push(`/clinic/${params.clinic}/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Actions */}
      <div className="no-print bg-white border-b px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBackToOrder}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Order
          </Button>
          <div className="flex gap-2">
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
        <Card className="max-w-5xl mx-auto invoice-container">
          <CardContent className="p-8">
            <InvoiceHeader order={order} clinicInfo={clinicInfo} clientInfo={clientInfo} />
            <ServiceDetailsTable order={order} />
            <Separator className="my-6" />
            <PaymentInformation payments={payments} orderTotal={orderTotal} />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Print Styles with outlined text and dotted borders */}
      <style jsx global>{`
        /* Outlined "one care" text styling */
        .outlined-text {
          color: transparent;
          -webkit-text-stroke: 1.5px #000;
          text-stroke: 1.5px #000;
          font-weight: 300;
          letter-spacing: 0.08em;
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          
          .invoice-container {
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          .container {
            max-width: none !important;
            padding: 0 !important;
          }
          
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-family: Arial, sans-serif;
          }
          
          /* Outlined text for print */
          .outlined-text {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Dotted borders for print */
          table, th, td {
            border-style: dotted !important;
            border-width: 1px !important;
            border-color: #000 !important;
          }
          
          /* Maintain text sizing in print */
          .text-3xl {
            font-size: 1.875rem !important;
          }
          
          .text-2xl {
            font-size: 1.5rem !important;
          }
          
          .text-xl {
            font-size: 1.25rem !important;
          }
          
          .text-lg {
            font-size: 1.125rem !important;
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
