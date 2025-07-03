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

// Define the order schema using zod for validation
const orderSchema = z.object({
  clientName: z.string().min(2, { message: "Client name is required" }),
  serviceType: z.string().min(1, { message: "Service type is required" }),
  practitioner: z.string().min(1, { message: "Practitioner is required" }),
  orderDate: z.date({ required_error: "Order date is required" }),
  priority: z.enum(["low", "medium", "high"], { required_error: "Priority is required" }),
  status: z.enum(["pending", "in-progress", "completed", "cancelled"], { required_error: "Status is required" }),
  notes: z.string().optional(),
  totalAmount: z.string().min(1, { message: "Total amount is required" }),
  paymentStatus: z.enum(["pending", "partial", "paid", "refunded"], { required_error: "Payment status is required" }),
});

// Type definitions
type OrderFormValues = z.infer<typeof orderSchema>;

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const orderId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderFormValues | null>(null);

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setOrderData({
          clientName: "John Doe",
          serviceType: "Physical Therapy",
          practitioner: "Dr. Sarah Johnson",
          orderDate: new Date("2024-01-15"),
          priority: "medium",
          status: "in-progress",
          notes: "Patient requires specialized treatment for lower back pain",
          totalAmount: "125.00",
          paymentStatus: "partial",
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchOrder();
  }, [orderId]);

  // Handle order update
  const handleOrderSubmit = React.useCallback((data: OrderFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Order updated for clinic:", clinic, "Order ID:", orderId, data);
      setIsSubmitting(false);
      
      // Navigate back to orders page
      router.push(`/clinic/${clinic}/orders`);
    }, 1000);
  }, [clinic, orderId, router]);

  // Handle back navigation
  const handleBack = () => {
    router.push(`/clinic/${clinic}/orders`);
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

  if (!orderData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Order Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The order you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={handleBack} className="mt-4">
            Back to Orders
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
              Edit Order #{orderId} - {clinic.replace('-', ' ')}
            </h1>
            <p className="text-gray-600 mt-1">Update order information for {clinic.replace('-', ' ')} clinic</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200" style={{ boxShadow: themeColors.shadow.large }}>
        <CardHeader className="bg-slate-50 pb-3 pt-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Edit3 size={18} />
            Edit Order Information
          </CardTitle>
          <CardDescription>
            Update the order details and information
          </CardDescription>
        </CardHeader>
        
        <FormWrapper
          schema={orderSchema}
          onSubmit={handleOrderSubmit}
          defaultValues={orderData}
        >
          {() => (
            <>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                      Order Details
                    </h3>
                    
                    <FormInput
                      name="clientName"
                      label="Client Name"
                      placeholder="John Doe"
                    />
                    
                    <FormSelect
                      name="serviceType"
                      label="Service Type"
                      options={[
                        { value: "Physical Therapy", label: "Physical Therapy" },
                        { value: "Massage Therapy", label: "Massage Therapy" },
                        { value: "Wellness Consultation", label: "Wellness Consultation" },
                        { value: "Sports Medicine", label: "Sports Medicine" },
                        { value: "Pain Management", label: "Pain Management" },
                      ]}
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
                    
                    <FormDatePicker
                      name="orderDate"
                      label="Order Date"
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                      Status & Priority
                    </h3>
                    
                    <FormSelect
                      name="priority"
                      label="Priority"
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                      ]}
                    />
                    
                    <FormSelect
                      name="status"
                      label="Order Status"
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "in-progress", label: "In Progress" },
                        { value: "completed", label: "Completed" },
                        { value: "cancelled", label: "Cancelled" },
                      ]}
                    />
                    
                    <FormInput
                      name="totalAmount"
                      label="Total Amount ($)"
                      type="number"
                      placeholder="125.00"
                    />
                    
                    <FormSelect
                      name="paymentStatus"
                      label="Payment Status"
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "partial", label: "Partial" },
                        { value: "paid", label: "Paid" },
                        { value: "refunded", label: "Refunded" },
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
                    placeholder="Additional notes about the order..."
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
                        Update Order
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