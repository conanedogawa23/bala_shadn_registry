import { z } from "zod";

export const OrderSchema = z.object({
  orderId: z.string()
    .min(1, { message: "Order ID is required" })
    .length(12, { message: "Must be exactly 12 characters" }),
  totalAmount: z.number()
    .min(1, { message: "Minimum order amount is $1" })
    .max(10000, { message: "Maximum order amount is $10,000" }),
  orderDate: z.date({
    required_error: "Order date is required",
    invalid_type_error: "Invalid date format",
  }),
  customerId: z.string()
    .min(1, { message: "Customer ID is required" })
    .uuid({ message: "Must be a valid UUID format" }),
  items: z.array(z.object({
    sku: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0.01),
  })).min(1, { message: "At least one item required" }),
});

export type OrderFormValues = z.infer<typeof OrderSchema>;

