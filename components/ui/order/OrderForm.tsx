import { Button } from "@/components/ui/button";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormWrapper } from "@/components/ui/form/FormWrapper";
import { z } from "zod";
import { useFieldArray, useWatch, useForm } from "react-hook-form";
import { X, Plus } from "lucide-react";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";

/**
 * Zod schema for line items
 */
const lineItemSchema = z.object({
  productId: z.string({
    required_error: "Product is required",
  }),
  productName: z.string().optional(),
  quantity: z.coerce.number({
    required_error: "Quantity is required",
    invalid_type_error: "Quantity must be a number",
  }).min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number({
    required_error: "Unit price is required",
    invalid_type_error: "Unit price must be a number",
  }).min(0.01, "Price must be greater than 0"),
  subtotal: z.number().optional(),
});

/**
 * Zod schema for the entire order form
 */
const orderFormSchema = z.object({
  customerId: z.string({
    required_error: "Customer is required",
  }),
  orderDate: z.date({
    required_error: "Order date is required",
  }).default(new Date()),
  lineItems: z.array(lineItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  subtotal: z.number().optional(),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%").default(0),
  taxAmount: z.number().optional(),
  total: z.number().optional(),
});

/**
 * Type definition for the OrderForm props
 */
export type OrderFormValues = z.infer<typeof orderFormSchema>;

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
}

interface OrderFormProps {
  /** Initial form values for editing an existing order */
  defaultValues?: Partial<OrderFormValues>;
  /** List of products to select from */
  products: Product[];
  /** List of customers to select from */
  customers: Customer[];
  /** Callback function when form is submitted successfully */
  onSubmit: (data: OrderFormValues) => void;
  /** Callback function when cancel button is clicked */
  onCancel?: () => void;
  /** Whether the form is in a loading state */
  isLoading?: boolean;
}

/**
 * OrderForm component for creating and editing orders
 * 
 * Features:
 * - Dynamic line items management (add/remove)
 * - Automatic calculation of subtotals, tax, and total
 * - Product selection with price auto-fill
 * - Customer selection
 * - Full form validation with Zod
 * - Accessibility support
 */
export function OrderForm({
  defaultValues,
  products,
  customers,
  onSubmit,
  onCancel,
  isLoading = false,
}: OrderFormProps) {
  // Calculate the default values with proper subtotals
  const initialValues: OrderFormValues = {
    orderDate: new Date(),
    taxRate: 0,
    customerId: "",
    lineItems: [{ productId: "", quantity: 1, unitPrice: 0 }],
    notes: "",
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    ...defaultValues,
  };

  return (
    <FormWrapper
      schema={orderFormSchema}
      onSubmit={onSubmit}
      defaultValues={initialValues}
    >
      {(form) => (
        <OrderFormContent 
          form={form} 
          products={products} 
          customers={customers} 
          onCancel={onCancel} 
          isLoading={isLoading}
        />
      )}
    </FormWrapper>
  );
}

// Separate component to use hooks properly
function OrderFormContent({ 
  form, 
  products, 
  customers, 
  onCancel, 
  isLoading 
}: { 
  form: ReturnType<typeof useForm>; 
  products: Product[]; 
  customers: Customer[]; 
  onCancel?: () => void; 
  isLoading: boolean; 
}) {
  // Set up field array for dynamic line items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  // Watch values for auto-calculations
  const lineItems = useWatch({
    control: form.control,
    name: "lineItems",
  });
  
  const taxRate = useWatch({
    control: form.control,
    name: "taxRate",
  });

  // Auto-calculate totals whenever line items or tax rate changes
  useEffect(() => {
    if (!lineItems) return;
    
    // Calculate each line item subtotal and the order subtotal
    const calculatedLineItems = lineItems.map((item) => ({
      ...item,
      subtotal: item.quantity * item.unitPrice,
    }));
    
    const subtotal = calculatedLineItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    // Update form values with calculations
    form.setValue("lineItems", calculatedLineItems);
    form.setValue("subtotal", subtotal);
    form.setValue("taxAmount", taxAmount);
    form.setValue("total", total);
  }, [lineItems, taxRate, form]);

  // Handle product selection change
  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      form.setValue(`lineItems.${index}.productName`, selectedProduct.name);
      form.setValue(`lineItems.${index}.unitPrice`, selectedProduct.price);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full" aria-label="Select customer">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      field.onChange(e.target.value ? new Date(e.target.value) : null);
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Line Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
              disabled={isLoading}
              aria-label="Add line item"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-muted-foreground text-sm">No items added yet. Add an item to continue.</p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start border p-3 rounded-md">
              {/* Product Selection */}
              <div className="col-span-12 md:col-span-4">
                <FormField
                  control={form.control}
                  name={`lineItems.${index}.productId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Product</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleProductChange(index, value);
                          }}
                          value={field.value}
                          disabled={isLoading}
                        >
                          <SelectTrigger aria-label="Select product">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quantity */}
              <div className="col-span-5 md:col-span-2">
                <FormField
                  control={form.control}
                  name={`lineItems.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          disabled={isLoading}
                          aria-label="Item quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Unit Price */}
              <div className="col-span-5 md:col-span-2">
                <FormField
                  control={form.control}
                  name={`lineItems.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Unit Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...field}
                          disabled={isLoading}
                          aria-label="Unit price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subtotal (Readonly) */}
              <div className="col-span-10 md:col-span-3">
                <FormField
                  control={form.control}
                  name={`lineItems.${index}.subtotal`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Subtotal</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value?.toFixed(2) || "0.00"}
                          disabled
                          aria-label="Item subtotal"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Remove Button */}
              <div className="col-span-2 md:col-span-1 flex items-end justify-end h-full pb-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (fields.length > 1) {
                      remove(index);
                    }
                  }}
                  disabled={isLoading || fields.length <= 1}
                  aria-label="Remove line item"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Additional order notes"
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Optional notes for this order
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{form.watch("subtotal")?.toFixed(2) || "0.00"}</span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center">
                    <FormLabel className="flex-none mr-2">Tax Rate (%):</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        {...field}
                        className="max-w-[100px]"
                        disabled={isLoading}
                        aria-label="Tax rate percentage"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between min-w-[160px]">
              <span>Tax Amount:</span>
              <span>${form.watch("taxAmount")?.toFixed(2) || "0.00"}</span>
            </div>
          </div>

          <div className="flex justify-between font-semibold text-lg pt-2">
            <span>Total:</span>
            <span>${form.watch("total")?.toFixed(2) || "0.00"}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Order"}
        </Button>
      </CardFooter>
    </Card>
  );
}