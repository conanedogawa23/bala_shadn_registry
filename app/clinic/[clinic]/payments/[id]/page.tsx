'use client';

import React from 'react';
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
  Building,
  DollarSign,
  Calendar,
  Hash,
  RefreshCw
} from 'lucide-react';
import { generateLink } from '@/lib/route-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { slugToClinic } from '@/lib/data/clinics';
import { 
  usePayment,
  PaymentApiService,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
  type Payment
} from '@/lib/hooks';

// Status icon mapping
const getStatusIcon = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.COMPLETED:
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case PaymentStatus.PENDING:
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case PaymentStatus.PARTIAL:
      return <RefreshCw className="h-5 w-5 text-blue-600" />;
    case PaymentStatus.FAILED:
      return <XCircle className="h-5 w-5 text-red-600" />;
    case PaymentStatus.REFUNDED:
      return <RefreshCw className="h-5 w-5 text-purple-600" />;
    case PaymentStatus.WRITEOFF:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
};

// Status color mapping
const getStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.COMPLETED:
      return 'bg-green-100 text-green-800 border-green-200';
    case PaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case PaymentStatus.PARTIAL:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case PaymentStatus.FAILED:
      return 'bg-red-100 text-red-800 border-red-200';
    case PaymentStatus.REFUNDED:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case PaymentStatus.WRITEOFF:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;
  const paymentId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const clinic = slugToClinic(clinicSlug);
  const { payment, loading, error, refetch } = usePayment(paymentId);

  const handleBack = () => {
    router.push(generateLink('clinic', 'payments', clinicSlug));
  };

  const handleEdit = () => {
    router.push(generateLink('clinic', `payments/${paymentId}/edit`, clinicSlug));
  };

  const handlePrintInvoice = () => {
    router.push(generateLink('clinic', `payments/invoice/${paymentId}`, clinicSlug));
  };

  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="text-lg text-gray-600">Loading payment details...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Payment</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-4 space-x-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Payments
              </Button>
              <Button onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment not found
  if (!payment) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Payment Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">The requested payment could not be found.</p>
            <Button variant="outline" onClick={handleBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-6xl">
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
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment Details</h1>
            <p className="text-sm text-gray-600 mt-1">{clinic?.name || clinicSlug}</p>
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
            onClick={handlePrintInvoice}
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            <FileText size={16} />
            Invoice
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard size={20} />
                  Payment Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Payment Number:</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {payment.paymentNumber}
                    </span>
                  </div>
                  {payment.orderNumber && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Order Number:</span>
                      <span className="text-sm">{payment.orderNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Payment Date:</span>
                    <span className="text-sm">{PaymentApiService.formatDate(payment.paymentDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Method:</span>
                    <span className="text-sm">{payment.paymentMethod}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Payment Type:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {PaymentApiService.getPaymentTypeDescription(payment.paymentType)}
                    </p>
                  </div>
                  {payment.referringNo && (
                    <div>
                      <span className="text-sm font-medium">Referring Number:</span>
                      <p className="text-sm text-gray-600 mt-1">{payment.referringNo}</p>
                    </div>
                  )}
                  {payment.notes && (
                    <div>
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium">Client Name:</span>
                  <p className="text-sm text-gray-600 mt-1">{payment.clientName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Client ID:</span>
                  <p className="text-sm text-gray-600 mt-1">{payment.clientId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Amounts Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Payment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Main Amounts */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {PaymentApiService.formatCurrency(payment.amounts.totalPaymentAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Total Amount</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {PaymentApiService.formatCurrency(payment.amounts.totalPaid)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Total Paid</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {PaymentApiService.formatCurrency(payment.amounts.totalOwed)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Outstanding</p>
                  </div>
                </div>

                <Separator />

                {/* Canadian Healthcare Payment Types */}
                <div>
                  <h4 className="font-medium mb-3">Canadian Healthcare Payment Types</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {payment.amounts.popAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Patient Out of Pocket (POP):</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.popAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.popfpAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">POP Final Payment:</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.popfpAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.dpaAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Direct Payment Authorization (DPA):</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.dpaAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.dpafpAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">DPA Final Payment:</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.dpafpAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.cob1Amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">COB Primary:</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.cob1Amount)}</span>
                      </div>
                    )}
                    {payment.amounts.cob2Amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">COB Secondary:</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.cob2Amount)}</span>
                      </div>
                    )}
                    {payment.amounts.cob3Amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">COB Tertiary:</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.cob3Amount)}</span>
                      </div>
                    )}
                    {payment.amounts.insurance1stAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">1st Insurance:</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.insurance1stAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.insurance2ndAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">2nd Insurance:</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.insurance2ndAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.insurance3rdAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">3rd Insurance:</span>
                        <span className="text-sm font-medium">{PaymentApiService.formatCurrency(payment.amounts.insurance3rdAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.refundAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-600">Refund:</span>
                        <span className="text-sm font-medium text-purple-600">-{PaymentApiService.formatCurrency(payment.amounts.refundAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.salesRefundAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-600">Sales Refund:</span>
                        <span className="text-sm font-medium text-purple-600">-{PaymentApiService.formatCurrency(payment.amounts.salesRefundAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.writeoffAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Write-off:</span>
                        <span className="text-sm font-medium text-gray-600">-{PaymentApiService.formatCurrency(payment.amounts.writeoffAmount)}</span>
                      </div>
                    )}
                    {payment.amounts.badDebtAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-red-600">Bad Debt:</span>
                        <span className="text-sm font-medium text-red-600">-{PaymentApiService.formatCurrency(payment.amounts.badDebtAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                  <p className="font-medium">{payment.clinicName}</p>
                </div>
                {clinic && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">{clinic.address}</p>
                      <p className="text-sm text-gray-600">
                        {clinic.city}, {clinic.province} {clinic.postalCode}
                      </p>
                    </div>
                    {clinic.description && (
                      <div>
                        <p className="text-sm text-gray-600">{clinic.description}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Completion:</span>
                  <span className="font-medium">
                    {PaymentApiService.getPaymentCompletionPercentage(payment.amounts)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${PaymentApiService.getPaymentCompletionPercentage(payment.amounts)}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {payment.amounts.totalPaid > 0 ? (
                    `${PaymentApiService.formatCurrency(payment.amounts.totalPaid)} of ${PaymentApiService.formatCurrency(payment.amounts.totalPaymentAmount)} paid`
                  ) : (
                    'No payments received yet'
                  )}
                </div>
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
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Payment
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handlePrintInvoice}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Invoice
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start no-print"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Details
              </Button>
            </CardContent>
          </Card>

          {/* Payment Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span>{PaymentApiService.formatDateTime(payment.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated:</span>
                  <span>{PaymentApiService.formatDateTime(payment.updatedAt)}</span>
                </div>
                {payment.userLoginName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">User:</span>
                    <span>{payment.userLoginName}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 