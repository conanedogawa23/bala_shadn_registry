import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormWrapper } from "@/components/ui/form/FormWrapper";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormSelect } from "@/components/ui/form/FormSelect";

/**
 * Client validation schema using Zod
 * Defines validation rules for client information fields
 */
export const clientSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(5, { message: "Email must be at least 5 characters" })
    .max(100, { message: "Email cannot exceed 100 characters" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number cannot exceed 20 digits" })
    .regex(/^[+]?[\d\s()-]+$/, { message: "Please enter a valid phone number" }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address cannot exceed 200 characters" }),
  city: z
    .string()
    .min(2, { message: "City must be at least 2 characters" })
    .max(100, { message: "City cannot exceed 100 characters" }),
  state: z
    .string()
    .min(2, { message: "State must be at least 2 characters" })
    .max(100, { message: "State cannot exceed 100 characters" }),
  postalCode: z
    .string()
    .min(3, { message: "Postal code must be at least 3 characters" })
    .max(20, { message: "Postal code cannot exceed 20 characters" }),
  country: z
    .string()
    .min(2, { message: "Country must be at least 2 characters" })
    .max(100, { message: "Country cannot exceed 100 characters" }),
  notes: z
    .string()
    .max(500, { message: "Notes cannot exceed 500 characters" })
    .optional(),
  clientType: z.enum(["individual", "company"], {
    required_error: "Please select a client type",
  }),
});

/**
 * Type definition for client form data
 */
export type ClientFormValues = z.infer<typeof clientSchema>;

/**
 * Props for the ClientForm component
 */
export interface ClientFormProps {
  /**
   * Default values for the form fields
   */
  defaultValues?: Partial<ClientFormValues>;
  
  /**
   * Function called when the form is submitted with valid data
   */
  onSubmit: (data: ClientFormValues) => void;
  
  /**
   * Function called when the user clicks the cancel button
   */
  onCancel?: () => void;
  
  /**
   * Loading state for the form submission
   */
  isSubmitting?: boolean;
  
  /**
   * Title to display in the form header
   */
  title?: string;
}

/**
 * ClientForm component
 * 
 * A form for creating or editing client information with validation
 * Uses react-hook-form with zod validation schema
 * 
 * @example
 * ```tsx
 * <ClientForm 
 *   onSubmit={handleSubmit} 
 *   onCancel={handleCancel}
 *   defaultValues={{ name: "John Doe", email: "john@example.com" }}
 * />
 * ```
 */
export function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  title = "Client Information",
}: ClientFormProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <FormWrapper<ClientFormValues>
        schema={clientSchema}
        onSubmit={onSubmit}
        defaultValues={{
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          notes: "",
          clientType: "individual",
          ...defaultValues,
        }}
      >
        {(form) => (
          <>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormSelect
                  name="clientType"
                  label="Client Type"
                  options={[
                    { value: "individual", label: "Individual" },
                    { value: "company", label: "Company" },
                  ]}
                  aria-label="Select client type"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                  name="name"
                  label="Name"
                  placeholder="Enter client name"
                  aria-label="Client name"
                />
                <FormInput
                  name="email"
                  label="Email"
                  placeholder="Enter email address"
                  type="email"
                  aria-label="Client email address"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                  name="phone"
                  label="Phone"
                  placeholder="Enter phone number"
                  aria-label="Client phone number"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  name="address"
                  label="Address"
                  placeholder="Enter street address"
                  aria-label="Client address"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                  name="city"
                  label="City"
                  placeholder="Enter city"
                  aria-label="Client city"
                />
                <FormInput
                  name="state"
                  label="State/Province"
                  placeholder="Enter state or province"
                  aria-label="Client state or province"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                  name="postalCode"
                  label="Postal Code"
                  placeholder="Enter postal code"
                  aria-label="Client postal code"
                />
                <FormInput
                  name="country"
                  label="Country"
                  placeholder="Enter country"
                  aria-label="Client country"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  name="notes"
                  label="Notes"
                  placeholder="Additional notes (optional)"
                  aria-label="Additional notes about the client"
                  className="h-24"
                  multiline
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                aria-label="Cancel form submission"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                aria-label="Submit client information"
              >
                {isSubmitting ? "Saving..." : "Save Client"}
              </Button>
            </CardFooter>
          </>
        )}
      </FormWrapper>
    </Card>
  );
}

