import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash2, Package, Clipboard, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export const orderFormSchema = z.object({
  clientId: z.string().min(1, { message: "Please select a client." }),
  orderNumber: z.string().optional(),
  status: z.enum(["pending", "processing", "completed", "cancelled", "delivered"]),
  paymentStatus: z.enum(["paid", "unpaid", "partial", "refunded"]),
  items: z.array(
    z.object({
      id: z.string().optional(),
      productId: z.string().min(1, { message: "Please select a product." }),
      name: z.string().min(1, { message: "Product name is required." }),
      quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
      price: z.coerce.number().min(0, { message: "Price must be a valid number." }),
    })
  ).min(1, { message: "At least one item is required." }),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export interface ClientOption {
  id: string;
  name: string;
}

export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export interface OrderFormProps {
  defaultValues?: Partial<OrderFormValues>;
  onSubmit: (data: OrderFormValues) => void;
  clients: ClientOption[];
  products: ProductOption[];
  isLoading?: boolean;
}

export function OrderForm({
  defaultValues,
  onSubmit,
  clients,
  products,
  isLoading = false,
}: OrderFormProps) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      clientId: "",
      orderNumber: "",
      status: "pending",
      paymentStatus: "unpaid",
      items: [{ productId: "", name: "", quantity: 1, price: 0 }],
      notes: "",
      ...defaultValues,
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const calculateTotal = () => {
    const items = form.getValues("items");
    return items.reduce((sum, item) => 
      sum + (item.quantity || 0) * (item.price || 0), 0
    );
  };
  
  const handleProductChange = (value: string, index: number) => {
    const product = products.find(p => p.id === value);
    if (product) {
      form.setValue(`items.${index}.productId`, product.id);
      form.setValue(`items.${index}.name`, product.name);
      form.setValue(`items.${index}.price`, product.price);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
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
            name="orderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clipboard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Will be generated if left empty" 
                      className="pl-10" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Leave empty for auto-generation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Order Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", name: "", quantity: 1, price: 0 })}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
          
          {fields.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Package className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  No items added yet. Click "Add Item" to add products to this order.
                </p>
              </CardContent>
            </Card>
          )}
          
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4">
              {index > 0 && <Separator className="my-4" />}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select
                          onValueChange={(value) => handleProductChange(value, index)}
                          value={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ${product.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="hidden">
                  <FormField
                    control={form.control}
                    name={`items.${index}.name`}
                    render={({ field }) => (
                      <Input {...field} type="hidden" />
                    )}
                  />
                </div>
                
                <div className="col-span-4 sm:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-4 sm:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min={0} 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-4 sm:col-span-1 flex items-end justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={isLoading || fields.length === 1}
                    className="h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end mt-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-medium">${calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Notes</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea 
                    placeholder="Additional notes about this order" 
                    className="min-h-[100px] pl-10" 
                    {...field} 
                    value={field.value || ""}
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Add any special requests or information about this order
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
