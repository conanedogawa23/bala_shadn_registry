"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useClinic } from "@/lib/contexts/clinic-context";
import { PaymentApiService, type Payment } from "@/lib/hooks";
import InvoiceTemplate from "@/components/ui/invoice/InvoiceTemplate";

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

export default function InvoicePage() {
  const params = useParams();
  const clinic = params.clinic as string;
  const paymentId = params.id as string;
  
  // Get clinic data from context
  const { availableClinics, loading: clinicLoading, error: clinicError } = useClinic();
  const clinicData = availableClinics.find(c => c.name === clinic);
  
  // State management
  const [payment, setPayment] = useState<Payment | null>(null);
  const [clinicInfo, setClinicInfo] = useState<Record<string, unknown> | null>(null);
  const [clientInfo, setClientInfo] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoice data
  const fetchInvoiceData = useCallback(async () => {
    if (!clinicData || !paymentId || clinicLoading) {
      if (!clinicLoading) {
        setError("Invalid clinic or payment ID");
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching payment with ID:', paymentId);
      
      // Validate payment ID format first
      if (!PaymentApiService.isValidPaymentId(paymentId)) {
        throw new Error(`Invalid payment ID format: ${paymentId}. Expected MongoDB ObjectId or PAY-XXXXXXXX format.`);
      }

      // Get payment data from the backend
      const paymentResponse = await PaymentApiService.getPaymentById(paymentId);
      const paymentData = paymentResponse.data;
      
      console.log('Payment data received:', paymentData);
      
      if (!paymentData) {
        throw new Error('No payment data received from server');
      }
      
      setPayment(paymentData);
      
      // Use clinic data from backend if available, otherwise fallback to context
      if (paymentData.clinicData) {
        console.log('Clinic data received from backend:', {
          name: paymentData.clinicData.name,
          hasLogo: !!paymentData.clinicData.logo
        });
        setClinicInfo(paymentData.clinicData);
      } else {
        setClinicInfo({
          name: clinicData.name,
          displayName: clinicData.displayName,
          address: clinicData.address,
          city: clinicData.city,
          province: clinicData.province,
          postalCode: clinicData.postalCode,
          phone: clinicData.phone || '(416) 555-0123',
          fax: clinicData.fax || '(416) 555-0124'
        });
      }
      
      // Use client data from backend if available, otherwise use fallback
      if (paymentData.clientData) {
        setClientInfo(paymentData.clientData);
      } else {
        setClientInfo({
          name: paymentData.clientName || 'Unknown Client',
          address: '',
          city: '',
          province: '',
          postalCode: ''
        });
      }
    } catch (err) {
      console.error('Error loading invoice data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invoice';
      setError(errorMessage);
      
      // Additional debugging information
      if (err instanceof Error && err.message.includes('[getPaymentById]')) {
        console.error('Payment fetch error details:', {
          paymentId,
          clinicData: clinicData.name,
          errorMessage: err.message
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [clinicData, paymentId, clinicLoading]);

  // Handle retry
  const handleRetry = () => {
    fetchInvoiceData();
  };

  // Handle download PDF (placeholder for future implementation)
  const handleDownload = async () => {
    try {
      // For now, just trigger print
      // In the future, this could generate a PDF blob and download it
      window.print();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Effects
  useEffect(() => {
    fetchInvoiceData();
  }, [fetchInvoiceData]);

  // Handle clinic loading state
  if (clinicLoading) {
    return <LoadingSpinner />;
  }

  // Handle clinic error or not found
  if (clinicError || !clinicData) {
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

  if (!payment) {
    return (
      <ErrorDisplay 
        error="Payment not found" 
        onRetry={handleRetry} 
      />
    );
  }

  // Create default clinic info with proper types - prioritize backend data
  const defaultClinicInfo = {
    name: (clinicInfo as any)?.name || '',
    displayName: (clinicInfo as any)?.displayName || '',
    address: (clinicInfo as any)?.address || '',
    city: (clinicInfo as any)?.city || '',
    province: (clinicInfo as any)?.province || '',
    postalCode: (clinicInfo as any)?.postalCode || '',
    phone: (clinicInfo as any)?.phone || '',
    fax: (clinicInfo as any)?.fax || '',
    logo: (clinicInfo as any)?.logo || undefined  // Include logo from backend
  };

  const defaultClientInfo = {
    name: (clientInfo as Record<string, string>)?.name || payment?.clientName || 'Unknown Client',
    address: (clientInfo as Record<string, string>)?.address || '',
    city: (clientInfo as Record<string, string>)?.city || '',
    province: (clientInfo as Record<string, string>)?.province || '',
    postalCode: (clientInfo as Record<string, string>)?.postalCode || '',
    phone: (clientInfo as Record<string, string>)?.phone || '',
    email: (clientInfo as Record<string, string>)?.email || ''
  };

  return (
    <InvoiceTemplate
      payment={payment}
      clinicInfo={defaultClinicInfo}
      clientInfo={defaultClientInfo}
      onDownload={handleDownload}
    />
  );
} 