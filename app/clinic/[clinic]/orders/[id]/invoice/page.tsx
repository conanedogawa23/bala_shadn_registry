"use client";

/**
 * Order Invoice Page
 * 
 * This page fetches order data from MongoDB via the backend API:
 * - Orders collection: Contains order details, line items, dates, and totals
 * - Payments collection: Contains payment history linked by orderNumber
 * - Clinics collection: Contains clinic information (name, address, phone, fax)
 * - Clients collection: Contains client details including contact information
 * 
 * Data Structure (from MongoDB):
 * - Order: { _id, orderNumber, clientId, clinicName, items[], totalAmount, orderDate, serviceDate }
 * - Payment: { _id, paymentNumber, orderNumber, amounts: { totalPaymentAmount, totalPaid, ... } }
 * - Clinic: { _id, clinicId, name, displayName, address: { street, city, province, postalCode } }
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { findClinicBySlug } from "@/lib/data/clinics";
import { useOrder, usePaymentsByOrder, type Order, type Payment } from "@/lib/hooks";
import OrderInvoiceTemplate from "@/components/ui/invoice/OrderInvoiceTemplate";

// Loading component
const LoadingSpinner = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
  </div>
);

// Error display component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="container mx-auto py-8 px-4 sm:px-6">
    <Card>
      <CardContent className="p-8">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Invoice</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft size={16} className="mr-2" />
              Go Back
            </Button>
            <Button onClick={onRetry}>
              Try Again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function OrderInvoicePage() {
  const params = useParams();
  const clinic = params.clinic as string;
  const orderId = params.id as string;
  
  // Get clinic data using case-insensitive lookup
  const clinicData = findClinicBySlug(clinic);

  // Fetch order data
  const { order, loading: orderLoading, error: orderError } = useOrder({
    id: orderId,
    autoFetch: !!orderId
  });

  // Fetch payments for this order from MongoDB
  // MongoDB Payment structure: { 
  //   _id, paymentNumber, orderNumber, clientId, paymentDate, paymentMethod, 
  //   amounts: { totalPaymentAmount, totalPaid, totalOwed, popAmount, dpaAmount, ... }
  // }
  const { 
    payments, 
    loading: paymentsLoading, 
    error: paymentsError 
  } = usePaymentsByOrder(order?.orderNumber || "");

  // Simplified loading state - only wait for order, not payments
  const isLoading = orderLoading;
  const error = orderError || paymentsError;

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Error states
  if (!clinicData) {
    return (
      <ErrorDisplay 
        error="Clinic not found" 
        onRetry={() => window.history.back()} 
      />
    );
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <ErrorDisplay 
        error="Order not found" 
        onRetry={handleRetry} 
      />
    );
  }

  // Create clinic info directly from clinic data
  const defaultClinicInfo = {
    name: clinicData?.name || '',
    displayName: clinicData?.displayName || clinicData?.name || '',
    address: clinicData?.address || '',
    city: clinicData?.city || '',
    province: clinicData?.province || '',
    postalCode: clinicData?.postalCode || '',
    phone: '',
    fax: ''
  };

  // Create client info from order data
  const defaultClientInfo = {
    name: order?.clientName || 'Unknown Client',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: ''
  };

  return (
    <OrderInvoiceTemplate
      order={order}
      payments={payments}
      clinicInfo={defaultClinicInfo}
      clientInfo={defaultClientInfo}
    />
  );
}
