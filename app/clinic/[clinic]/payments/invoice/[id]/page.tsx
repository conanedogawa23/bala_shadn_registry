'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { slugToClinic } from '@/lib/data/clinics';
import { generateLink } from '@/lib/route-utils';
import { paymentsData } from '@/lib/mock-data';

interface PaymentService {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PaymentData {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentType: string;
  clientId: string;
  paymentReference?: string;
  dueDate: string;
  invoiceDate: string;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  netAmount: number;
  orderNumber?: string;
  services?: PaymentService[];
  notes?: string;
}

interface ClinicInfo {
  displayName?: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const clinicSlug = params.clinic as string;
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('Invoice: Looking for payment ID:', paymentId);
        console.log('Invoice: Looking for clinic slug:', clinicSlug);
        console.log('Invoice: Total payments available:', paymentsData.length);
        
        // Use existing mock data
        const foundPayment = paymentsData.find(p => p.id === paymentId);
        const clinicData = slugToClinic(clinicSlug);
        
        console.log('Invoice: Found payment:', foundPayment ? 'YES' : 'NO');
        console.log('Invoice: Found clinic:', clinicData ? 'YES' : 'NO');
        
        if (foundPayment) {
          setPayment(foundPayment);
          console.log('Invoice: Payment set:', foundPayment.invoiceNumber);
        }
        
        if (clinicData) {
          setClinic({
            displayName: clinicData.displayName,
            name: clinicData.name,
            address: clinicData.address,
            city: clinicData.city,
            province: clinicData.province,
            postalCode: clinicData.postalCode
          });
          console.log('Invoice: Clinic set:', clinicData.displayName || clinicData.name);
        }
        
        // Set default clinic info if not found
        if (!clinicData) {
          setClinic({
            name: 'BodyBliss Physio',
            displayName: 'BodyBliss Physio',
            address: '1929 Leslie Street',
            city: 'Toronto',
            province: 'Ontario',
            postalCode: 'M3B 2M3'
          });
          console.log('Invoice: Using default clinic info');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [paymentId, clinicSlug]);

  const handleBack = () => {
    router.push(generateLink('clinic', `payments/${paymentId}`, clinicSlug));
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center py-12">
          <p className="text-red-600">Payment not found (ID: {paymentId})</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Payment
          </Button>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center py-12">
          <p className="text-red-600">Clinic not found (Slug: {clinicSlug})</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Header - Hidden when printing */}
      <div className="no-print bg-gray-50 px-4 py-3 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Payment
          </Button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer size={16} />
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="invoice-container max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <div className="text-gray-600">
                <p className="font-semibold">Invoice No: {payment.invoiceNumber}</p>
                <p>Date: {formatDate(payment.invoiceDate)}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900">{clinic.displayName || clinic.name}</h2>
              <div className="text-gray-600 mt-2">
                <p>{clinic.address}</p>
                <p>{clinic.city}, {clinic.province} {clinic.postalCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
            <div className="text-gray-700">
              <p className="font-medium text-lg">{payment.clientName}</p>
              <p>Client ID: {payment.clientId}</p>
              {payment.orderNumber && <p>Order: {payment.orderNumber}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Details:</h3>
            <div className="text-gray-700">
              <p>Payment Method: <span className="font-medium">{payment.paymentMethod}</span></p>
              <p>Payment Type: <span className="font-medium">{payment.paymentType}</span></p>
              <p>Due Date: <span className="font-medium">{formatDate(payment.dueDate)}</span></p>
              {payment.paymentReference && (
                <p>Reference: <span className="font-medium">{payment.paymentReference}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Service Details Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">ITEM DESCRIPTION</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold w-20">QTY</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-24">PRICE</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-24">AMOUNT</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold w-32">SERVICE DATE</th>
                </tr>
              </thead>
              <tbody>
                {payment.services?.map((service, index) => (
                  <tr key={service.id || index}>
                    <td className="border border-gray-300 px-4 py-3">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{service.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">{formatCurrency(service.unitPrice)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">{formatCurrency(service.totalPrice)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{formatDate(payment.paymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="border border-gray-300">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                <h3 className="font-semibold">Financial Summary</h3>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(payment.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({(payment.taxRate * 100).toFixed(1)}% HST):</span>
                  <span>{formatCurrency(payment.taxAmount)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(payment.netAmount)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Due:</span>
                  <span className={`font-medium ${payment.netAmount - payment.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(payment.netAmount - payment.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Authorized Signature:</h4>
              <div className="border-b border-gray-400 h-12 mb-2"></div>
              <p className="text-sm text-gray-600">Signature</p>
            </div>
            <div>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Dispense Date:</span> {formatDate(payment.paymentDate)}</p>
                <p><span className="font-medium">Payment Method:</span> {payment.paymentMethod}</p>
                {payment.notes && <p><span className="font-medium">Notes:</span> {payment.notes}</p>}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Thank you for choosing {clinic.displayName || clinic.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 