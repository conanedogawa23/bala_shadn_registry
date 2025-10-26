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
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { ArrowLeft, Save, Edit3 } from "lucide-react";
import { generateLink } from "@/lib/route-utils";
import { ClientApiService } from "@/lib/api/clientService";
import type { Client } from "@/lib/data/mockDataService";

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
  
  // Additional Details
  address: z.string().min(5, { message: "Address is required" }),
  companyName: z.string().optional(),
  referringMD: z.string().optional(),
  
  // Additional Fields
  heardAboutUs: z.string().optional(),
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
        
        // Transform API data to form format
        const fullName = `${client.personalInfo?.firstName || ''} ${client.personalInfo?.lastName || ''}`.trim();
        const dateOfBirth = client.personalInfo?.birthday 
          ? new Date(`${client.personalInfo.birthday.year}-${client.personalInfo.birthday.month}-${client.personalInfo.birthday.day}`)
          : client.personalInfo?.dateOfBirth 
            ? new Date(client.personalInfo.dateOfBirth)
            : new Date();
            
        setClientData({
          name: fullName,
          dateOfBirth,
          gender: client.personalInfo?.gender?.toLowerCase() as "male" | "female" | "other" || "male",
          email: client.contact?.email || "",
          cellPhone: typeof client.contact?.phones?.cell === 'string' 
            ? client.contact.phones.cell 
            : client.contact?.phones?.cell?.full || "",
          homePhone: typeof client.contact?.phones?.home === 'string' 
            ? client.contact.phones.home 
            : client.contact?.phones?.home?.full || "",
          address: client.contact?.address?.street || "",
          companyName: client.contact?.company || "",
          referringMD: client.medical?.referringMD || "",
          heardAboutUs: "", // This field might not exist in API data
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
            city: '', // You may want to parse this from address
            province: '', // You may want to parse this from address  
            postalCode: '' // You may want to add postal code field to form
          },
          phones: {
            cell: data.cellPhone,
            home: data.homePhone || undefined,
          },
          email: data.email,
          company: data.companyName || undefined
        },
        medical: {
          familyMD: undefined, // Removed as per edit hint
          referringMD: data.referringMD || undefined
        }
      };

      // Call real API
      await ClientApiService.updateClient(clientId, updateData);
      
      console.log("✅ Client updated successfully for clinic:", clinic, "Client ID:", clientId);
      
      // Navigate back to clients page
      router.push(generateLink('clinic', 'clients', clinic));
    } catch (error) {
      console.error("❌ Failed to update client:", error);
      // You may want to show an error message to the user
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
          )}
        </FormWrapper>
      </Card>
    </div>
  );
} 