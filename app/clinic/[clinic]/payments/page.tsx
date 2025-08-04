'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  ArrowLeft, 
  Plus, 
  Search, 
  DollarSign,
  Calendar,
  User,
  FileText,
  Printer
} from 'lucide-react';
import { slugToClinic } from '@/lib/data/clinics';
import { generateLink } from '@/lib/route-utils';
import { getPaymentsByClinic } from '@/lib/mock-data';

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
}

type PaymentStatus = 'all' | 'completed' | 'pending' | 'failed' | 'refunded' | 'partial';

export default function PaymentsPage() {
  const params = useParams();
  const router = useRouter();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;
  const clinic = slugToClinic(clinicSlug);

  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        // Use existing mock data
        const paymentsData = getPaymentsByClinic(clinicSlug);
        setPayments(paymentsData);
        setFilteredPayments(paymentsData);
      } catch {
        setError('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [clinicSlug]);

  // Filter payments based on search and status
  useEffect(() => {
    let filtered = payments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const handleBack = () => {
    router.push(generateLink('clinic', '', clinicSlug));
  };

  const handleNewPayment = () => {
    router.push(generateLink('clinic', 'payments/new', clinicSlug));
  };

  const handleViewPayment = (paymentId: string) => {
    router.push(generateLink('clinic', `payments/${paymentId}`, clinicSlug));
  };

  const handlePrintInvoice = (paymentId: string) => {
    // Navigate to invoice page for printing
    router.push(generateLink('clinic', `payments/invoice/${paymentId}`, clinicSlug));
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
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methods: Record<string, string> = {
      'Credit Card': 'Credit',
      'Debit': 'Debit',
      'Cash': 'Cash',
      'Cheque': 'Cheque',
      'Insurance': 'Insurance'
    };
    return methods[method] || method;
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Payments</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
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
              Payments - {clinic?.displayName || clinicSlug}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredPayments.length} payments found
            </p>
          </div>
        </div>
        <Button onClick={handleNewPayment} className="flex items-center gap-2">
          <Plus size={16} />
          New Payment
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search by client name, invoice, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'completed', 'pending', 'failed', 'refunded', 'partial'] as PaymentStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All Status' : status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading payments...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Grid */}
      {!isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {payment.clientName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {payment.invoiceNumber}
                    </p>
                  </div>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getPaymentMethodDisplay(payment.paymentMethod)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>Paid: {formatDate(payment.paymentDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} />
                    <span className="truncate">ID: {payment.clientId}</span>
                  </div>

                  {payment.paymentType && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText size={14} />
                      <span>{payment.paymentType}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewPayment(payment.id)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintInvoice(payment.id);
                      }}
                      className="px-3"
                    >
                      <Printer size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPayments.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No payments found' : 'No payments yet'}
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first payment record.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button onClick={handleNewPayment}>
                  <Plus size={16} className="mr-2" />
                  Create Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {!isLoading && filteredPayments.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredPayments.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredPayments.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-600">
                  {filteredPayments.filter(p => {
                    const paymentDate = new Date(p.paymentDate);
                    const now = new Date();
                    return paymentDate.getMonth() === now.getMonth() && 
                           paymentDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}