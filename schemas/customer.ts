import { z } from "zod";

export const CustomerSchema = z.object({
  fullName: z.string()
    .min(1, { message: "Full name is required" })
    .max(50, { message: "Maximum 50 characters" }),
  email: z.string()
    .email({ message: "Invalid email address" })
    .max(75, { message: "Maximum 75 characters" }),
  phone: z.string()
    .min(10, { message: "Minimum 10 digits required" })
    .max(15, { message: "Maximum 15 digits allowed" })
    .regex(/^[0-9+\-() ]+$/, { message: "Invalid phone number format" }),
  birthDate: z.date({
    required_error: "Birth date is required",
    invalid_type_error: "Invalid date format",
  }),
  loyaltyPoints: z.number()
    .min(0, { message: "Cannot have negative points" })
    .max(10000, { message: "Maximum 10,000 points allowed" }),
});

export type CustomerFormValues = z.infer<typeof CustomerSchema>;

