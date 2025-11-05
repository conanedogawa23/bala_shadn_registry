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
import { ArrowLeft, Save, Edit3, AlertTriangle } from "lucide-react";
import { PaymentApiService, PaymentMethod, PaymentStatus, PaymentType } from "@/lib/api/paymentService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the payment schema using zod for validation
const paymentSchema = z.object({
  clientName: z.string().min(2, { message: "Client name is required" }),
  orderNumber: z.string().optional(),
  amount: z.coerce.number({ invalid_type_error: "Amount must be a valid number" }),
  paymentMethod: z.nativeEnum(PaymentMethod, { required_error: "Payment method is required" }),
  paymentDate: z.date({ required_error: "Payment date is required" }),
  status: z.nativeEnum(PaymentStatus, { required_error: "Status is required" }),
  paymentType: z.nativeEnum(PaymentType, { required_error: "Payment type is required" }),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
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
  const [error, setError] = useState<string | null>(null);
  const [showNegativeAmountDialog, setShowNegativeAmountDialog] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<PaymentFormValues | null>(null);

  // Fetch real payment data from API
  useEffect(() => {
    const fetchPayment = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await PaymentApiService.getPaymentById(paymentId);
        
        if (response.success && response.data) {
          const payment = response.data;
          
          setPaymentData({
            clientName: payment.clientName || '',
            orderNumber: payment.orderNumber || '',
            amount: payment.amounts.totalPaymentAmount,
            paymentMethod: payment.paymentMethod,
            paymentDate: new Date(payment.paymentDate),
            status: payment.status,
            paymentType: payment.paymentType,
            transactionId: payment.referringNo || '',
            notes: payment.notes || '',
          });
        }
      } catch (err) {
        console.error("Failed to fetch payment:", err);
        setError(err instanceof Error ? err.message : 'Failed to load payment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  // Handle payment update
  const handlePaymentSubmit = React.useCallback(async (data: PaymentFormValues) => {
    // Check for negative amount and show confirmation dialog
    if (data.amount < 0) {
      setPendingPaymentData(data);
      setShowNegativeAmountDialog(true);
      return;
    }

    await submitPaymentUpdate(data);
  }, []);

  // Actually submit the payment update
  const submitPaymentUpdate = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const updateData = {
        clientName: data.clientName,
        orderNumber: data.orderNumber,
        paymentMethod: data.paymentMethod,
        paymentType: data.paymentType,
        status: data.status,
        amounts: {
          totalPaymentAmount: data.amount,
          totalPaid: data.amount >= 0 ? data.amount : 0,
          totalOwed: data.amount < 0 ? Math.abs(data.amount) : 0,
          popAmount: 0,
          popfpAmount: 0,
          dpaAmount: 0,
          dpafpAmount: 0,
          cob1Amount: 0,
          cob2Amount: 0,
          cob3Amount: 0,
          insurance1stAmount: 0,
          insurance2ndAmount: 0,
          insurance3rdAmount: 0,
          refundAmount: data.amount < 0 ? Math.abs(data.amount) : 0,
          salesRefundAmount: 0,
          writeoffAmount: 0,
          noInsurFpAmount: 0,
          badDebtAmount: 0,
        },
        referringNo: data.transactionId,
        notes: data.notes,
      };

      await PaymentApiService.updatePayment(paymentId, updateData);
      
      console.log("Payment updated successfully for clinic:", clinic, "Payment ID:", paymentId);
      
      // Navigate back to payments page
      router.push(`/clinic/${clinic}/payments`);
    } catch (err) {
      console.error("Failed to update payment:", err);
      setError(err instanceof Error ? err.message : 'Failed to update payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle negative amount confirmation
  const handleConfirmNegativeAmount = async () => {
    setShowNegativeAmountDialog(false);
    if (pendingPaymentData) {
      await submitPaymentUpdate(pendingPaymentData);
      setPendingPaymentData(null);
    }
  };

  // Handle negative amount cancellation
  const handleCancelNegativeAmount = () => {
    setShowNegativeAmountDialog(false);
    setPendingPaymentData(null);
  };

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

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center min-h-64 gap-4">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Payment</h2>
            <p>{error}</p>
          </div>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Payments
          </Button>
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
    <>
      {/* Negative Amount Confirmation Dialog */}
      <AlertDialog open={showNegativeAmountDialog} onOpenChange={setShowNegativeAmountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Negative Amount Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to save a payment with a negative amount. This typically represents a refund or adjustment.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNegativeAmount}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNegativeAmount}>
              Confirm Refund/Adjustment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                        { value: PaymentMethod.CASH, label: "Cash" },
                        { value: PaymentMethod.CREDIT_CARD, label: "Credit Card" },
                        { value: PaymentMethod.DEBIT, label: "Debit" },
                        { value: PaymentMethod.CHEQUE, label: "Cheque" },
                        { value: PaymentMethod.INSURANCE, label: "Insurance" },
                        { value: PaymentMethod.BANK_TRANSFER, label: "Bank Transfer" },
                        { value: PaymentMethod.OTHER, label: "Other" },
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
                        { value: PaymentStatus.PENDING, label: "Pending" },
                        { value: PaymentStatus.COMPLETED, label: "Completed" },
                        { value: PaymentStatus.PARTIAL, label: "Partial" },
                        { value: PaymentStatus.FAILED, label: "Failed" },
                        { value: PaymentStatus.REFUNDED, label: "Refunded" },
                        { value: PaymentStatus.WRITEOFF, label: "Write-off" },
                      ]}
                    />
                    
                    <FormSelect
                      name="paymentType"
                      label="Payment Type"
                      options={[
                        { value: PaymentType.POP, label: "Patient Out of Pocket" },
                        { value: PaymentType.POPFP, label: "POP Final Payment" },
                        { value: PaymentType.DPA, label: "Direct Payment Authorization" },
                        { value: PaymentType.DPAFP, label: "DPA Final Payment" },
                        { value: PaymentType.INSURANCE_1ST, label: "1st Insurance" },
                        { value: PaymentType.INSURANCE_2ND, label: "2nd Insurance" },
                        { value: PaymentType.SALES_REFUND, label: "Sales Refund" },
                        { value: PaymentType.WRITEOFF, label: "Write-off" },
                      ]}
                    />
                    
                    <FormInput
                      name="transactionId"
                      label="Transaction/Reference ID"
                      placeholder="TXN-567890"
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
    </>
  );
} 