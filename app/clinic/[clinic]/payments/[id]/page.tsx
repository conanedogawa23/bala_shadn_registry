'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  FileText,
  Edit,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Building
} from 'lucide-react';
import { generateLink } from '@/lib/route-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  status: string;
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
  clinic: string;
  clinicAddress?: string;
  providerName?: string;
  orderNumber?: string;
  services?: PaymentService[];
  insuranceInfo?: {
    primaryInsurance?: string;
    claimNumber?: string;
    authorizationNumber?: string;
  };
  notes?: string;
}

export default function ViewPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const clinicSlug = params.clinic as string;
  const paymentId = params.id as string;
  
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment data
  useEffect(() => {
    const fetchPayment = async () => {
      setIsLoading(true);
      try {
        // Use existing mock data
        const foundPayment = paymentsData.find(p => p.id === paymentId);
        if (foundPayment) {
          setPayment(foundPayment);
        } else {
          setError('Payment not found');
        }
      } catch {
        setError('Failed to load payment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handleBack = () => {
    router.push(generateLink('clinic', 'payments', clinicSlug));
  };

  const handleEdit = () => {
    router.push(generateLink('clinic', `payments/${paymentId}/edit`, clinicSlug));
  };

  const handlePrintInvoice = () => {
    router.push(generateLink('clinic', `payments/invoice/${paymentId}`, clinicSlug));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'refunded': return <ArrowLeft className="h-5 w-5 text-blue-600" />;
      case 'partial': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Loading Payment...</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading payment details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Payment Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
              <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || 'The payment you are looking for does not exist.'}
              </p>
              <Button onClick={handleBack}>
                Return to Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
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
              Payment Details
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {payment.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
            <Edit size={16} />
            Edit Payment
          </Button>
          <Button onClick={handlePrintInvoice} className="flex items-center gap-2">
            <Printer size={16} />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Payment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(payment.status)}
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment Amount
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {payment.paymentMethod}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment Method
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Date</p>
                  <p className="text-base">{formatDate(payment.paymentDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="text-base">{formatDate(payment.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Invoice Date</p>
                  <p className="text-base">{formatDate(payment.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Type</p>
                  <p className="text-base">{payment.paymentType}</p>
                </div>
              </div>

              {payment.paymentReference && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Reference</p>
                  <p className="text-base font-mono">{payment.paymentReference}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 text-sm font-medium text-gray-500">Service</th>
                      <th className="pb-3 text-sm font-medium text-gray-500 text-right">Qty</th>
                      <th className="pb-3 text-sm font-medium text-gray-500 text-right">Unit Price</th>
                      <th className="pb-3 text-sm font-medium text-gray-500 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payment.services?.map((service, index) => (
                      <tr key={service.id || index}>
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        </td>
                        <td className="py-3 text-right">{service.quantity}</td>
                        <td className="py-3 text-right">{formatCurrency(service.unitPrice)}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(service.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(payment.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({(payment.taxRate * 100).toFixed(1)}%):</span>
                  <span>{formatCurrency(payment.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(payment.netAmount)}</span>
                </div>
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
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-lg">{payment.clientName}</p>
                <p className="text-sm text-gray-600">Client ID: {payment.clientId}</p>
              </div>
              
              {payment.orderNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Order Number</p>
                  <p className="text-base">{payment.orderNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{payment.clinic}</p>
                {payment.clinicAddress && (
                  <p className="text-sm text-gray-600">{payment.clinicAddress}</p>
                )}
              </div>
              
              {payment.providerName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Provider</p>
                  <p className="text-base">{payment.providerName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insurance Information */}
          {payment.insuranceInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payment.insuranceInfo.primaryInsurance && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Primary Insurance</p>
                    <p className="text-base">{payment.insuranceInfo.primaryInsurance}</p>
                  </div>
                )}
                
                {payment.insuranceInfo.claimNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Claim Number</p>
                    <p className="text-base font-mono">{payment.insuranceInfo.claimNumber}</p>
                  </div>
                )}
                
                {payment.insuranceInfo.authorizationNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Authorization</p>
                    <p className="text-base font-mono">{payment.insuranceInfo.authorizationNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {payment.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{payment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 