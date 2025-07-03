'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  DollarSign,
  FileText,
  Phone,
  Mail,
  Edit,
  Printer,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PaymentData {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'cash' | 'check' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  dueDate: string;
  processingFee: number;
  netAmount: number;
  transactionId: string;
  description: string;
  notes?: string;
  invoiceNumber?: string;
  serviceType: string;
  processedBy: string;
}

const themeColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

export default function ViewPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const paymentId = params.id as string;
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const fetchPayment = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockPayment: PaymentData = {
          id: paymentId,
          clientId: "16883465",
          clientName: "ROBINSON, DAVID",
          clientEmail: "d.robinson@email.com",
          clientPhone: "416-555-1234",
          amount: 559.35,
          paymentMethod: "credit_card",
          status: "completed",
          paymentDate: "2024-01-15",
          dueDate: "2024-01-20",
          processingFee: 16.78,
          netAmount: 542.57,
          transactionId: "TXN-2024-001-" + paymentId,
          description: "Physical therapy session package",
          notes: "Payment for 3 therapy sessions and equipment package",
          invoiceNumber: "INV-2024-001",
          serviceType: "Physical Therapy",
          processedBy: "Dr. Sarah Johnson"
        };
        setPaymentData(mockPayment);
        setIsLoading(false);
      }, 1000);
    };

    fetchPayment();
  }, [paymentId]);

  const handleBack = () => {
    router.push(`/clinic/${clinic}/payments`);
  };

  const handleEditPayment = () => {
    router.push(`/clinic/${clinic}/payments/${paymentId}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF receipt
    alert('Payment receipt downloaded');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'check':
        return <FileText className="h-4 w-4" />;
      case 'bank_transfer':
        return <FileText className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'cash':
        return 'Cash';
      case 'check':
        return 'Check';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  if (!paymentData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Payment Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The payment you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={handleBack} className="mt-4">
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Payments
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Payment #{paymentData.id}
          </h1>
          <p className="text-gray-600 mt-1">
            {clinic.replace('-', ' ')} • {paymentData.clientName}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </Button>
          <Button 
            onClick={handleEditPayment}
            size="sm"
            className="flex items-center gap-2"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Edit size={16} />
            Edit Payment
          </Button>
        </div>
      </div>

      {/* Payment Status & Amount */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themeColors.primary}20` }}
              >
                <DollarSign className="h-6 w-6" style={{ color: themeColors.primary }} />
              </div>
              <div>
                <div className="text-3xl font-bold">{formatCurrency(paymentData.amount)}</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
            </div>
            
            <Badge variant="secondary" className={getStatusColor(paymentData.status)}>
              {getStatusIcon(paymentData.status)}
              <span className="ml-2 capitalize">{paymentData.status}</span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transaction ID</span>
              <span className="font-medium">{paymentData.transactionId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Method</span>
              <div className="flex items-center gap-2">
                {getPaymentMethodIcon(paymentData.paymentMethod)}
                <span className="font-medium">{formatPaymentMethod(paymentData.paymentMethod)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Date</span>
              <span className="font-medium">{formatDate(paymentData.paymentDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="font-medium">{formatDate(paymentData.dueDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processed By</span>
              <span className="font-medium">{paymentData.processedBy}</span>
            </div>
            {paymentData.invoiceNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Invoice Number</span>
                <span className="font-medium">{paymentData.invoiceNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Name</span>
              <span className="font-medium">{paymentData.clientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{paymentData.clientEmail}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Phone</span>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{paymentData.clientPhone}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Client ID</span>
              <span className="font-medium">#{paymentData.clientId}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Service Type</span>
            <span className="font-medium">{paymentData.serviceType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Description</span>
            <span className="font-medium">{paymentData.description}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Service Amount</span>
              <span className="font-medium">{formatCurrency(paymentData.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee</span>
              <span className="font-medium">-{formatCurrency(paymentData.processingFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Net Amount</span>
              <span>{formatCurrency(paymentData.netAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {paymentData.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{paymentData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 