"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, AlertTriangle, ArrowLeft, CreditCard, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface PaymentDetails {
  id: string;
  invoiceNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  status: "completed" | "pending" | "failed";
  cardLastFour?: string;
  transactionId: string;
  clientName: string;
  clientEmail: string;
  billingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  notes?: string;
}

export default function PaymentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  useAuth(); // This will handle the redirect if not authenticated
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated is handled by the useAuth hook
    
    // Simulating API call to fetch payment details
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        // In a real app, this would be fetched from an API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockPaymentDetails: PaymentDetails = {
          id: params.id,
          // Use a stable ID instead of Math.random to prevent hydration mismatch
          invoiceNumber: `INV-${1000 + parseInt(params.id)}`,
          paymentDate: new Date().toISOString(),
          amount: 175.50,
          paymentMethod: "Credit Card",
          status: "completed",
          cardLastFour: "4242",
          // Use a deterministic ID rather than random string
          transactionId: `TXID-${params.id.padStart(8, '0')}`,
          clientName: "Sarah Johnson",
          clientEmail: "sarah.johnson@example.com",
          billingAddress: {
            address: "123 Main Street, Apt 4B",
            city: "Springfield",
            state: "IL",
            postalCode: "62704",
            country: "United States"
          },
          orderItems: [
            {
              id: "1",
              description: "Collagen Facial Treatment",
              quantity: 1,
              unitPrice: 120.00,
              total: 120.00
            },
            {
              id: "2",
              description: "Moisturizing Mask",
              quantity: 1,
              unitPrice: 45.00,
              total: 45.00
            },
            {
              id: "3",
              description: "Treatment Application Fee",
              quantity: 1,
              unitPrice: 10.50,
              total: 10.50
            }
          ],
          notes: "Customer requested digital receipt."
        };
        
        setPaymentDetails(mockPaymentDetails);
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [params.id, router]);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real application, this would generate or download a PDF
    alert("In a real app, this would download a PDF receipt");
  };

  const handleVoidPayment = () => {
    if (confirm("Are you sure you want to void this payment? This action cannot be undone.")) {
      // In a real application, this would make an API call to void the payment
      alert("Payment has been voided");
      router.push("/payments");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container py-8 max-w-5xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="container py-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Payment Not Found</h1>
          <p className="text-gray-600 mb-8">The payment you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <Button onClick={() => router.push("/payments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 print:px-0">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-4 print:hidden"
            onClick={() => router.push("/payments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Payment Details</h1>
        </div>
        
        <div className="flex gap-2 print:hidden">
          <Button 
            variant="outline" 
            onClick={handlePrintReceipt}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {paymentDetails.status === "completed" && (
            <Button 
              variant="destructive" 
              onClick={handleVoidPayment}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Void Payment
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 print:grid-cols-3">
        <div className="md:col-span-2 print:col-span-2">
          <Card className="shadow-sm print:shadow-none print:border-0">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Payment #{paymentDetails.invoiceNumber}</CardTitle>
                  <CardDescription>
                    {paymentDetails.paymentDate && format(new Date(paymentDetails.paymentDate), "PPP")}
                  </CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paymentDetails.status)}`}>
                  <div className="flex items-center">
                    {getStatusIcon(paymentDetails.status)}
                    <span className="ml-1">{getStatusText(paymentDetails.status)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">Amount</div>
                      <div className="text-lg font-bold">{formatCurrency(paymentDetails.amount)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Payment Method</div>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{paymentDetails.paymentMethod}</span>
                        {paymentDetails.cardLastFour && (
                          <span className="ml-1 text-sm text-gray-500">ending in {paymentDetails.cardLastFour}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Transaction ID</div>
                      <div className="text-sm font-mono">{paymentDetails.transactionId}</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Items</h3>
                  <div className="overflow-x-auto -mx-4 sm:-mx-0">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paymentDetails.orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm text-right font-bold">Total</td>
                          <td className="px-4 py-3 text-base text-right font-bold">{formatCurrency(paymentDetails.amount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                {paymentDetails.notes && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <p className="text-sm">{paymentDetails.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-sm print:shadow-none print:border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                  <div className="font-medium">{paymentDetails.clientName}</div>
                  <div className="text-sm text-gray-600">{paymentDetails.clientEmail}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Billing Address</h3>
                  <div className="text-sm">
                    <div>{paymentDetails.billingAddress.address}</div>
                    <div>{paymentDetails.billingAddress.city}, {paymentDetails.billingAddress.state} {paymentDetails.billingAddress.postalCode}</div>
                    <div>{paymentDetails.billingAddress.country}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm mt-4 print:shadow-none print:border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="print:hidden">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/clients/${paymentDetails.clientName.replace(/\s+/g, '-').toLowerCase()}`)}
                >
                  View Client Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handlePrintReceipt}
                >
                  <Printer className="h-4 w-4 mr-2" /> Print Receipt
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleDownloadPDF}
                >
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500 print:hidden">
        <p>This receipt was generated by Body Bliss Management System.</p>
      </div>
    </div>
  );
} 