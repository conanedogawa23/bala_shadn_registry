"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormWrapper } from "@/components/ui/form/FormWrapper";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormSelect } from "@/components/ui/form/FormSelect";
import { FormDatePicker } from "@/components/ui/form/FormDatePicker";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { ArrowLeft, Save, Edit3 } from "lucide-react";

// Define the payment schema using zod for validation
const paymentSchema = z.object({
  clientName: z.string().min(2, { message: "Client name is required" }),
  orderNumber: z.string().min(1, { message: "Order number is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  paymentMethod: z.enum(["cash", "credit", "debit", "cheque", "insurance"], { required_error: "Payment method is required" }),
  paymentDate: z.date({ required_error: "Payment date is required" }),
  status: z.enum(["pending", "processing", "completed", "failed", "refunded"], { required_error: "Status is required" }),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  practitioner: z.string().min(1, { message: "Practitioner is required" }),
});

// Type definitions
type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function EditPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const paymentId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentFormValues | null>(null);

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const fetchPayment = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setPaymentData({
          clientName: "Jane Smith",
          orderNumber: "ORD-001234",
          amount: "85.00",
          paymentMethod: "credit",
          paymentDate: new Date("2024-01-20"),
          status: "completed",
          transactionId: "TXN-567890",
          notes: "Payment processed successfully",
          practitioner: "Dr. Michael Chen",
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchPayment();
  }, [paymentId]);

  // Handle payment update
  const handlePaymentSubmit = React.useCallback((data: PaymentFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Payment updated for clinic:", clinic, "Payment ID:", paymentId, data);
      setIsSubmitting(false);
      
      // Navigate back to payments page
      router.push(`/clinic/${clinic}/payments`);
    }, 1000);
  }, [clinic, paymentId, router]);

  // Handle back navigation
  const handleBack = () => {
    router.push(`/clinic/${clinic}/payments`);
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
    <div className="container mx-auto py-8 px-4 sm:px-6">
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
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
              Edit Payment #{paymentId} - {clinic.replace('-', ' ')}
            </h1>
            <p className="text-gray-600 mt-1">Update payment information for {clinic.replace('-', ' ')} clinic</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200" style={{ boxShadow: themeColors.shadow.large }}>
        <CardHeader className="bg-slate-50 pb-3 pt-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Edit3 size={18} />
            Edit Payment Information
          </CardTitle>
          <CardDescription>
            Update the payment details and information
          </CardDescription>
        </CardHeader>
        
        <FormWrapper
          schema={paymentSchema}
          onSubmit={handlePaymentSubmit}
          defaultValues={paymentData}
        >
          {() => (
            <>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                      Payment Details
                    </h3>
                    
                    <FormInput
                      name="clientName"
                      label="Client Name"
                      placeholder="Jane Smith"
                    />
                    
                    <FormInput
                      name="orderNumber"
                      label="Order Number"
                      placeholder="ORD-001234"
                    />
                    
                    <FormInput
                      name="amount"
                      label="Amount ($)"
                      type="number"
                      placeholder="85.00"
                    />
                    
                    <FormSelect
                      name="paymentMethod"
                      label="Payment Method"
                      options={[
                        { value: "cash", label: "Cash" },
                        { value: "credit", label: "Credit Card" },
                        { value: "debit", label: "Debit Card" },
                        { value: "cheque", label: "Cheque" },
                        { value: "insurance", label: "Insurance" },
                      ]}
                    />
                    
                    <FormDatePicker
                      name="paymentDate"
                      label="Payment Date"
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                      Status & Processing
                    </h3>
                    
                    <FormSelect
                      name="status"
                      label="Payment Status"
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "processing", label: "Processing" },
                        { value: "completed", label: "Completed" },
                        { value: "failed", label: "Failed" },
                        { value: "refunded", label: "Refunded" },
                      ]}
                    />
                    
                    <FormInput
                      name="transactionId"
                      label="Transaction ID"
                      placeholder="TXN-567890"
                    />
                    
                    <FormSelect
                      name="practitioner"
                      label="Practitioner"
                      options={[
                        { value: "Dr. Sarah Johnson", label: "Dr. Sarah Johnson" },
                        { value: "Dr. Michael Chen", label: "Dr. Michael Chen" },
                        { value: "Dr. Emily Davis", label: "Dr. Emily Davis" },
                        { value: "Dr. David Wilson", label: "Dr. David Wilson" },
                      ]}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                    Additional Information
                  </h3>
                  
                  <FormInput
                    name="notes"
                    label="Notes"
                    placeholder="Additional notes about the payment..."
                  />
                </div>
              </CardContent>
              
              <CardFooter className="bg-slate-50 mt-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                    style={{ 
                      background: themeColors.gradient.primary,
                      boxShadow: themeColors.shadow.button
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Update Payment
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </FormWrapper>
      </Card>
    </div>
  );
} 