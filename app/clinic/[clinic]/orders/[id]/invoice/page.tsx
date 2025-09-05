"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { slugToClinic } from "@/lib/data/clinics";
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
  
  // State management
  const [clinicInfo, setClinicInfo] = useState<Record<string, unknown> | null>(null);
  const [clientInfo, setClientInfo] = useState<Record<string, unknown> | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);

  // Get clinic data
  const clinicData = slugToClinic(clinic);

  // Fetch order data
  const { order, loading: orderLoading, error: orderError } = useOrder({
    id: orderId,
    autoFetch: !!orderId
  });

  // Fetch payments for this order
  const { 
    payments, 
    loading: paymentsLoading, 
    error: paymentsError 
  } = usePaymentsByOrder(order?.orderNumber || "");

  const isLoading = orderLoading || (order?.orderNumber && paymentsLoading) || !isDataReady;
  const error = orderError || paymentsError;

  // Setup clinic and client info
  const setupInvoiceData = useCallback(() => {
    if (!clinicData || !order) return;

    setClinicInfo({
      name: clinicData.name,
      displayName: clinicData.displayName,
      address: clinicData.address,
      city: clinicData.city,
      province: clinicData.province,
      postalCode: clinicData.postalCode,
      phone: '(416) 555-0123', // Default values for BodyBliss format
      fax: '(416) 555-0124'
    });

    setClientInfo({
      name: order.clientName || 'Unknown Client',
      address: '',
      city: '',
      province: '',
      postalCode: ''
    });

    setIsDataReady(true);
  }, [clinicData, order]);

  // Handle retry
  const handleRetry = () => {
    setIsDataReady(false);
    window.location.reload();
  };


  // Effects
  useEffect(() => {
    setupInvoiceData();
  }, [setupInvoiceData]);

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

  // Create default clinic info with proper types
  const defaultClinicInfo = {
    name: (clinicInfo as Record<string, string>)?.name || clinicData?.name || '',
    displayName: (clinicInfo as Record<string, string>)?.displayName || clinicData?.displayName || '',
    address: (clinicInfo as Record<string, string>)?.address || clinicData?.address || '',
    city: (clinicInfo as Record<string, string>)?.city || clinicData?.city || '',
    province: (clinicInfo as Record<string, string>)?.province || clinicData?.province || '',
    postalCode: (clinicInfo as Record<string, string>)?.postalCode || clinicData?.postalCode || '',
    phone: (clinicInfo as Record<string, string>)?.phone || '',
    fax: (clinicInfo as Record<string, string>)?.fax || ''
  };

  const defaultClientInfo = {
    name: (clientInfo as Record<string, string>)?.name || order?.clientName || 'Unknown Client',
    address: (clientInfo as Record<string, string>)?.address || '',
    city: (clientInfo as Record<string, string>)?.city || '',
    province: (clientInfo as Record<string, string>)?.province || '',
    postalCode: (clientInfo as Record<string, string>)?.postalCode || '',
    phone: (clientInfo as Record<string, string>)?.phone || '',
    email: (clientInfo as Record<string, string>)?.email || ''
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
