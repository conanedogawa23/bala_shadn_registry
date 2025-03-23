"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

interface OrderProduct {
  productCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  serviceDate: string;
  referringMD: string;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  // Mock client data - in a real app, this would be fetched from an API
  const clientData = {
    id: clientId,
    name: "HEALTH BIOFORM",
    address: "6033 Shawson drive",
    city: "Mississauga",
    province: "Ontario",
    postalCode: "L5T 1H8"
  };
  
  // Mock product data
  const productOptions = [
    { code: "CMO100", name: "Custom Made Orthotics", price: 90.00 },
    { code: "CMO101", name: "Orthopedic Shoes", price: 150.00 },
    { code: "CMO102", name: "Custom Knee Brace", price: 200.00 },
    { code: "CMO103", name: "Back Support", price: 85.00 },
    { code: "CMO104", name: "Compression Socks", price: 45.00 },
  ];
  
  // Form state
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("Cheque");
  const [referringMD, setReferringMD] = useState<string>("");
  const [dispenseDate, setDispenseDate] = useState<string>("");
  
  // Products state
  const [products, setProducts] = useState<OrderProduct[]>([
    {
      productCode: "CMO100",
      description: "Custom Made Orthotics",
      quantity: 1,
      unitPrice: 90.00,
      serviceDate: new Date().toISOString().split('T')[0],
      referringMD: ""
    }
  ]);
  
  // Validation and submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate order total
  const orderTotal = products.reduce((total, product) => {
    return total + (product.quantity * product.unitPrice);
  }, 0);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        productCode: "CMO100",
        description: "Custom Made Orthotics",
        quantity: 1,
        unitPrice: 90.00,
        serviceDate: new Date().toISOString().split('T')[0],
        referringMD: referringMD
      }
    ]);
  };
  
  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };
  
  const handleProductChange = (index: number, field: keyof OrderProduct, value: string | number) => {
    const updatedProducts = [...products];
    
    if (field === "productCode") {
      const selectedProduct = productOptions.find(p => p.code === value as string);
      if (selectedProduct) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          [field]: value as string,
          description: selectedProduct.name,
          unitPrice: selectedProduct.price
        };
      }
    } else if (field === "quantity" || field === "unitPrice") {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: typeof value === 'string' ? parseFloat(value) : value
      };
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: value as string
      };
    }
    
    setProducts(updatedProducts);
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!orderDate) {
      newErrors.orderDate = "Order date is required";
    }
    
    if (products.length === 0) {
      newErrors.products = "At least one product is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to save the order
      // await createOrder({ clientId, orderDate, products, paymentMethod, referringMD, dispenseDate });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      alert("Order created successfully!");
      router.push(`/clients/${clientId}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Client
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.primary }}>
            Create New Order
          </h1>
          <p className="text-gray-600 mt-2">
            Client: {clientData.name}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="shadow-md border-0 mb-8">
          <CardHeader className="bg-slate-100">
            <CardTitle className="text-lg">Order Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date <span className="text-red-500">*</span></Label>
                <Input 
                  id="orderDate" 
                  type="date" 
                  value={orderDate} 
                  onChange={(e) => setOrderDate(e.target.value)}
                  className={errors.orderDate ? "border-red-500" : ""}
                />
                {errors.orderDate && (
                  <p className="text-red-500 text-sm">{errors.orderDate}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referringMD">Referring MD</Label>
                <Input 
                  id="referringMD" 
                  value={referringMD} 
                  onChange={(e) => setReferringMD(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dispenseDate">Dispense Date</Label>
                <Input 
                  id="dispenseDate" 
                  type="date" 
                  value={dispenseDate} 
                  onChange={(e) => setDispenseDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0 mb-8">
          <CardHeader className="bg-slate-100 flex flex-row justify-between items-center">
            <CardTitle className="text-lg">Products</CardTitle>
            <Button 
              type="button"
              variant="outline"
              className="bg-green-50 border-green-200 hover:bg-green-100 hover:text-green-700"
              onClick={handleAddProduct}
            >
              <Plus size={16} className="mr-2" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {errors.products && (
              <p className="text-red-500 text-sm mb-4">{errors.products}</p>
            )}
            
            {products.map((product, index) => (
              <div key={index} className="mb-6 p-4 border rounded-md">
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold">Product {index + 1}</h3>
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select 
                      value={product.productCode}
                      onValueChange={(value) => handleProductChange(index, "productCode", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {productOptions.map((option) => (
                          <SelectItem key={option.code} value={option.code}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Select 
                      value={product.quantity.toString()}
                      onValueChange={(value) => handleProductChange(index, "quantity", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((qty) => (
                          <SelectItem key={qty} value={qty.toString()}>
                            {qty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input 
                      type="text" 
                      value={`$${product.unitPrice.toFixed(2)}`}
                      readOnly 
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Service Date</Label>
                    <Input 
                      type="date" 
                      value={product.serviceDate}
                      onChange={(e) => handleProductChange(index, "serviceDate", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label>Referring MD</Label>
                    <Input 
                      value={product.referringMD || referringMD}
                      onChange={(e) => handleProductChange(index, "referringMD", e.target.value)}
                      placeholder="Same as order"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <Input 
                      type="text" 
                      value={`$${(product.quantity * product.unitPrice).toFixed(2)}`}
                      readOnly 
                      className="bg-gray-50 font-semibold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t flex justify-between pt-4">
            <div className="text-lg font-bold">
              Total: ${orderTotal.toFixed(2)}
            </div>
          </CardFooter>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleBack}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Order..." : "Create Order"}
          </Button>
        </div>
      </form>
    </div>
  );
} 