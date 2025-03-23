"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table/Table";
import { ArrowLeft, Save, AlertCircle, Trash2, Plus } from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

// Interfaces
interface OrderProduct {
  id: string;
  productCode: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  serviceDate: string;
  referringMD: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  orderDate: string;
  clientId: string;
  clientName: string;
  products: OrderProduct[];
  totalAmount: number;
  totalPaid: number;
  totalOwed: number;
  paymentMethod: string;
  dispenseDate: string | null;
  status: string;
}

export default function OrderEditPage({ params }: { params: { id: string; orderId: string } }) {
  const router = useRouter();
  const { id: clientId, orderId } = params;
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Order data state
  const [orderData, setOrderData] = useState<OrderData>({
    id: "",
    orderNumber: "",
    orderDate: "",
    clientId: "",
    clientName: "",
    products: [],
    totalAmount: 0,
    totalPaid: 0,
    totalOwed: 0,
    paymentMethod: "",
    dispenseDate: null,
    status: ""
  });
  
  // Track changes to payment amounts
  const [paymentInfo, setPaymentInfo] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalOwed: 0
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Payment method options
  const paymentMethods = ["Cheque", "Credit Card", "Debit", "Cash", "Insurance"];
  
  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, simulate network delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock order data
        const mockOrderData: OrderData = {
          id: orderId,
          orderNumber: "SH90123",
          orderDate: "2023-12-15",
          clientId: clientId,
          clientName: "ROBINSON, DAVID",
          products: [
            {
              id: "1",
              productCode: "CMO100",
              productName: "Custom Made Orthotics",
              description: "Custom Made Orthotics\nnon-orthotic",
              quantity: 1,
              unitPrice: 90,
              serviceDate: "2023-12-15",
              referringMD: "Dr. Rementilla, F"
            },
            {
              id: "2",
              productCode: "MED200",
              productName: "Medical Compression Stockings",
              description: "Medical Compression Stockings\n20-30 mmHg",
              quantity: 2,
              unitPrice: 65,
              serviceDate: "2023-12-15",
              referringMD: "Dr. Rementilla, F"
            }
          ],
          totalAmount: 220,
          totalPaid: 220,
          totalOwed: 0,
          paymentMethod: "Credit Card",
          dispenseDate: "2023-12-20",
          status: "Final Paid"
        };
        
        setOrderData(mockOrderData);
        setPaymentInfo({
          totalAmount: mockOrderData.totalAmount,
          totalPaid: mockOrderData.totalPaid,
          totalOwed: mockOrderData.totalOwed
        });
      } catch (err) {
        setError("Failed to load order data. Please try again.");
        console.error("Error fetching order data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderData();
  }, [clientId, orderId]);
  
  // Calculate order totals
  const calculateTotals = (products: OrderProduct[]) => {
    const total = products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0);
    const owed = Math.max(0, total - paymentInfo.totalPaid);
    
    return {
      totalAmount: total,
      totalOwed: owed
    };
  };
  
  // Handle product changes
  const handleProductChange = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...orderData.products];
    
    // Convert to number for quantity and unitPrice fields
    if (field === "quantity" || field === "unitPrice") {
      value = parseFloat(value as string) || 0;
    }
    
    // Update the specific field in the product
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    
    // Recalculate totals
    const { totalAmount, totalOwed } = calculateTotals(updatedProducts);
    
    // Update order data with new products and totals
    setOrderData(prev => ({
      ...prev,
      products: updatedProducts,
      totalAmount
    }));
    
    // Update payment info
    setPaymentInfo(prev => ({
      ...prev,
      totalAmount,
      totalOwed
    }));
  };
  
  // Handle payment info changes
  const handlePaymentInfoChange = (field: string, value: string) => {
    // Convert to number
    const numValue = parseFloat(value) || 0;
    
    const updatedPaymentInfo = {
      ...paymentInfo,
      [field]: numValue
    };
    
    // Recalculate totalOwed
    if (field === "totalPaid") {
      updatedPaymentInfo.totalOwed = Math.max(0, paymentInfo.totalAmount - numValue);
    }
    
    setPaymentInfo(updatedPaymentInfo);
  };
  
  // Handle general order field changes
  const handleOrderChange = (field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Delete product from order
  const handleDeleteProduct = (index: number) => {
    const updatedProducts = orderData.products.filter((_, i) => i !== index);
    
    // Recalculate totals
    const { totalAmount, totalOwed } = calculateTotals(updatedProducts);
    
    // Update order data
    setOrderData(prev => ({
      ...prev,
      products: updatedProducts,
      totalAmount
    }));
    
    // Update payment info
    setPaymentInfo(prev => ({
      ...prev,
      totalAmount,
      totalOwed
    }));
  };
  
  // Add new product to order
  const handleAddProduct = () => {
    const newProduct: OrderProduct = {
      id: `new-${Date.now()}`,
      productCode: "",
      productName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      serviceDate: new Date().toISOString().split('T')[0],
      referringMD: orderData.products[0]?.referringMD || ""
    };
    
    setOrderData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };
  
  // Determine order status based on payment
  const determineOrderStatus = () => {
    if (paymentInfo.totalPaid === 0) {
      return "Unpaid";
    } else if (paymentInfo.totalPaid < paymentInfo.totalAmount) {
      return "Partially Paid";
    } else {
      return "Final Paid";
    }
  };
  
  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Check required fields
    if (!orderData.orderDate) errors.orderDate = "Order date is required";
    
    // Check products
    if (orderData.products.length === 0) {
      errors.products = "At least one product is required";
    } else {
      orderData.products.forEach((product, index) => {
        if (!product.productName) {
          errors[`product_${index}_name`] = "Product name is required";
        }
        if (product.quantity <= 0) {
          errors[`product_${index}_quantity`] = "Quantity must be greater than 0";
        }
      });
    }
    
    // Set validation errors and return result
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Update order status based on payment
      const status = determineOrderStatus();
      
      const finalOrderData = {
        ...orderData,
        totalAmount: paymentInfo.totalAmount,
        totalPaid: paymentInfo.totalPaid,
        totalOwed: paymentInfo.totalOwed,
        status
      };
      
      // In a real app, this would be an API call
      // For now, simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the data that would be sent to the API
      console.log('Saving order data:', finalOrderData);
      
      // Navigate back to client detail page after successful save
      router.push(`/clients/${clientId}?tab=order_history`);
    } catch (err) {
      setError("Failed to save order data. Please try again.");
      console.error("Error saving order data:", err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handler to navigate back to client detail page
  const handleCancel = () => {
    router.push(`/clients/${clientId}?tab=order_history`);
  };
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Client
        </Button>
      </div>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.primary }}>
            Edit Order
          </h1>
          <p className="text-gray-600 mt-2">
            Order #{orderData.orderNumber} for {orderData.clientName}
          </p>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex items-center mb-6">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Order Edit Form */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Order Details Card */}
          <Card className="shadow-md border-0 mb-8">
            <CardHeader className="bg-slate-100">
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Order Date:</Label>
                  <Input 
                    id="orderDate" 
                    type="date" 
                    value={orderData.orderDate} 
                    onChange={(e) => handleOrderChange("orderDate", e.target.value)}
                    aria-required="true"
                    aria-invalid={!!formErrors.orderDate}
                    className={formErrors.orderDate ? "border-red-500" : ""}
                  />
                  {formErrors.orderDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.orderDate}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method:</Label>
                  <Select 
                    value={orderData.paymentMethod}
                    onValueChange={(value) => handleOrderChange("paymentMethod", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dispenseDate">Dispense Date:</Label>
                  <Input 
                    id="dispenseDate" 
                    type="date" 
                    value={orderData.dispenseDate || ""} 
                    onChange={(e) => handleOrderChange("dispenseDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Products Card */}
          <Card className="shadow-md border-0 mb-8">
            <CardHeader className="bg-slate-100 flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Products</CardTitle>
              <Button 
                type="button"
                size="sm"
                onClick={handleAddProduct}
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                Add Product
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>QTY</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Service Date</TableHead>
                      <TableHead>Referring MD</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderData.products.length > 0 ? (
                      orderData.products.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Input 
                              value={product.productName} 
                              onChange={(e) => handleProductChange(index, "productName", e.target.value)}
                              aria-invalid={!!formErrors[`product_${index}_name`]}
                              className={formErrors[`product_${index}_name`] ? "border-red-500" : ""}
                            />
                            {formErrors[`product_${index}_name`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`product_${index}_name`]}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={product.description} 
                              onChange={(e) => handleProductChange(index, "description", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="w-20">
                            <Input 
                              type="number" 
                              min="1"
                              value={product.quantity} 
                              onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                              aria-invalid={!!formErrors[`product_${index}_quantity`]}
                              className={formErrors[`product_${index}_quantity`] ? "border-red-500" : ""}
                            />
                            {formErrors[`product_${index}_quantity`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`product_${index}_quantity`]}</p>
                            )}
                          </TableCell>
                          <TableCell className="w-28">
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              value={product.unitPrice} 
                              onChange={(e) => handleProductChange(index, "unitPrice", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(product.quantity * product.unitPrice)}
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="date" 
                              value={product.serviceDate} 
                              onChange={(e) => handleProductChange(index, "serviceDate", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={product.referringMD} 
                              onChange={(e) => handleProductChange(index, "referringMD", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteProduct(index)}
                              className="h-8 w-8 p-0"
                              disabled={orderData.products.length === 1} // Prevent deleting last product
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          No products added to this order
                          {formErrors.products && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.products}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Card */}
          <Card className="shadow-md border-0 mb-8">
            <CardHeader className="bg-slate-100">
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="max-w-md ml-auto">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg">{formatCurrency(paymentInfo.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <Label htmlFor="totalPaid" className="font-medium">Amount Paid:</Label>
                  <div className="w-32">
                    <Input 
                      id="totalPaid"
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentInfo.totalPaid}
                      onChange={(e) => handlePaymentInfoChange("totalPaid", e.target.value)}
                      className="text-right"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 font-medium">
                  <span>Amount Owed:</span>
                  <span className="text-lg text-red-600">{formatCurrency(paymentInfo.totalOwed)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 pt-4 border-t">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex items-center gap-2"
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
} 