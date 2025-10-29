"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, Eye } from "lucide-react";
import { PaymentApiService } from "@/lib/api/paymentService";
import { type Payment } from "@/lib/hooks";

interface InvoiceTemplateProps {
  payment: Payment;
  clinicInfo: {
    name: string;
    displayName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    phone?: string;
    fax?: string;
    logo?: {
      data: string;
      contentType: string;
      filename: string;
    };
  };
  clientInfo: {
    name: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  onPrint?: () => void;
  onDownload?: () => void;
}

// Enhanced header component matching BodyBliss format exactly
const UniversalInvoiceHeader = ({ clinicInfo, payment, clientInfo }: { 
  clinicInfo: InvoiceTemplateProps['clinicInfo']; 
  payment: Payment; 
  clientInfo: InvoiceTemplateProps['clientInfo']; 
}) => {
  // Debug logging
  console.log('InvoiceTemplate clinicInfo:', {
    name: clinicInfo.name,
    hasLogo: !!clinicInfo.logo,
    logoDetails: clinicInfo.logo ? {
      contentType: clinicInfo.logo.contentType,
      filename: clinicInfo.logo.filename,
      dataLength: clinicInfo.logo.data?.length || 0
    } : null
  });
  
  return (
    <div className="mb-8">
      {/* Clinic Branding Section - Simple header matching reference image */}
      <div className="mb-6">
        {/* Clinic Logo if available */}
        {clinicInfo.logo && (
          <div className="mb-4">
            <img 
              src={`data:${clinicInfo.logo.contentType};base64,${clinicInfo.logo.data}`}
              alt={`${clinicInfo.displayName} logo`}
              className="max-w-[150px] max-h-[80px] object-contain"
            />
          </div>
        )}
        
        {!clinicInfo.logo && (
          <div className="text-blue-600 mb-4">
            <h1 className="text-2xl font-bold">{clinicInfo.displayName || clinicInfo.name}</h1>
          </div>
        )}
        
        {/* Clinic Address */}
        <div className="text-sm text-gray-700 space-y-1 mb-6">
          <p className="font-medium">{clinicInfo.displayName || clinicInfo.name}</p>
          <p>{clinicInfo.address}</p>
          <p>{clinicInfo.city}, {clinicInfo.province} {clinicInfo.postalCode}</p>
          {clinicInfo.phone && <p>T: {clinicInfo.phone}</p>}
          {clinicInfo.fax && <p>F: {clinicInfo.fax}</p>}
        </div>
      </div>

      {/* Invoice Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
      </div>

      {/* Invoice Details and Customer Info - Integrated Layout */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="space-y-1 text-sm">
            <p><span className="inline-block w-32">Payment No.</span>{payment.paymentNumber}</p>
            <p><span className="inline-block w-32">Customer Name:</span>{clientInfo.name}</p>
            <p><span className="inline-block w-32">Address:</span>{clientInfo.address || 'Not provided'}</p>
          </div>
        </div>
        
        <div className="text-right text-sm space-y-1">
          <p>Date: {PaymentApiService.formatDate(payment.paymentDate)}</p>
          <p>Referring No: {payment.referringNo || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
};

// Universal payment amounts breakdown
const UniversalPaymentBreakdown = ({ payment }: { payment: Payment }) => {
  // Build breakdown rows for non-zero insurance/breakdown amounts
  const breakdownRows = [];
  
  if ((payment.amounts?.insurance1stAmount || 0) > 0) {
    breakdownRows.push({
      label: 'Insurance (Primary)',
      amount: payment.amounts?.insurance1stAmount || 0
    });
  }
  
  if ((payment.amounts?.insurance2ndAmount || 0) > 0) {
    breakdownRows.push({
      label: 'Insurance (Secondary)',
      amount: payment.amounts?.insurance2ndAmount || 0
    });
  }
  
  if ((payment.amounts?.popAmount || 0) > 0) {
    breakdownRows.push({
      label: 'Patient Out of Pocket (POP)',
      amount: payment.amounts?.popAmount || 0
    });
  }
  
  if ((payment.amounts?.dpaAmount || 0) > 0) {
    breakdownRows.push({
      label: 'Direct Payment Authorization (DPA)',
      amount: payment.amounts?.dpaAmount || 0
    });
  }

  return (
    <div className="mb-6">
      <table className="w-full border-collapse border border-gray-900">
        <thead>
          <tr>
            <th className="border border-gray-900 px-3 py-2 text-left font-bold bg-white">PAYMENT TYPE</th>
            <th className="border border-gray-900 px-3 py-2 text-right font-bold bg-white">AMOUNT</th>
            <th className="border border-gray-900 px-3 py-2 text-center font-bold bg-white">DATE</th>
          </tr>
        </thead>
        <tbody>
          {/* Main payment row with full amount and date */}
          <tr>
            <td className="border border-gray-900 px-3 py-2">{payment.paymentType ? PaymentApiService.getPaymentTypeDescription(payment.paymentType) : 'N/A'}</td>
            <td className="border border-gray-900 px-3 py-2 text-right">{PaymentApiService.formatCurrency(payment.amounts?.totalPaymentAmount || payment.total || 0)}</td>
            <td className="border border-gray-900 px-3 py-2 text-center">
              {PaymentApiService.formatDate(payment.paymentDate)}
            </td>
          </tr>
          
          {/* Breakdown rows with amounts and "-" for date */}
          {breakdownRows.map((row, index) => (
            <tr key={`breakdown-${index}`}>
              <td className="border border-gray-900 px-3 py-2">{row.label}</td>
              <td className="border border-gray-900 px-3 py-2 text-right">{PaymentApiService.formatCurrency(row.amount)}</td>
              <td className="border border-gray-900 px-3 py-2 text-center">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Universal total section - simplified format
const UniversalTotalSection = ({ payment }: { payment: Payment }) => (
  <div className="text-right mb-8">
    <div className="text-xl font-bold">
      Total: {PaymentApiService.formatCurrency(payment.amounts?.totalPaymentAmount || payment.total || 0)}
    </div>
    <div className="text-lg text-green-600">
      Paid: {PaymentApiService.formatCurrency(payment.amounts?.totalPaid || payment.amountPaid || 0)}
    </div>
    <div className="text-lg text-orange-600">
      Outstanding: {PaymentApiService.formatCurrency(payment.amounts?.totalOwed || payment.amountDue || 0)}
    </div>
  </div>
);

// Universal payment details and signature section
const UniversalPaymentDetails = ({ payment }: { payment: Payment }) => (
  <div className="space-y-4">
    {/* Payment Information */}
    <div className="space-y-2 text-sm">
      <p>Total Amount: {PaymentApiService.formatCurrency(payment.amounts?.totalPaymentAmount || payment.total || 0)}</p>
      <p>Amount Paid: {PaymentApiService.formatCurrency(payment.amounts?.totalPaid || payment.amountPaid || 0)}</p>
      <p>Amount Due: {PaymentApiService.formatCurrency(payment.amounts?.totalOwed || payment.amountDue || 0)}</p>
      <p>Payment Date: {PaymentApiService.formatDate(payment.paymentDate)}</p>
      <p>Payment Method: {payment.paymentMethod?.toUpperCase() || 'N/A'}</p>
      <p>Payment Type: {payment.paymentType ? PaymentApiService.getPaymentTypeDescription(payment.paymentType) : 'N/A'}</p>
    </div>

    {/* Signature Section */}
    <div className="mt-12">
      <div className="flex items-end">
        <div className="flex-shrink-0">
          <p className="text-sm mb-2">Signed:</p>
          <div className="border-b border-gray-900 w-64 h-8"></div>
        </div>
      </div>
    </div>
  </div>
);

// Main universal invoice template component
export default function InvoiceTemplate({ 
  payment, 
  clinicInfo, 
  clientInfo, 
  onPrint, 
  onDownload 
}: InvoiceTemplateProps) {
  
  // Data-driven print handler
  const handlePrint = (): void => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Data-driven client info with fallbacks
  const enhancedClientInfo = {
    name: clientInfo.name || payment.clientName || 'Unknown Client',
    address: clientInfo.address || `${payment.clientId} Client Address`,
    city: clientInfo.city || '',
    province: clientInfo.province || '',
    postalCode: clientInfo.postalCode || ''
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Action Buttons - Hidden in print */}
      <div className="no-print flex justify-end gap-3 mb-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          <Eye size={16} className="mr-2" />
          Back to Payment
        </Button>
        {onDownload && (
          <Button variant="outline" onClick={onDownload}>
            <Download size={16} className="mr-2" />
            Download PDF
          </Button>
        )}
        <Button onClick={handlePrint}>
          <Printer size={16} className="mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Universal Invoice Content */}
      <Card className="invoice-container">
        <CardContent className="p-8">
          <UniversalInvoiceHeader 
            clinicInfo={clinicInfo} 
            payment={payment} 
            clientInfo={enhancedClientInfo} 
          />
          <UniversalPaymentBreakdown payment={payment} />
          <UniversalTotalSection payment={payment} />
          <UniversalPaymentDetails payment={payment} />
        </CardContent>
      </Card>

      {/* Enhanced Print Styles for Universal Format */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .invoice-container {
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          @page {
            margin: 0.75in;
            size: letter;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-family: Arial, sans-serif;
          }
          
          /* Ensure borders print correctly */
          table, th, td {
            border: 1px solid #000 !important;
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
        }
      `}</style>
    </div>
  );
}

// Enhanced utility for generating invoice data - data-driven approach
export const generateInvoiceData = (payment: Payment, clinicInfo: InvoiceTemplateProps['clinicInfo'], clientInfo?: InvoiceTemplateProps['clientInfo']) => {
  const enhancedClientInfo = clientInfo || {
    name: payment.clientName,
    address: `${payment.clientId} Default Address`,
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M1B 2W1'
  };

  const enhancedClinicInfo = {
    ...clinicInfo,
    phone: clinicInfo.phone || '416.479.4467',
    fax: clinicInfo.fax || '416.850.5370'
  };

  return {
    payment,
    clinicInfo: enhancedClinicInfo,
    clientInfo: enhancedClientInfo
  };
};
