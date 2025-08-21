"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Download,
  ChevronRight,
  CreditCard,
  Eye,
  Edit
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { slugToClinic } from "@/lib/data/clinics";
import { generateLink } from "@/lib/route-utils";
import { 
  PaymentApiService, 
  Payment,
  PaymentStatus
} from "@/lib/api/paymentService";

// Loading component
const LoadingSpinner = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
  </div>
);

// Error display component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <p className="text-red-600 mb-4">{error}</p>
    <Button onClick={onRetry} variant="outline">
      Try Again
    </Button>
  </div>
);

// Payment status badge component
const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const getStatusColorClass = (status: PaymentStatus): string => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.PARTIAL:
        return 'bg-blue-100 text-blue-800';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case PaymentStatus.REFUNDED:
        return 'bg-purple-100 text-purple-800';
      case PaymentStatus.WRITEOFF:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={getStatusColorClass(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Payment card component for mobile view
const PaymentCard = ({ payment, clinic }: { payment: Payment; clinic: string }) => (
  <Card className="shadow-sm border border-gray-200">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-medium">
            {payment.paymentId}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {payment.clientName} • {PaymentApiService.formatDate(payment.paymentDate)}
          </p>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="font-medium">{PaymentApiService.formatCurrency(payment.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Paid:</span>
          <span className="font-medium text-green-600">{PaymentApiService.formatCurrency(payment.amountPaid)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Method:</span>
          <span className="text-sm">{payment.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Invoice:</span>
          <span className="text-sm">{payment.invoiceNumber}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Link href={generateLink('clinic', `payments/${payment.paymentId}`, clinic)} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Eye size={14} className="mr-1" />
            View
          </Button>
        </Link>
        <Link href={generateLink('clinic', `payments/${payment.paymentId}/edit`, clinic)} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Edit size={14} className="mr-1" />
            Edit
          </Button>
        </Link>
        <Link href={generateLink('clinic', `payments/invoice/${payment.paymentId}`, clinic)}>
          <Button variant="outline" size="sm">
            <FileText size={14} />
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

// Main payments page component
export default function PaymentsPage() {
  const params = useParams();
  const clinic = params.clinic as string;
  
  // State management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPayments, setTotalPayments] = useState(0);

  const ITEMS_PER_PAGE = 10;

  // Get clinic data
  const clinicData = slugToClinic(clinic);

  // Fetch payments data
  const fetchPayments = useCallback(async (page = 1, reset = false) => {
    if (!clinicData) {
      setError("Clinic not found");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const filters = {
        page,
        limit: ITEMS_PER_PAGE,
        status: statusFilter === "all" ? undefined : statusFilter as PaymentStatus,
      };

      const result = await PaymentApiService.getPaymentsByClinic(clinicData.name, filters);
      
      if (reset || page === 1) {
        setPayments(result.data);
      } else {
        setPayments(prev => [...prev, ...result.data]);
      }
      
      setTotalPayments(result.pagination.totalItems);
      setHasMore(result.pagination.hasNextPage);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }, [clinicData, statusFilter]);

  // Search payments - simplified to just re-fetch with current filters
  const searchPayments = useCallback(async () => {
    // For now, just refetch all payments - search can be implemented later
    fetchPayments(1, true);
  }, [fetchPayments]);

  // Effects
  useEffect(() => {
    fetchPayments(1, true);
  }, [fetchPayments]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchPayments();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      fetchPayments(1, true);
    }
  }, [searchQuery, fetchPayments, searchPayments]);

  // Handle retry
  const handleRetry = () => {
    fetchPayments(currentPage, true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchPayments(currentPage + 1, false);
    }
  };

  if (!clinicData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Clinic Not Found</h1>
          <p className="text-gray-600 mt-2">The requested clinic could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Payments</h1>
          <p className="text-gray-600 mt-1">
            Manage payments for {clinicData.displayName}
            {totalPayments > 0 && ` • ${totalPayments} total payments`}
          </p>
        </div>
        <div className="flex gap-3 self-start">
          <Link href={generateLink('clinic', 'payments/new', clinic)}>
            <Button>
              <Plus size={16} className="mr-2" />
              Record Payment
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Reports
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    const report = await PaymentApiService.getPaymentReports(
                      clinicData.name, 
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      new Date().toISOString().split('T')[0]
                    );
                    console.log('Payment Summary Report:', report);
                  } catch (err) {
                    console.error('Report generation failed:', err);
                  }
                }}
              >
                Payment Summary
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    const report = await PaymentApiService.getPaymentReports(
                      clinicData.name, 
                      'co-pay-summary'
                    );
                    console.log('Co Pay Summary Report:', report);
                  } catch (err) {
                    console.error('Report generation failed:', err);
                  }
                }}
              >
                Co Pay Summary
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    const report = await PaymentApiService.getPaymentReports(
                      clinicData.name, 
                      'marketing-budget-summary'
                    );
                    console.log('Marketing Budget Report:', report);
                  } catch (err) {
                    console.error('Report generation failed:', err);
                  }
                }}
              >
                Marketing Budget Summary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search payments by invoice number, client name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {error ? (
        <ErrorDisplay error={error} onRetry={handleRetry} />
      ) : isLoading && payments.length === 0 ? (
        <LoadingSpinner />
      ) : payments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No payments found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "No payments match your search criteria." : "No payments have been recorded yet."}
            </p>
            {!searchQuery && (
              <Link href={generateLink('clinic', 'payments/new', clinic)}>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Record First Payment
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-medium">Invoice #</th>
                      <th className="text-left p-4 font-medium">Client</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Method</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-t hover:bg-gray-50">
                        <td className="p-4">
                          <Link 
                            href={generateLink('clinic', `payments/${payment.paymentId}`, clinic)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {payment.invoiceNumber}
                          </Link>
                        </td>
                        <td className="p-4">{payment.clientName}</td>
                        <td className="p-4">{PaymentApiService.formatDate(payment.paymentDate)}</td>
                        <td className="p-4 font-medium">{PaymentApiService.formatCurrency(payment.total)}</td>
                        <td className="p-4">{payment.paymentMethod}</td>
                        <td className="p-4">
                          <PaymentStatusBadge status={payment.status} />
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Link href={generateLink('clinic', `payments/${payment.paymentId}`, clinic)}>
                              <Button variant="outline" size="sm">
                                <Eye size={14} />
                              </Button>
                            </Link>
                            <Link href={generateLink('clinic', `payments/${payment.paymentId}/edit`, clinic)}>
                              <Button variant="outline" size="sm">
                                <Edit size={14} />
                              </Button>
                            </Link>
                            <Link href={generateLink('clinic', `payments/invoice/${payment.paymentId}`, clinic)}>
                              <Button variant="outline" size="sm">
                                <FileText size={14} />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {payments.map((payment) => (
              <PaymentCard key={payment._id} payment={payment} clinic={clinic} />
            ))}
          </div>

          {/* Load More / Pagination */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleLoadMore} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent mr-2" />
                ) : (
                  <ChevronRight size={16} className="mr-2" />
                )}
                Load More Payments
              </Button>
            </div>
          )}

          {/* Pagination Info */}
          {totalPayments > 0 && (
            <div className="text-center text-sm text-gray-600 mt-4">
              Showing {payments.length} of {totalPayments} payments
            </div>
          )}
        </>
      )}
    </div>
  );
}