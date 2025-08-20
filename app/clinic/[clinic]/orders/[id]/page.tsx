"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { ArrowLeft, Edit2, Printer, FileText, DollarSign, User, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MockDataService, type Client } from "@/lib/data/mockDataService";
import { generateLink } from "@/lib/route-utils";

// Define Order type locally
interface OrderProduct {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  clientName: string;
  clientId: string;
  productCount: number;
  totalAmount: number;
  totalPaid: number;
  totalOwed: number;
  status: "paid" | "partially paid" | "unpaid";
  products: OrderProduct[];
  clinic: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const orderId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get clinic data from slug
        const clinicData = MockDataService.getClinicsBySlug(clinic);
        if (clinicData) {
          // Get all orders for this clinic
          const orders = MockDataService.getOrdersByClinic(clinicData.name);
          
          // Find the specific order
          const foundOrder = orders.find(o => o.id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
            
            // Try to find the client if we have a valid clientId
            if (foundOrder.clientId) {
              const clients = MockDataService.getClientsByClinic(clinicData.name);
              const foundClient = clients.find(c => c.id === foundOrder.clientId);
              if (foundClient) {
                setClient(foundClient);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderData();
  }, [clinic, orderId]);

  // Handle back navigation
  const handleBack = () => {
    router.push(generateLink('clinic', 'orders', clinic));
  };

  // Handle edit order
  const handleEdit = () => {
    router.push(generateLink('clinic', `orders/${orderId}/edit`, clinic));
  };

  // Handle print invoice
  const handlePrint = () => {
    window.print();
  };

  // Get status badge
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "partially paid":
        return <Badge className="bg-yellow-500">Partially Paid</Badge>;
      case "unpaid":
        return <Badge className="bg-red-500">Unpaid</Badge>;
      default:
        return null;
    }
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

  if (!order) {
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
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              {formatDate(order.orderDate)} - {clinic.replace('-', ' ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit2 size={16} />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText size={18} />
                Order Summary
              </CardTitle>
              <CardDescription>
                Details of order #{order.orderNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Order Number</div>
                    <div className="font-medium">{order.orderNumber}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Order Date</div>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(order.orderDate)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Client</div>
                    <div className="font-medium flex items-center gap-1">
                      <User size={14} />
                      {order.clientName}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Products */}
                <div>
                  <h3 className="font-medium mb-3">Products & Services</h3>
                  <div className="space-y-4">
                    {order.products.map((product, index) => (
                      <div key={index} className="flex justify-between items-start border-b pb-3">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.description}</div>
                          <div className="text-sm mt-1">
                            {formatCurrency(product.price)} × {product.quantity}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(product.price * product.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">Subtotal</div>
                    <div>{formatCurrency(order.totalAmount)}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">Tax</div>
                    <div>{formatCurrency(order.totalAmount * 0.13)}</div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <div>Total</div>
                    <div>{formatCurrency(order.totalAmount * 1.13)}</div>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <div>Paid</div>
                    <div>{formatCurrency(order.totalPaid)}</div>
                  </div>
                  {order.totalOwed > 0 && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <div>Balance Due</div>
                      <div>{formatCurrency(order.totalOwed)}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Info */}
        <div>
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User size={18} />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {client ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{client.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div>{client.email}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div>{client.phone}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div>{client.city}, {client.province}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => {
                      router.push(generateLink('clinic', `clients/${client.id}`, clinic));
                    }}
                  >
                    View Client Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted-foreground">Client information not available</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="shadow-sm border border-gray-200 mt-6">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign size={18} />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="font-medium">{formatCurrency(order.totalAmount * 1.13)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Amount Paid</div>
                  <div className="font-medium text-green-600">{formatCurrency(order.totalPaid)}</div>
                </div>
                {order.totalOwed > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Balance Due</div>
                    <div className="font-medium text-red-600">{formatCurrency(order.totalOwed)}</div>
                  </div>
                )}
                <Button 
                  className="w-full mt-2"
                  style={{ 
                    background: themeColors.gradient.primary,
                    boxShadow: themeColors.shadow.button
                  }}
                >
                  Record Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}