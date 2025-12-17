"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { logger } from "@/lib/utils/logger";
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
import { FormCheckbox } from "@/components/ui/form/FormCheckbox";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { ClientApiService } from "@/lib/api/clientService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// COMPLIANT CLIENT SCHEMA - Per visio_req.md with Insurance
const clientSchema = z.object({
  // Personal Information
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100, { message: "Name cannot exceed 100 characters" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["male", "female", "other"], { required_error: "Gender is required" }),
  
  // Contact Information - RETAINED FIELDS ONLY
  email: z.string().email({ message: "Please enter a valid email address" }).max(100, { message: "Email cannot exceed 100 characters" }),
  cellPhone: z.string().min(10, { message: "Please enter a valid phone number" }).max(20, { message: "Phone number cannot exceed 20 characters" }),
  homePhone: z.string().max(20, { message: "Phone number cannot exceed 20 characters" }).optional(),
  
  // Address Information
  address: z.string().min(5, { message: "Address is required" }).max(200, { message: "Address cannot exceed 200 characters" }),
  apartment: z.string().max(50, { message: "Apartment/Unit cannot exceed 50 characters" }).optional(),
  city: z.string().min(2, { message: "City is required" }).max(100, { message: "City cannot exceed 100 characters" }),
  province: z.string().min(2, { message: "Province is required" }).max(50, { message: "Province cannot exceed 50 characters" }),
  postalCode: z.string().regex(/^[A-Za-z]\d[A-Za-z]\s*\d[A-Za-z]\d$/, { message: "Please enter a valid Canadian postal code (A1A 1A1)" }),
  
  // Additional Information - RETAINED FIELDS ONLY
  companyName: z.string().max(200, { message: "Company name cannot exceed 200 characters" }).optional(),
  referringMD: z.string().max(200, { message: "Referring MD cannot exceed 200 characters" }).optional(),
  
  // 1st Insurance (Optional)
  has1stInsurance: z.boolean().default(false),
  insurance1PolicyHolderName: z.string().max(100, { message: "Policy holder name cannot exceed 100 characters" }).optional(),
  insurance1PolicyHolderBirthday: z.date().optional(),
  insurance1Company: z.string().max(100, { message: "Company name cannot exceed 100 characters" }).optional(),
  insurance1GroupNumber: z.string().max(50, { message: "Group number cannot exceed 50 characters" }).optional(),
  insurance1CertificateNumber: z.string().max(50, { message: "Certificate number cannot exceed 50 characters" }).optional(),
  
  // 2nd Insurance (Optional)
  has2ndInsurance: z.boolean().default(false),
  insurance2PolicyHolderName: z.string().max(100, { message: "Policy holder name cannot exceed 100 characters" }).optional(),
  insurance2PolicyHolderBirthday: z.date().optional(),
  insurance2Company: z.string().max(100, { message: "Company name cannot exceed 100 characters" }).optional(),
  insurance2GroupNumber: z.string().max(50, { message: "Group number cannot exceed 50 characters" }).optional(),
  insurance2CertificateNumber: z.string().max(50, { message: "Certificate number cannot exceed 50 characters" }).optional(),
});

// Type definitions
type ClientFormValues = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Handle client creation
  const handleClientSubmit = React.useCallback(async (data: ClientFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Transform form data to match API format
      const [firstName, ...lastNameParts] = data.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      // Format postal code properly 
      const formattedPostalCode = data.postalCode.replace(/\s+/g, '').toUpperCase();
      const postalCodeFormatted = `${formattedPostalCode.substring(0, 3)} ${formattedPostalCode.substring(3, 6)}`;

      // Build insurance array
      const insurance = [];
      
      // Add 1st Insurance if provided
      if (data.has1stInsurance && data.insurance1PolicyHolderName && data.insurance1Company && data.insurance1CertificateNumber) {
        insurance.push({
          type: '1st' as const,
          policyHolder: data.insurance1PolicyHolderName,
          policyHolderName: data.insurance1PolicyHolderName,
          birthday: data.insurance1PolicyHolderBirthday ? {
            day: String(data.insurance1PolicyHolderBirthday.getDate()).padStart(2, '0'),
            month: String(data.insurance1PolicyHolderBirthday.getMonth() + 1).padStart(2, '0'),
            year: String(data.insurance1PolicyHolderBirthday.getFullYear())
          } : undefined,
          company: data.insurance1Company,
          groupNumber: data.insurance1GroupNumber || '',
          certificateNumber: data.insurance1CertificateNumber,
          coverage: {
            physiotherapy: 100,
            massage: 100,
            other: 100
          }
        });
      }
      
      // Add 2nd Insurance if provided
      if (data.has2ndInsurance && data.insurance2PolicyHolderName && data.insurance2Company && data.insurance2CertificateNumber) {
        insurance.push({
          type: '2nd' as const,
          policyHolder: data.insurance2PolicyHolderName,
          policyHolderName: data.insurance2PolicyHolderName,
          birthday: data.insurance2PolicyHolderBirthday ? {
            day: String(data.insurance2PolicyHolderBirthday.getDate()).padStart(2, '0'),
            month: String(data.insurance2PolicyHolderBirthday.getMonth() + 1).padStart(2, '0'),
            year: String(data.insurance2PolicyHolderBirthday.getFullYear())
          } : undefined,
          company: data.insurance2Company,
          groupNumber: data.insurance2GroupNumber || '',
          certificateNumber: data.insurance2CertificateNumber,
          coverage: {
            physiotherapy: 100,
            massage: 100,
            other: 100
          }
        });
      }

      const clientData = {
        personalInfo: {
          firstName: firstName || '',
          lastName: lastName || '',
          dateOfBirth: data.dateOfBirth,
          gender: data.gender === 'male' ? 'Male' as const : 
                 data.gender === 'female' ? 'Female' as const : 
                 'Other' as const
        },
        contact: {
          address: {
            street: data.address,
            apartment: data.apartment || undefined,
            city: data.city,
            province: data.province,
            postalCode: postalCodeFormatted
          },
          phones: {
            cell: {
              countryCode: "1",
              areaCode: data.cellPhone.replace(/\D/g, '').substring(0, 3),
              number: data.cellPhone.replace(/\D/g, '').substring(3),
              full: data.cellPhone
            },
            home: data.homePhone ? {
              countryCode: "1", 
              areaCode: data.homePhone.replace(/\D/g, '').substring(0, 3),
              number: data.homePhone.replace(/\D/g, '').substring(3),
              full: data.homePhone
            } : undefined
          },
          email: data.email,
          company: data.companyName || undefined
        },
        medical: {
          referringMD: data.referringMD || undefined
        },
        insurance: insurance,
        defaultClinic: clinic
      };

      // Call real API
      await ClientApiService.createClient(clientData);
      
      logger.info("New client created successfully for clinic:", clinic);
      
      // Navigate back to clients page
      router.push(`/clinic/${clinic}/clients`);
    } catch (error) {
      logger.error("Failed to create client:", error);
      alert(`Failed to create client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
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
            type="button"
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
              New Client
            </h1>
            <p className="text-gray-600 mt-1">Add a new client to this clinic</p>
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
            Enter the new client&apos;s personal information, contact details, and insurance
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
            address: "",
            apartment: "",
            city: "Toronto",
            province: "Ontario", 
            postalCode: "",
            companyName: "",
            referringMD: "",
            has1stInsurance: false,
            insurance1PolicyHolderName: "",
            insurance1PolicyHolderBirthday: new Date(),
            insurance1Company: "",
            insurance1GroupNumber: "",
            insurance1CertificateNumber: "",
            has2ndInsurance: false,
            insurance2PolicyHolderName: "",
            insurance2PolicyHolderBirthday: new Date(),
            insurance2Company: "",
            insurance2GroupNumber: "",
            insurance2CertificateNumber: "",
          }}
        >
          {({ watch }) => {
            const has1stInsurance = watch('has1stInsurance');
            const has2ndInsurance = watch('has2ndInsurance');
            
            return (
              <>
                <CardContent className="space-y-6">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="personal">Personal Info</TabsTrigger>
                      <TabsTrigger value="insurance1">1st Insurance</TabsTrigger>
                      <TabsTrigger value="insurance2">2nd Insurance</TabsTrigger>
                    </TabsList>
                    
                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-6 mt-6">
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
                            label="Street Address"
                            placeholder="123 Main Street"
                          />
                          
                          <FormInput
                            name="apartment"
                            label="Apartment/Unit (Optional)"
                            placeholder="Unit 101"
                          />
                          
                          <FormInput
                            name="city"
                            label="City"
                            placeholder="Toronto"
                          />
                          
                          <FormInput
                            name="province"
                            label="Province"
                            placeholder="Ontario"
                          />
                          
                          <FormInput
                            name="postalCode"
                            label="Postal Code"
                            placeholder="A1A 1A1"
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
                            label="Home Phone (Optional)"
                            placeholder="(123) 456-7890"
                          />
                          
                          <FormInput
                            name="companyName"
                            label="Company Name (Optional)"
                            placeholder="ABC Company"
                          />
                          
                          <FormInput
                            name="referringMD"
                            label="Referring MD (Optional)"
                            placeholder="Dr. Smith"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* 1st Insurance Tab */}
                    <TabsContent value="insurance1" className="space-y-6 mt-6">
                      <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                        1st Insurance (Optional)
                      </h3>
                      
                      <FormCheckbox
                        name="has1stInsurance"
                        label="This client has 1st insurance"
                      />
                      
                      {has1stInsurance && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            name="insurance1PolicyHolderName"
                            label="Policy Holder Name"
                            placeholder="John Doe"
                          />
                          
                          <FormDatePicker
                            name="insurance1PolicyHolderBirthday"
                            label="Policy Holder Birthday"
                          />
                          
                          <FormInput
                            name="insurance1Company"
                            label="Insurance Company Name"
                            placeholder="Blue Cross"
                          />
                          
                          <FormInput
                            name="insurance1GroupNumber"
                            label="Group No. (Optional)"
                            placeholder="12345"
                          />
                          
                          <FormInput
                            name="insurance1CertificateNumber"
                            label="Certificate No."
                            placeholder="CERT123456"
                          />
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* 2nd Insurance Tab */}
                    <TabsContent value="insurance2" className="space-y-6 mt-6">
                      <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                        2nd Insurance (Optional)
                      </h3>
                      
                      <FormCheckbox
                        name="has2ndInsurance"
                        label="This client has 2nd insurance"
                      />
                      
                      {has2ndInsurance && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            name="insurance2PolicyHolderName"
                            label="Policy Holder Name"
                            placeholder="John Doe"
                          />
                          
                          <FormDatePicker
                            name="insurance2PolicyHolderBirthday"
                            label="Policy Holder Birthday"
                          />
                          
                          <FormInput
                            name="insurance2Company"
                            label="Insurance Company Name"
                            placeholder="Manulife"
                          />
                          
                          <FormInput
                            name="insurance2GroupNumber"
                            label="Group No. (Optional)"
                            placeholder="67890"
                          />
                          
                          <FormInput
                            name="insurance2CertificateNumber"
                            label="Certificate No."
                            placeholder="CERT789012"
                          />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
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
            );
          }}
        </FormWrapper>
      </Card>
    </div>
  );
}
