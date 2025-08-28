'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  Package,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Building
} from 'lucide-react';
import { slugToClinic } from '@/lib/data/clinics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { generateLink } from '@/lib/route-utils';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Import real API hooks and utilities
import { 
  useOrder, 
  useClient, 
  useOrderMutation,
  useProducts,
  OrderUtils,
  OrderStatus,
  PaymentStatus,
  type Order,
  type OrderLineItem
} from "@/lib/hooks";

// Form validation schemas
const orderItemSchema = z.object({
  productKey: z.number().min(1, "Product is required"),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

const orderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  serviceDate: z.string().min(1, "Service date is required"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

type OrderFormValues = z.infer<typeof orderSchema>;
type OrderItemFormValues = z.infer<typeof orderItemSchema>;

export default function EditClientOrderPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const clientId = parseInt(params.id as string);
  const orderId = params.orderId as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<OrderItemFormValues[]>([]);
  
  // Get clinic data for context
  const clinicData = useMemo(() => slugToClinic(clinic), [clinic]);
  
  // Fetch order using real API
  const { 
    order, 
    loading: orderLoading, 
    error: orderError,
    refetch: refetchOrder
  } = useOrder({
    id: orderId,
    autoFetch: !!orderId
  });

  // Fetch client data for context
  const { 
    client, 
    loading: clientLoading,
    error: clientError
  } = useClient({
    id: clientId,
    autoFetch: !!clientId
  });

  // Fetch products for item selection
  const { 
    products, 
    loading: productsLoading
  } = useProducts({
    autoFetch: true
  });

  // Order mutation hook
  const { updateOrder } = useOrderMutation();

  // Form setup
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      status: OrderStatus.SCHEDULED,
      paymentStatus: PaymentStatus.PENDING,
      serviceDate: '',
      endDate: '',
      location: '',
      description: '',
      items: []
    }
  });

  // Initialize form with order data
  useEffect(() => {
    if (order) {
      const formattedServiceDate = new Date(order.serviceDate).toISOString().split('T')[0];
      const formattedEndDate = order.endDate ? new Date(order.endDate).toISOString().split('T')[0] : '';
      
      form.reset({
        status: order.status,
        paymentStatus: order.paymentStatus,
        serviceDate: formattedServiceDate,
        endDate: formattedEndDate,
        location: order.location || '',
        description: order.description || '',
        items: order.items.map(item => ({
          productKey: item.productKey,
          productName: item.productName,
          quantity: item.quantity,
          duration: item.duration,
          unitPrice: item.unitPrice
        }))
      });
      
      setItems(order.items.map(item => ({
        productKey: item.productKey,
        productName: item.productName,
        quantity: item.quantity,
        duration: item.duration,
        unitPrice: item.unitPrice
      })));
    }
  }, [order, form]);

  const handleBack = () => {
    router.push(generateLink('clinic', `clients/${clientId}/orders/${orderId}`, clinic));
  };

  const addItem = useCallback(() => {
    const newItem: OrderItemFormValues = {
      productKey: 0,
      productName: '',
      quantity: 1,
      duration: 30,
      unitPrice: 0
    };
    setItems(prevItems => [...prevItems, newItem]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, field: keyof OrderItemFormValues, value: string | number) => {
    setItems(prevItems => 
      prevItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  }, []);

  const selectProduct = useCallback((index: number, productKey: number) => {
    const product = products.find(p => p.productKey === productKey);
    if (product) {
      updateItem(index, 'productKey', productKey);
      updateItem(index, 'productName', product.productName);
      updateItem(index, 'unitPrice', product.price || 0);
      updateItem(index, 'duration', product.duration || 30);
    }
  }, [products, updateItem]);

  const calculateItemSubtotal = useCallback((item: OrderItemFormValues) => {
    return item.quantity * item.unitPrice;
  }, []);

  const calculateTotals = useCallback(() => {
    const total = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalDuration = items.reduce((sum, item) => sum + (item.duration * item.quantity), 0);
    
    return {
      totalQuantity,
      totalDuration,
      total // For healthcare, no tax calculation needed
    };
  }, [items, calculateItemSubtotal]);

  const totals = useMemo(() => calculateTotals(), [calculateTotals]);

  const onSubmit = async (data: OrderFormValues) => {
    if (items.length === 0) {
      form.setError('items', { message: 'At least one item is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare the update data
      const updateData = {
        status: data.status,
        paymentStatus: data.paymentStatus,
        serviceDate: data.serviceDate,
        endDate: data.endDate || undefined,
        location: data.location || undefined,
        description: data.description || undefined,
        items: items.map(item => ({
          productKey: item.productKey,
          productName: item.productName,
          quantity: item.quantity,
          duration: item.duration,
          unitPrice: item.unitPrice,
          subtotal: calculateItemSubtotal(item) // Line item subtotal (not order subtotal)
        })),
        totalAmount: totals.total,
        totalDuration: totals.totalDuration
      };

      await updateOrder(orderId, updateData);
      
      // Navigate back to order details
      router.push(generateLink('clinic', `clients/${clientId}/orders/${orderId}`, clinic));
    } catch (error) {
      console.error('Error updating order:', error);
      // Form error will be handled by the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (orderLoading || clientLoading || productsLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="text-lg text-gray-600">Loading order...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (orderError || clientError) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Order</h3>
            <p className="mt-1 text-sm text-gray-500">
              {orderError || clientError}
            </p>
            <div className="mt-4 space-x-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Order
              </Button>
              <Button onClick={refetchOrder}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Order Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The requested order could not be found.
            </p>
            <Button variant="outline" onClick={handleBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Order
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Order</h1>
            <p className="text-sm text-gray-600 mt-1">
              {clinicData?.name || clinic} • {client?.firstName} {client?.lastName} • Order #{order.orderNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package size={20} />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(OrderStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {OrderUtils.getStatusLabel(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(PaymentStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {OrderUtils.getPaymentStatusLabel(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter order description or notes" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package size={20} />
                      Order Items
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2">No items added yet</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addItem}
                          className="mt-4"
                        >
                          <Plus size={16} className="mr-2" />
                          Add First Item
                        </Button>
                      </div>
                    ) : (
                      items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Item #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label htmlFor={`product-${index}`}>Product</Label>
                              <Select 
                                value={item.productKey.toString()} 
                                onValueChange={(value) => selectProduct(index, parseInt(value))}
                              >
                                <SelectTrigger id={`product-${index}`}>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product.productKey} value={product.productKey.toString()}>
                                      {product.productName} - {OrderUtils.formatCurrency(product.price || 0)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                              <Input
                                id={`quantity-${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`duration-${index}`}>Duration (minutes)</Label>
                              <Input
                                id={`duration-${index}`}
                                type="number"
                                min="1"
                                value={item.duration}
                                onChange={(e) => updateItem(index, 'duration', parseInt(e.target.value) || 1)}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`price-${index}`}>Unit Price</Label>
                              <Input
                                id={`price-${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              {item.quantity} × {OrderUtils.formatCurrency(item.unitPrice)} × {item.duration} min
                            </span>
                            <span className="font-medium">
                              Subtotal: {OrderUtils.formatCurrency(calculateItemSubtotal(item))}
                            </span>
                          </div>
                        </div>
                      ))
                    )}

                    {items.length > 0 && (
                      <>
                        <Separator />
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Items:</span>
                              <span className="font-medium">{items.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Quantity:</span>
                              <span className="font-medium">{totals.totalQuantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Duration:</span>
                              <span className="font-medium">{totals.totalDuration} minutes</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                              <span>Total Amount:</span>
                              <span>{OrderUtils.formatCurrency(totals.total)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {form.formState.errors.items && (
                    <p className="text-sm text-red-600 mt-2">
                      {form.formState.errors.items.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSubmitting ? 'Saving...' : 'Save Order'}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-lg">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-sm text-gray-600">ID: {client.clientId}</p>
                  </div>
                  
                  {client.email && (
                    <div className="text-sm text-gray-600">
                      <strong>Email:</strong> {client.email}
                    </div>
                  )}
                  
                  {client.phone && (
                    <div className="text-sm text-gray-600">
                      <strong>Phone:</strong> {client.phone}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Client information not available</div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{totals.totalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{totals.totalDuration} min</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{OrderUtils.formatCurrency(totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Original Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Original Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Order Number:</strong> {order.orderNumber}
                </div>
                <div>
                  <strong>Created:</strong> {OrderUtils.formatDate(order.orderDate)}
                </div>
                <div>
                  <strong>Status:</strong> {OrderUtils.getStatusLabel(order.status)}
                </div>
                <div>
                  <strong>Original Total:</strong> {OrderUtils.formatCurrency(order.totalAmount)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Text */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Select products from the dropdown to auto-fill pricing</p>
                <p>• Adjust quantities and durations as needed</p>
                <p>• Unit prices can be manually overridden</p>
                <p>• Status changes will affect billing workflow</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 