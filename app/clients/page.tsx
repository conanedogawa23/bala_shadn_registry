"use client";

import * as React from "react";
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
import { useRouter } from "next/navigation";

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
  const [activeTab, setActiveTab] = React.useState("info");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [clientInsurance, setClientInsurance] = React.useState<InsuranceFormValues[]>([]);
  const router = useRouter();

  // Handle client info submission
  const handleClientSubmit = React.useCallback((data: ClientFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Client info submitted:", data);
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  }, []);

  // Handle insurance info submission
  const handleInsuranceSubmit = React.useCallback((data: InsuranceFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Insurance info submitted:", data);
      setClientInsurance(prev => [...prev, data]);
      setIsSubmitting(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>Client Management</h1>
          <p className="text-gray-600 mt-1">Manage client information and records</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 self-start">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push("/clients/all")}>
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
              {(formState) => (
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
                          placeholder="john@example.com"
                          type="email"
                        />
                        
                        <FormInput
                          name="cellPhone"
                          label="Cell Phone"
                          placeholder="(555) 123-4567"
                        />
                        
                        <FormInput
                          name="homePhone"
                          label="Home Phone"
                          placeholder="(555) 123-4567"
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormInput
                            name="workPhone"
                            label="Work Phone"
                            placeholder="(555) 123-4567"
                          />
                          
                          <FormInput
                            name="extension"
                            label="Extension"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="space-y-6">
                        <h3 className="text-md font-semibold border-b pb-2" style={{ color: themeColors.primaryDark }}>
                          Additional Information
                        </h3>
                        
                        <FormInput
                          name="companyName"
                          label="Company Name"
                          placeholder="Company Inc."
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
                          placeholder="Friend, Google, Doctor, etc."
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button" onClick={() => formState.reset()}>
                      Reset Form
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
                      <Save size={16} />
                      {isSubmitting ? "Saving..." : "Save Client Info"}
                    </Button>
                  </CardFooter>
                  
                  {showSuccess && (
                    <div className="px-6 pb-6">
                      <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2 text-sm">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Client information saved successfully!
                      </div>
                    </div>
                  )}
                </>
              )}
            </FormWrapper>
          </Card>
        </TabsContent>
        
        <TabsContent value="insurance" className="mt-0">
          <Card className="shadow-lg border-0 mb-8" style={{ boxShadow: themeColors.shadow.large }}>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>
                Add insurance details for this client
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
                        placeholder="Insurance Co."
                      />
                      
                      <FormInput
                        name="groupNumber"
                        label="Group Number"
                        placeholder="GRP123456"
                      />
                      
                      <FormInput
                        name="certificateNumber"
                        label="Certificate Number"
                        placeholder="CERT123456"
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit"
                      className="flex items-center gap-2 ml-auto"
                      disabled={isSubmitting}
                      style={{ 
                        background: themeColors.gradient.primary,
                        boxShadow: themeColors.shadow.button
                      }}
                    >
                      <Plus size={16} />
                      Add Insurance
                    </Button>
                  </CardFooter>
                </>
              )}
            </FormWrapper>
          </Card>
          
          {/* Display existing insurance entries */}
          {clientInsurance.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Saved Insurance Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {clientInsurance.map((insurance, index) => (
                  <Card key={index} className="bg-gray-50">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{insurance.insuranceCompany}</h4>
                          <p className="text-sm text-gray-500">
                            Policy Holder: {insurance.policyHolderName} | 
                            Certificate: {insurance.certificateNumber}
                          </p>
                        </div>
                        <Badge className="ml-2">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="documents" className="mt-0">
          <Card className="shadow-lg border-0" style={{ boxShadow: themeColors.shadow.large }}>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Manage client documents and forms
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                <FileText size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents uploaded yet</h3>
                <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                  Upload client documents such as insurance forms, medical records, or consent forms
                </p>
                <Button 
                  className="flex items-center gap-2"
                  style={{ 
                    background: themeColors.gradient.primary,
                    boxShadow: themeColors.shadow.button
                  }}
                >
                  <Plus size={16} />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Body Bliss Visio Patient Management System</p>
      </div>
    </div>
  );
} 