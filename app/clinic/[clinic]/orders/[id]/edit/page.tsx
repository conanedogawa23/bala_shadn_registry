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
import { generateLink } from "@/lib/route-utils";
import { OrderService, Order, OrderStatus, PaymentStatus } from "@/lib/api/orderService";

// Define the order schema using zod for validation - aligned with API
const orderSchema = z.object({
  clientName: z.string().min(2, { message: "Client name is required" }),
  status: z.nativeEnum(OrderStatus, { required_error: "Status is required" }),
  paymentStatus: z.nativeEnum(PaymentStatus, { required_error: "Payment status is required" }),
  serviceDate: z.date({ required_error: "Service date is required" }),
  endDate: z.date().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  totalAmount: z.string().min(1, { message: "Total amount is required" }),
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
  const [error, setError] = useState<string | null>(null);

  // Fetch order data from API
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await OrderService.getOrderById(orderId);
        if (response.success && response.data) {
          const order = response.data;
          setOrderData({
            clientName: order.clientName,
            status: order.status,
            paymentStatus: order.paymentStatus,
            serviceDate: new Date(order.serviceDate),
            endDate: order.endDate ? new Date(order.endDate) : undefined,
            location: order.location || "",
            description: order.description || "",
            totalAmount: order.totalAmount.toString(),
          });
        } else {
          setError("Failed to load order data");
        }
             } catch (err) {
         console.error("Error fetching order:", err);
         setError("Failed to load order data");
       } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Handle order update
  const handleOrderSubmit = React.useCallback(async (data: OrderFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare update data
      const updateData: Partial<Order> = {
        clientName: data.clientName,
        status: data.status,
        paymentStatus: data.paymentStatus,
        serviceDate: data.serviceDate.toISOString(),
        endDate: data.endDate ? data.endDate.toISOString() : undefined,
        location: data.location || undefined,
        description: data.description || undefined,
        totalAmount: parseFloat(data.totalAmount),
      };

      // Make API call to update order
      const response = await OrderService.updateOrder(orderId, updateData);
      
      if (response.success) {
        console.log("Order updated successfully");
        // Navigate back to orders page
        router.push(generateLink('clinic', 'orders', clinic));
      } else {
        throw new Error("Failed to update order");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update order";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [clinic, orderId, router]);

  // Handle back navigation
  const handleBack = () => {
    router.push(generateLink('clinic', 'orders', clinic));
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

  if (error || !orderData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            {error ? "Error Loading Order" : "Order Not Found"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {error || "The order you're looking for doesn't exist or has been removed."}
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
              {error && (
                <CardContent className="pt-6">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="text-sm text-red-700">
                        <strong>Error:</strong> {error}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
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
                    
                    <FormDatePicker
                      name="serviceDate"
                      label="Service Date"
                    />
                    
                    <FormDatePicker
                      name="endDate"
                      label="End Date (Optional)"
                    />
                    
                    <FormInput
                      name="totalAmount"
                      label="Total Amount ($)"
                      type="number"
                      step="0.01"
                      placeholder="125.00"
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                      Status & Location
                    </h3>
                    
                    <FormSelect
                      name="status"
                      label="Order Status"
                      options={OrderService.getOrderStatusOptions().map(option => ({
                        value: option.value,
                        label: option.label
                      }))}
                    />
                    
                    <FormSelect
                      name="paymentStatus"
                      label="Payment Status"
                      options={OrderService.getPaymentStatusOptions().map(option => ({
                        value: option.value,
                        label: option.label
                      }))}
                    />
                    
                    <FormInput
                      name="location"
                      label="Location (Optional)"
                      placeholder="Room 1, Main Building"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                    Additional Information
                  </h3>
                  
                  <FormInput
                    name="description"
                    label="Description"
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