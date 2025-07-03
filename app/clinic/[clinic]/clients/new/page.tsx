"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormWrapper } from "@/components/ui/form/FormWrapper";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormSelect } from "@/components/ui/form/FormSelect";
import { FormDatePicker } from "@/components/ui/form/FormDatePicker";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { ArrowLeft, Save, UserPlus } from "lucide-react";

// Define the client schema using zod for validation
const clientSchema = z.object({
  // Personal Information
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["male", "female", "other"], { required_error: "Gender is required" }),
  
  // Contact Information
  email: z.string().email({ message: "Please enter a valid email address" }),
  cellPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  homePhone: z.string().optional(),
  workPhone: z.string().optional(),
  extension: z.string().optional(),
  
  // Additional Details
  address: z.string().min(5, { message: "Address is required" }),
  companyName: z.string().optional(),
  referringMD: z.string().optional(),
  familyMD: z.string().optional(),
  
  // Additional Fields
  heardAboutUs: z.string().optional(),
});

// Type definitions
type ClientFormValues = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Handle client creation
  const handleClientSubmit = React.useCallback((data: ClientFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("New client created for clinic:", clinic, data);
      setIsSubmitting(false);
      
      // Navigate back to clients page
      router.push(`/clinic/${clinic}/clients`);
    }, 1000);
  }, [clinic, router]);

  // Handle back navigation
  const handleBack = () => {
    router.push(`/clinic/${clinic}/clients`);
  };

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
              New Client - {clinic.replace('-', ' ')}
            </h1>
            <p className="text-gray-600 mt-1">Add a new client to {clinic.replace('-', ' ')} clinic</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200" style={{ boxShadow: themeColors.shadow.large }}>
        <CardHeader className="bg-slate-50 pb-3 pt-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <UserPlus size={18} />
            Client Information
          </CardTitle>
          <CardDescription>
            Enter the new client&apos;s personal information and contact details
          </CardDescription>
        </CardHeader>
        
        <FormWrapper
          schema={clientSchema}
          onSubmit={handleClientSubmit}
          defaultValues={{
            name: "",
            dateOfBirth: new Date(),
            gender: "male",
            email: "",
            cellPhone: "",
            homePhone: "",
            workPhone: "",
            extension: "",
            address: "",
            companyName: "",
            referringMD: "",
            familyMD: "",
            heardAboutUs: "",
          }}
        >
          {() => (
            <>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                      Personal Information
                    </h3>
                    
                    <FormInput
                      name="name"
                      label="Full Name"
                      placeholder="John Doe"
                    />
                    
                    <FormDatePicker
                      name="dateOfBirth"
                      label="Date of Birth"
                    />
                    
                    <FormSelect
                      name="gender"
                      label="Gender"
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                    
                    <FormInput
                      name="address"
                      label="Address"
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                      Contact Information
                    </h3>
                    
                    <FormInput
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                    />
                    
                    <FormInput
                      name="cellPhone"
                      label="Cell Phone"
                      placeholder="(123) 456-7890"
                    />
                    
                    <FormInput
                      name="homePhone"
                      label="Home Phone"
                      placeholder="(123) 456-7890"
                    />
                    
                    <FormInput
                      name="workPhone"
                      label="Work Phone"
                      placeholder="(123) 456-7890"
                    />
                    
                    <FormInput
                      name="extension"
                      label="Extension"
                      placeholder="1234"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                    Additional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      name="companyName"
                      label="Company Name"
                      placeholder="ABC Company"
                    />
                    
                    <FormInput
                      name="referringMD"
                      label="Referring MD"
                      placeholder="Dr. Smith"
                    />
                    
                    <FormInput
                      name="familyMD"
                      label="Family MD"
                      placeholder="Dr. Johnson"
                    />
                    
                    <FormInput
                      name="heardAboutUs"
                      label="How did you hear about us?"
                      placeholder="Google, referral, etc."
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-slate-50 mt-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                    style={{ 
                      background: themeColors.gradient.primary,
                      boxShadow: themeColors.shadow.button
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Create Client
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </FormWrapper>
      </Card>
    </div>
  );
} 