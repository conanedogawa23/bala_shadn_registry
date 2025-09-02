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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormWrapper } from "@/components/ui/form/FormWrapper";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormSelect } from "@/components/ui/form/FormSelect";
import { FormDatePicker } from "@/components/ui/form/FormDatePicker";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { Plus, UserPlus, Save, FileText, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClientApiService } from "@/lib/api/clientService";

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

// Define insurance schema
const insuranceSchema = z.object({
  policyHolderName: z.string().min(2, { message: "Policy holder name is required" }),
  policyHolderBirthday: z.date({ required_error: "Policy holder birthday is required" }),
  insuranceCompany: z.string().min(2, { message: "Insurance company is required" }),
  groupNumber: z.string().optional(),
  certificateNumber: z.string().min(1, { message: "Certificate number is required" }),
});

// Type definitions
type ClientFormValues = z.infer<typeof clientSchema>;
type InsuranceFormValues = z.infer<typeof insuranceSchema>;

export default function ClientsPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  const [activeTab, setActiveTab] = React.useState("info");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [clientInsurance, setClientInsurance] = React.useState<InsuranceFormValues[]>([]);

  // Handle client info submission - FIXED VERSION
  const handleClientSubmit = React.useCallback(async (data: ClientFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Transform form data to match backend API expectations
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || data.name;
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Extract postal code from address (basic implementation)
      const postalCodeMatch = data.address.match(/\b[A-Za-z]\d[A-Za-z]\s*\d[A-Za-z]\d\b/);
      const extractedPostalCode = postalCodeMatch 
        ? postalCodeMatch[0].replace(/\s+/g, '').toUpperCase()
        : 'M5V3L9'; // Default Toronto postal code
      
      // Format postal code with space (A1A 1A1)
      const formattedPostalCode = extractedPostalCode.length === 6 
        ? `${extractedPostalCode.substring(0, 3)} ${extractedPostalCode.substring(3, 6)}`
        : 'M5V 3L9';

      const clientData = {
        personalInfo: {
          firstName,
          lastName: lastName || 'Unknown',
          gender: data.gender === 'male' ? 'Male' : data.gender === 'female' ? 'Female' : 'Other',
          dateOfBirth: data.dateOfBirth,
        },
        contact: {
          address: {
            street: data.address,
            apartment: '',
            city: 'Toronto', // Could be enhanced to extract from address
            province: 'Ontario', // Could be enhanced to extract from address
            postalCode: formattedPostalCode,
          },
          phones: {
            home: data.homePhone || '',
            cell: data.cellPhone || '',
            work: data.workPhone ? `${data.workPhone}${data.extension ? ` ext ${data.extension}` : ''}` : '',
          },
          email: data.email || '',
          company: data.companyName || '',
        },
        medical: {
          familyMD: data.familyMD || '',
          referringMD: data.referringMD || '',
          csrName: '',
        },
        insurance: [],
        defaultClinic: clinic === 'bodybliss-physio' ? 'BodyBlissPhysio' : clinic.replace('-', ' '),
      };

      console.log("Creating client for clinic:", clinic, clientData);
      
      // Make the actual API call
      const createdClient = await ClientApiService.createClient(clientData);
      
      console.log("Client created successfully:", createdClient);
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Optionally redirect to client list or clear form
      // router.push(`/clinic/${clinic}/clients/all`);
      
    } catch (err) {
      console.error("Failed to create client:", err);
      setError(err instanceof Error ? err.message : 'Failed to create client');
      setIsSubmitting(false);
    }
  }, [clinic]);

  // Handle insurance info submission
  const handleInsuranceSubmit = React.useCallback((data: InsuranceFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Insurance info submitted for clinic:", clinic, data);
      setClientInsurance(prev => [...prev, data]);
      setIsSubmitting(false);
    }, 1000);
  }, [clinic]);

  // Handle viewing all clients
  const handleViewAllClients = () => {
    router.push(`/clinic/${clinic}/clients/all`);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Client Management - {clinic.replace('-', ' ')}
          </h1>
          <p className="text-gray-600 mt-1">Manage client information and records for {clinic.replace('-', ' ')} clinic</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 self-start">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleViewAllClients}>
            <Users size={16} />
            View All Clients
          </Button>
          <Button 
            className="flex items-center gap-2"
            style={{ 
              background: themeColors.gradient.primary,
              boxShadow: themeColors.shadow.button
            }}
          >
            <UserPlus size={16} />
            New Client
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="info">Client Information</TabsTrigger>
          <TabsTrigger value="insurance">Insurance Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-0">
          <Card className="shadow-sm border border-gray-200" style={{ boxShadow: themeColors.shadow.large }}>
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium">Client Information</CardTitle>
              <CardDescription>
                Enter the client&apos;s personal information and contact details
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
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Client
                          </>
                        )}
                      </Button>
                      
                      {showSuccess && (
                        <div className="flex items-center gap-2 text-green-600">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Client saved successfully!
                        </div>
                      )}
                      
                      {error && (
                        <div className="flex items-center gap-2 text-red-600">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {error}
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </>
              )}
            </FormWrapper>
          </Card>
        </TabsContent>
        
        <TabsContent value="insurance" className="mt-0">
          <Card className="shadow-sm border border-gray-200" style={{ boxShadow: themeColors.shadow.large }}>
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium">Insurance Information</CardTitle>
              <CardDescription>
                Add insurance details for the client
              </CardDescription>
            </CardHeader>
            
            <FormWrapper
              schema={insuranceSchema}
              onSubmit={handleInsuranceSubmit}
              defaultValues={{
                policyHolderName: "",
                policyHolderBirthday: new Date(),
                insuranceCompany: "",
                groupNumber: "",
                certificateNumber: "",
              }}
            >
                             {() => (
                <>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        name="policyHolderName"
                        label="Policy Holder Name"
                        placeholder="John Doe"
                      />
                      
                      <FormDatePicker
                        name="policyHolderBirthday"
                        label="Policy Holder Birthday"
                      />
                      
                      <FormInput
                        name="insuranceCompany"
                        label="Insurance Company"
                        placeholder="Blue Cross Blue Shield"
                      />
                      
                      <FormInput
                        name="groupNumber"
                        label="Group Number"
                        placeholder="123456"
                      />
                      
                      <FormInput
                        name="certificateNumber"
                        label="Certificate Number"
                        placeholder="CERT123456"
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="bg-slate-50 mt-6">
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
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Add Insurance
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </>
              )}
            </FormWrapper>
            
            {/* Display added insurance records */}
            {clientInsurance.length > 0 && (
              <CardContent className="pt-6">
                <h4 className="font-medium mb-4">Insurance Records</h4>
                <div className="space-y-3">
                  {clientInsurance.map((insurance, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{insurance.insuranceCompany}</h5>
                          <p className="text-sm text-gray-600">Policy Holder: {insurance.policyHolderName}</p>
                          <p className="text-sm text-gray-600">Certificate: {insurance.certificateNumber}</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-0">
          <Card className="shadow-sm border border-gray-200" style={{ boxShadow: themeColors.shadow.large }}>
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium">Client Documents</CardTitle>
              <CardDescription>
                Upload and manage client documents
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop files here, or click to select files
                </p>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus size={16} />
                  Select Files
                </Button>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Document Types</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Insurance cards</li>
                  <li>• Medical records</li>
                  <li>• Consent forms</li>
                  <li>• Referral letters</li>
                  <li>• Lab results</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 