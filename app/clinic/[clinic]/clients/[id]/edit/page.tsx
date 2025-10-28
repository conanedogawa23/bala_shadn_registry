"use client";

import React, { useState, useEffect } from "react";
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
import { FormCheckbox } from "@/components/ui/form/FormCheckbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsuranceSection } from "@/components/ui/client/InsuranceSection";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { ArrowLeft, Save, Edit3, Shield } from "lucide-react";
import { generateLink } from "@/lib/route-utils";
import { ClientApiService } from "@/lib/api/clientService";
import type { Client } from "@/lib/data/mockDataService";

// Define the client schema using zod for validation with insurance
const clientSchema = z.object({
  // Personal Information
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["male", "female", "other"], { required_error: "Gender is required" }),
  
  // Contact Information
  email: z.string().email({ message: "Please enter a valid email address" }),
  cellPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  homePhone: z.string().optional(),
  
  // Address Information
  address: z.string().min(5, { message: "Address is required" }),
  apartment: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  province: z.string().min(2, { message: "Province is required" }),
  postalCode: z.string().regex(/^[A-Za-z]\d[A-Za-z]\s*\d[A-Za-z]\d$/, { 
    message: "Please enter a valid Canadian postal code (A1A 1A1)" 
  }),
  
  // Additional Details
  companyName: z.string().optional(),
  referringMD: z.string().optional(),
  
  // 1st Insurance (Optional)
  has1stInsurance: z.boolean().default(false),
  insurance1PolicyHolder: z.string().optional(),
  insurance1PolicyHolderName: z.string().optional(),
  insurance1PolicyHolderBirthday: z.date().optional(),
  insurance1Company: z.string().optional(),
  insurance1GroupNumber: z.string().optional(),
  insurance1CertificateNumber: z.string().optional(),
  insurance1COB: z.string().optional(),
  insurance1DPA: z.boolean().optional(),
  insurance1CompanyAddress: z.string().optional(),
  insurance1City: z.string().optional(),
  insurance1Province: z.string().optional(),
  insurance1PostalCode: z.string().optional(),
  insurance1CoveragePhysiotherapy: z.number().optional(),
  insurance1CoverageMassage: z.number().optional(),
  insurance1CoverageOrthopedicShoes: z.number().optional(),
  insurance1CoverageCompressionStockings: z.number().optional(),
  insurance1CoverageOther: z.number().optional(),
  insurance1CoverageFrequency: z.string().optional(),
  insurance1CoverageTotalAmountPerYear: z.number().optional(),
  
  // 2nd Insurance (Optional)
  has2ndInsurance: z.boolean().default(false),
  insurance2PolicyHolder: z.string().optional(),
  insurance2PolicyHolderName: z.string().optional(),
  insurance2PolicyHolderBirthday: z.date().optional(),
  insurance2Company: z.string().optional(),
  insurance2GroupNumber: z.string().optional(),
  insurance2CertificateNumber: z.string().optional(),
  insurance2COB: z.string().optional(),
  insurance2DPA: z.boolean().optional(),
  insurance2CompanyAddress: z.string().optional(),
  insurance2City: z.string().optional(),
  insurance2Province: z.string().optional(),
  insurance2PostalCode: z.string().optional(),
  insurance2CoveragePhysiotherapy: z.number().optional(),
  insurance2CoverageMassage: z.number().optional(),
  insurance2CoverageOrthopedicShoes: z.number().optional(),
  insurance2CoverageCompressionStockings: z.number().optional(),
  insurance2CoverageOther: z.number().optional(),
  insurance2CoverageFrequency: z.string().optional(),
  insurance2CoverageTotalAmountPerYear: z.number().optional(),
  
});

// Type definitions
type ClientFormValues = z.infer<typeof clientSchema>;

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const clientId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clientData, setClientData] = useState<ClientFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch real client data from API
  useEffect(() => {
    const fetchClient = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const client: Client = await ClientApiService.getClientById(clientId);
        
        // API returns flattened structure - map directly
        const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
        
        // Parse dateOfBirth from ISO string or birthday object
        let dateOfBirth = new Date();
        if (client.dateOfBirth) {
          dateOfBirth = new Date(client.dateOfBirth);
        } else if (client.birthday?.year && client.birthday?.month && client.birthday?.day) {
          dateOfBirth = new Date(
            `${client.birthday.year}-${client.birthday.month}-${client.birthday.day}`
          );
        }
        
        // Extract insurance data (up to 2 insurance plans per visio_req.md)
        const insurance1 = client.insurance?.find((ins) => ins.type === '1st');
        const insurance2 = client.insurance?.find((ins) => ins.type === '2nd');
        
        // Helper to parse insurance birthday
        const parseBirthday = (birthday?: { day?: string; month?: string; year?: string }) => {
          if (!birthday?.year || !birthday?.month || !birthday?.day) return undefined;
          return new Date(`${birthday.year}-${birthday.month}-${birthday.day}`);
        };
        
        // Parse address from formatted string (fallback)
        // API returns formatted address like "123 St, City, Province, Postal"
        // Individual fields (city, province) also available separately
        const addressParts = client.address?.split(',') || [];
        const street = addressParts[0]?.trim() || '';
        
        setClientData({
          name: fullName,
          dateOfBirth,
          gender: (client.gender?.toLowerCase() as "male" | "female" | "other") || "male",
          email: client.email || "",
          cellPhone: client.phone || "",  // API returns single phone field
          homePhone: "",  // Not in flattened response
          address: street || client.address || "",
          apartment: "",  // Not in flattened response  
          city: client.city || "",
          province: client.province || "",
          postalCode: client.postalCode || "",  // May need to extract from address
          companyName: client.companyName || "",
          referringMD: client.referringMD || "",
          
          // 1st Insurance
          has1stInsurance: !!insurance1,
          insurance1PolicyHolder: insurance1?.policyHolder || "Self",
          insurance1PolicyHolderName: insurance1?.policyHolderName || "",
          insurance1PolicyHolderBirthday: parseBirthday(insurance1?.birthday),
          insurance1Company: insurance1?.company || "",
          insurance1GroupNumber: insurance1?.groupNumber || "",
          insurance1CertificateNumber: insurance1?.certificateNumber || "",
          insurance1COB: insurance1?.cob || "NO",
          insurance1DPA: insurance1?.dpa || false,
          insurance1CompanyAddress: insurance1?.companyAddress || "",
          insurance1City: insurance1?.city || "",
          insurance1Province: insurance1?.province || "",
          insurance1PostalCode: insurance1?.postalCode 
            ? `${insurance1.postalCode.first3} ${insurance1.postalCode.last3}`.trim() 
            : "",
          insurance1CoveragePhysiotherapy: insurance1?.coverage?.physiotherapy || 0,
          insurance1CoverageMassage: insurance1?.coverage?.massage || 0,
          insurance1CoverageOrthopedicShoes: insurance1?.coverage?.orthopedicShoes || 0,
          insurance1CoverageCompressionStockings: insurance1?.coverage?.compressionStockings || 0,
          insurance1CoverageOther: insurance1?.coverage?.other || 0,
          insurance1CoverageFrequency: insurance1?.coverage?.frequency || "",
          insurance1CoverageTotalAmountPerYear: insurance1?.coverage?.totalAmountPerYear || 0,
          
          // 2nd Insurance
          has2ndInsurance: !!insurance2,
          insurance2PolicyHolder: insurance2?.policyHolder || "Self",
          insurance2PolicyHolderName: insurance2?.policyHolderName || "",
          insurance2PolicyHolderBirthday: parseBirthday(insurance2?.birthday),
          insurance2Company: insurance2?.company || "",
          insurance2GroupNumber: insurance2?.groupNumber || "",
          insurance2CertificateNumber: insurance2?.certificateNumber || "",
          insurance2COB: insurance2?.cob || "NO",
          insurance2DPA: insurance2?.dpa || false,
          insurance2CompanyAddress: insurance2?.companyAddress || "",
          insurance2City: insurance2?.city || "",
          insurance2Province: insurance2?.province || "",
          insurance2PostalCode: insurance2?.postalCode 
            ? `${insurance2.postalCode.first3} ${insurance2.postalCode.last3}`.trim() 
            : "",
          insurance2CoveragePhysiotherapy: insurance2?.coverage?.physiotherapy || 0,
          insurance2CoverageMassage: insurance2?.coverage?.massage || 0,
          insurance2CoverageOrthopedicShoes: insurance2?.coverage?.orthopedicShoes || 0,
          insurance2CoverageCompressionStockings: insurance2?.coverage?.compressionStockings || 0,
          insurance2CoverageOther: insurance2?.coverage?.other || 0,
          insurance2CoverageFrequency: insurance2?.coverage?.frequency || "",
          insurance2CoverageTotalAmountPerYear: insurance2?.coverage?.totalAmountPerYear || 0,
        });
      } catch (err) {
        console.error("❌ Failed to fetch client:", err);
        setError(err instanceof Error ? err.message : 'Failed to load client');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  // Handle client update
  const handleClientSubmit = React.useCallback(async (data: ClientFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Transform form data to match API format
      const [firstName, ...lastNameParts] = data.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      // Format postal code properly
      const formattedPostalCode = data.postalCode.replace(/\s+/g, '').toUpperCase();
      const postalCodeFormatted = `${formattedPostalCode.substring(0, 3)} ${formattedPostalCode.substring(3, 6)}`;

      // Build insurance array - only include insurance with required fields
      const insurance = [];
      
      // Add 1st Insurance if enabled and has required fields
      if (data.has1stInsurance && data.insurance1Company && data.insurance1CertificateNumber && data.insurance1PolicyHolder) {
        insurance.push({
          type: '1st' as const,
          policyHolder: data.insurance1PolicyHolder,
          policyHolderName: data.insurance1PolicyHolderName || '',
          birthday: data.insurance1PolicyHolderBirthday ? {
            day: String(data.insurance1PolicyHolderBirthday.getDate()).padStart(2, '0'),
            month: String(data.insurance1PolicyHolderBirthday.getMonth() + 1).padStart(2, '0'),
            year: String(data.insurance1PolicyHolderBirthday.getFullYear())
          } : undefined,
          company: data.insurance1Company,
          companyAddress: data.insurance1CompanyAddress || '',
          city: data.insurance1City || '',
          province: data.insurance1Province || '',
          postalCode: data.insurance1PostalCode ? {
            first3: data.insurance1PostalCode.replace(/\s+/g, '').substring(0, 3),
            last3: data.insurance1PostalCode.replace(/\s+/g, '').substring(3, 6)
          } : undefined,
          groupNumber: data.insurance1GroupNumber || '',
          certificateNumber: data.insurance1CertificateNumber,
          cob: data.insurance1COB || 'NO',
          dpa: data.insurance1DPA || false,
          coverage: {
            physiotherapy: data.insurance1CoveragePhysiotherapy || 0,
            massage: data.insurance1CoverageMassage || 0,
            orthopedicShoes: data.insurance1CoverageOrthopedicShoes || 0,
            compressionStockings: data.insurance1CoverageCompressionStockings || 0,
            other: data.insurance1CoverageOther || 0,
            frequency: data.insurance1CoverageFrequency || '',
            totalAmountPerYear: data.insurance1CoverageTotalAmountPerYear || 0,
          }
        });
      }
      
      // Add 2nd Insurance if enabled and has required fields
      if (data.has2ndInsurance && data.insurance2Company && data.insurance2CertificateNumber && data.insurance2PolicyHolder) {
        insurance.push({
          type: '2nd' as const,
          policyHolder: data.insurance2PolicyHolder,
          policyHolderName: data.insurance2PolicyHolderName || '',
          birthday: data.insurance2PolicyHolderBirthday ? {
            day: String(data.insurance2PolicyHolderBirthday.getDate()).padStart(2, '0'),
            month: String(data.insurance2PolicyHolderBirthday.getMonth() + 1).padStart(2, '0'),
            year: String(data.insurance2PolicyHolderBirthday.getFullYear())
          } : undefined,
          company: data.insurance2Company,
          companyAddress: data.insurance2CompanyAddress || '',
          city: data.insurance2City || '',
          province: data.insurance2Province || '',
          postalCode: data.insurance2PostalCode ? {
            first3: data.insurance2PostalCode.replace(/\s+/g, '').substring(0, 3),
            last3: data.insurance2PostalCode.replace(/\s+/g, '').substring(3, 6)
          } : undefined,
          groupNumber: data.insurance2GroupNumber || '',
          certificateNumber: data.insurance2CertificateNumber,
          cob: data.insurance2COB || 'NO',
          dpa: data.insurance2DPA || false,
          coverage: {
            physiotherapy: data.insurance2CoveragePhysiotherapy || 0,
            massage: data.insurance2CoverageMassage || 0,
            orthopedicShoes: data.insurance2CoverageOrthopedicShoes || 0,
            compressionStockings: data.insurance2CoverageCompressionStockings || 0,
            other: data.insurance2CoverageOther || 0,
            frequency: data.insurance2CoverageFrequency || '',
            totalAmountPerYear: data.insurance2CoverageTotalAmountPerYear || 0,
          }
        });
      }
      
      const updateData = {
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
            cell: data.cellPhone,
            home: data.homePhone || undefined,
          },
          email: data.email,
          company: data.companyName || undefined
        },
        medical: {
          referringMD: data.referringMD || undefined
        },
        insurance: insurance
      };

      // Call real API
      await ClientApiService.updateClient(clientId, updateData);
      
      console.log("✅ Client updated successfully for clinic:", clinic, "Client ID:", clientId);
      
      // Navigate back to client detail page
      router.push(generateLink('clinic', `clients/${clientId}`, clinic));
    } catch (error) {
      console.error("❌ Failed to update client:", error);
      alert(`Failed to update client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [clinic, clientId, router]);

  // Handle back navigation
  const handleBack = () => {
    router.push(generateLink('clinic', 'clients', clinic));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center min-h-64 gap-4">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Client</h2>
            <p>{error}</p>
          </div>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Client Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The client you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={handleBack} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

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
              Edit Client #{clientId} - {clinic.replace('-', ' ')}
            </h1>
            <p className="text-gray-600 mt-1">Update client information for {clinic.replace('-', ' ')} clinic</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200" style={{ boxShadow: themeColors.shadow.large }}>
        <CardHeader className="bg-slate-50 pb-3 pt-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Edit3 size={18} />
            Edit Client Information
          </CardTitle>
          <CardDescription>
            Update the client&apos;s personal information and contact details
          </CardDescription>
        </CardHeader>
        
        <FormWrapper
          schema={clientSchema}
          onSubmit={handleClientSubmit}
          defaultValues={clientData}
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
                      <TabsTrigger value="insurance1">
                        <Shield className="h-4 w-4 mr-2" />
                        1st Insurance
                      </TabsTrigger>
                      <TabsTrigger value="insurance2">
                        <Shield className="h-4 w-4 mr-2" />
                        2nd Insurance
                      </TabsTrigger>
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
                      <div className="mb-4">
                        <FormCheckbox
                          name="has1stInsurance"
                          label="This client has 1st insurance"
                        />
                      </div>
                      
                      <InsuranceSection
                        config={{
                          type: '1st',
                          prefix: 'insurance1',
                          title: '1st Insurance (Primary)',
                          description: 'Primary insurance coverage'
                        }}
                        watch={watch}
                        isEnabled={has1stInsurance}
                        showCoverage={true}
                        showDPA={true}
                        showCOB={true}
                        showAddress={true}
                        mode="edit"
                      />
                    </TabsContent>
                    
                    {/* 2nd Insurance Tab */}
                    <TabsContent value="insurance2" className="space-y-6 mt-6">
                      <div className="mb-4">
                        <FormCheckbox
                          name="has2ndInsurance"
                          label="This client has 2nd insurance"
                        />
                      </div>
                      
                      <InsuranceSection
                        config={{
                          type: '2nd',
                          prefix: 'insurance2',
                          title: '2nd Insurance (Secondary)',
                          description: 'Secondary insurance coverage'
                        }}
                        watch={watch}
                        isEnabled={has2ndInsurance}
                        showCoverage={true}
                        showDPA={true}
                        showCOB={true}
                        showAddress={true}
                        mode="edit"
                      />
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
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Update Client
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