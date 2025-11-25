"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table/Table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, User, Calendar, Clock, DollarSign, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { generateLink } from "@/lib/route-utils";
import { useClinic } from "@/lib/contexts/clinic-context";

// Import API services
import { useClient, useProducts } from "@/lib/hooks";
import { ProductStatus } from "@/lib/api/productService";
import { OrderService, CreateOrderData, OrderLineItem } from "@/lib/api/orderService";

export default function ClientOrderNewPage() {
  const params = useParams();
  const router = useRouter();
  const clinic = params.clinic as string;
  const clientId = params.id as string;
  
  // Get clinic data from context
  const { availableClinics } = useClinic();
  const clinicData = useMemo(() => {
    return availableClinics.find(c => c.name === clinic);
  }, [clinic, availableClinics]);
  
  // Fetch client data using real API hook
  const { client, loading: clientLoading, error: clientError } = useClient({ 
    clientId: clientId,
    autoFetch: true 
  });
  
  // Get the real clinic name that matches our MongoDB data
  const realClinicName = useMemo(() => {
    if (!clinicData) return '';
    // Use backendName if available, otherwise use displayName
    return clinicData.backendName || clinicData.displayName || clinicData.name;
  }, [clinicData]);

  // Fetch products for the specific clinic using real API
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts({
    query: { clinicName: realClinicName, status: ProductStatus.ACTIVE },
    autoFetch: true
  });

  // Form state
  const [orderItems, setOrderItems] = useState<Partial<OrderLineItem>[]>([]);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceTime, setServiceTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filter products for current clinic if API doesn't filter correctly
  const availableProducts = useMemo(() => {
    if (!products || products.length === 0) {
      console.log('No products available from API');
      return [];
    }
    
    console.log(`Filtering ${products.length} products for clinic: ${realClinicName}`);
    
    // Filter products that match this clinic
    const filtered = products.filter(product => {
      // Only include active products
      if (product.status !== 'active') {
        return false;
      }
      
      // Check if product is available for this clinic using the applicableClinics field
      if (product.applicableClinics && product.applicableClinics.length > 0) {
        const matchesClinic = product.applicableClinics.some(
          clinicName => clinicName.toLowerCase() === realClinicName.toLowerCase()
        );
        if (matchesClinic) return true;
      }
      
      // Fallback to checking clinics field
      if (product.clinics && product.clinics.length > 0) {
        const matchesClinic = product.clinics.some(
          clinicName => clinicName.toLowerCase() === realClinicName.toLowerCase()
        );
        if (matchesClinic) return true;
      }
      
      // If no clinic restrictions and product is active, it's available to all
      if ((!product.applicableClinics || product.applicableClinics.length === 0) && 
          (!product.clinics || product.clinics.length === 0)) {
        return true;
      }
      
      return false;
    });
    
    console.log(`Found ${filtered.length} products available for ${realClinicName}`);
    return filtered;
  }, [products, realClinicName]);

  const handleBack = () => {
    router.push(generateLink('clinic', `clients/${clientId}`, clinic));
  };

  const addOrderItem = () => {
    setOrderItems(prev => [...prev, {
      productKey: 0,
      productName: '',
      quantity: 1,
      duration: 60,
      unitPrice: 120,
      subtotal: 120
    }]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateOrderItem = (index: number, field: keyof OrderLineItem, value: any) => {
    setOrderItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Recalculate subtotal if quantity or price changes
      if (field === 'quantity' || field === 'unitPrice') {
        const item = updated[index];
        updated[index].subtotal = (item.quantity || 1) * (item.unitPrice || 0);
      }
      
      return updated;
    });
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || orderItems.length === 0) return;

    setCreating(true);
    setApiError(null);

    try {
      const serviceDatetime = new Date(`${serviceDate}T${serviceTime}`);
      const endDatetime = new Date(serviceDatetime.getTime() + (orderItems[0]?.duration || 60) * 60000);

      const orderData: CreateOrderData = {
        clientId: parseInt(clientId),
        clientName: `${client.lastName}, ${client.firstName}`,
        clinicName: realClinicName || clinicData?.backendName || clinicData?.displayName || '',
        serviceDate: serviceDatetime.toISOString(),
        endDate: endDatetime.toISOString(),
        items: orderItems as OrderLineItem[],
        location,
        description
      };

      const response = await OrderService.createOrder(orderData);
      
      if (response.success) {
        setSuccess(true);
        // Redirect after success
        setTimeout(() => {
          router.push(generateLink('clinic', `clients/${clientId}`, clinic));
        }, 2000);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  // Handle clinic not found
  if (!clinicData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-lg">Clinic Not Found</h3>
                <p className="text-gray-600">The requested clinic could not be found.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-lg text-green-800">Order Created Successfully!</h3>
                <p className="text-gray-600">Redirecting to client details...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6" style={{ color: themeColors.text.primary }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Client
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create New Order</h1>
            {client && (
              <p className="text-gray-600">
                for {client.firstName} {client.lastName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(clientLoading || productsLoading) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Loading {clientLoading ? 'client' : 'products'} information...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error States */}
      {(clientError || productsError || apiError) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="flex-1">
                <h3 className="font-semibold">Error Loading Data</h3>
                <p className="text-gray-600">
                  {clientError || productsError || apiError}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button 
                    onClick={() => window.location.reload()}
                    size="sm"
                    variant="outline"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Retry
                  </Button>
                  {productsError && (
                    <Button 
                      onClick={refetchProducts}
                      size="sm"
                      variant="outline"
                    >
                      Reload Products
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Form */}
      {client && !clientLoading && !productsLoading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Client Name</Label>
                <Input 
                  value={`${client.firstName} ${client.lastName}`}
                  disabled
                />
              </div>
              <div>
                <Label>Client ID</Label>
                <Input value={client.id} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={client.email || 'N/A'} disabled />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={client.phone || 'N/A'} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceDate">Service Date</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="serviceTime">Service Time</Label>
                <Input
                  id="serviceTime"
                  type="time"
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Treatment room or location"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional notes or instructions"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Order Items
                  {availableProducts.length > 0 && (
                    <span className="text-sm text-gray-500 font-normal">
                      ({availableProducts.length} services available)
                    </span>
                  )}
                </CardTitle>
                <Button type="button" onClick={addOrderItem} size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {availableProducts.length === 0 && !productsLoading && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No Services Available</p>
                  <p>No services are configured for {clinicData?.displayName || clinicData?.name}.</p>
                  <p className="text-sm mt-2">Backend clinic name: {realClinicName}</p>
                  {products && products.length > 0 && (
                    <p className="text-sm text-yellow-600 mt-2">
                      {products.length} products loaded but none match this clinic
                    </p>
                  )}
                  <div className="flex gap-2 justify-center mt-4">
                    <Button onClick={refetchProducts} variant="outline">
                      <RefreshCw size={16} className="mr-2" />
                      Refresh Services
                    </Button>
                  </div>
                </div>
              )}

              {orderItems.length === 0 && availableProducts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No items added yet. Click &rdquo;Add Item&rdquo; to start.</p>
                </div>
              )}

              {orderItems.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select 
                            value={item.productKey?.toString() || ''}
                            onValueChange={(value) => {
                              const productKey = parseInt(value);
                              const product = availableProducts.find(p => p.productKey === productKey);
                              if (product) {
                                updateOrderItem(index, 'productKey', productKey);
                                updateOrderItem(index, 'productName', product.name);
                                updateOrderItem(index, 'duration', product.duration);
                                updateOrderItem(index, 'unitPrice', product.price);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProducts.map(product => (
                                <SelectItem key={product.productKey} value={product.productKey.toString()}>
                                  {product.name} ({product.duration}min - {formatCurrency(product.price)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{item.duration}min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice || 0}
                            onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(item.subtotal || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOrderItem(index)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {orderItems.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="text-lg font-semibold">
                    Total: {formatCurrency(calculateTotal())}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || orderItems.length === 0 || availableProducts.length === 0}
              className="flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Order...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Order
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
