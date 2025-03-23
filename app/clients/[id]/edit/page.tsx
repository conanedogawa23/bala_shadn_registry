"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

// Client interface
interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  gender: string;
  streetAddress: string;
  apartmentNo: string;
  city: string;
  province: string;
  postalCode: string;
  homePhone: string;
  cellPhone: string;
  workPhone: string;
  workPhoneExt: string;
  email: string;
  company: string;
  referralSource: string;
  referralDetail: string;
  familyMD: string;
  referringMD: string;
  csrName: string;
  location: string;
}

export default function ClientEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Client data state
  const [clientData, setClientData] = useState<ClientData>({
    id: "",
    firstName: "",
    lastName: "",
    dateOfBirth: {
      day: "",
      month: "",
      year: ""
    },
    gender: "",
    streetAddress: "",
    apartmentNo: "",
    city: "",
    province: "",
    postalCode: "",
    homePhone: "",
    cellPhone: "",
    workPhone: "",
    workPhoneExt: "",
    email: "",
    company: "",
    referralSource: "",
    referralDetail: "",
    familyMD: "",
    referringMD: "",
    csrName: "none",
    location: ""
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Options for dropdown fields
  const provinces = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"];
  const genders = ["Male", "Female", "Other", "Prefer not to say"];
  const referralSources = ["Friend", "Doctor", "Online", "Advertisement", "Social Media", "Concert", "Other"];
  const locations = ["BodyBliss", "Massage Therapy", "Home Service", "Corporate"];
  
  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, simulate network delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock client data
        const mockClientData: ClientData = {
          id: id,
          firstName: "LABELS",
          lastName: "ABCA",
          dateOfBirth: {
            day: "2",
            month: "1",
            year: "2000"
          },
          gender: "Female",
          streetAddress: "100 Labels St.",
          apartmentNo: "",
          city: "Toronto",
          province: "Ontario",
          postalCode: "M3B 3R4",
          homePhone: "416-416-4164",
          cellPhone: "416-523-5655",
          workPhone: "416-224-9900",
          workPhoneExt: "00",
          email: "labels@bodybliss.ca",
          company: "Bodybliss",
          referralSource: "Concert",
          referralDetail: "Concert Other",
          familyMD: "Dr. REMENTILLA,F",
          referringMD: "Dr. REMENTILLA,F",
          csrName: "none",
          location: "BodyBliss"
        };
        
        setClientData(mockClientData);
      } catch (err) {
        setError("Failed to load client data. Please try again.");
        console.error("Error fetching client data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientData();
  }, [id]);
  
  // Handler for input changes
  const handleInputChange = (field: string, value: string) => {
    // Clear validation error when field is edited
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Handle nested dateOfBirth fields
    if (field === "day" || field === "month" || field === "year") {
      setClientData(prev => ({
        ...prev,
        dateOfBirth: {
          ...prev.dateOfBirth,
          [field]: value
        }
      }));
    } else {
      // Handle standard fields
      setClientData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Check required fields
    if (!clientData.firstName.trim()) errors.firstName = "First name is required";
    if (!clientData.lastName.trim()) errors.lastName = "Last name is required";
    if (!clientData.email.trim()) errors.email = "Email is required";
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (clientData.email && !emailRegex.test(clientData.email)) {
      errors.email = "Invalid email format";
    }
    
    // Check phone number format (basic validation)
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (clientData.homePhone && !phoneRegex.test(clientData.homePhone)) {
      errors.homePhone = "Format should be: 123-456-7890";
    }
    if (clientData.cellPhone && !phoneRegex.test(clientData.cellPhone)) {
      errors.cellPhone = "Format should be: 123-456-7890";
    }
    if (clientData.workPhone && !phoneRegex.test(clientData.workPhone)) {
      errors.workPhone = "Format should be: 123-456-7890";
    }
    
    // Set validation errors and return result
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      // Scroll to the first error field
      const firstErrorField = Object.keys(formErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to client detail page after successful save
      router.push(`/clients/${clientData.id}`);
    } catch (err) {
      setError("Failed to save client data. Please try again.");
      console.error("Error saving client data:", err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handler to navigate back to client detail page
  const handleCancel = () => {
    router.push(`/clients/${id}`);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Client Details
        </Button>
      </div>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.primary }}>
            Edit Client
          </h1>
          <p className="text-gray-600 mt-2">
            Update client information for {clientData.firstName} {clientData.lastName}
          </p>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex items-center mb-6">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Client Edit Form */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="shadow-md border-0 mb-8">
            <CardHeader className="bg-slate-100">
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="flex items-center gap-1">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="lastName" 
                      value={clientData.lastName} 
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      aria-required="true"
                      aria-invalid={!!formErrors.lastName}
                      className={formErrors.lastName ? "border-red-500" : ""}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center gap-1">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="firstName" 
                      value={clientData.firstName} 
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      aria-required="true"
                      aria-invalid={!!formErrors.firstName}
                      className={formErrors.firstName ? "border-red-500" : ""}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="block mb-1">Date of Birth:</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="day" className="sr-only">Day</Label>
                        <Input 
                          id="day" 
                          placeholder="DD" 
                          value={clientData.dateOfBirth.day} 
                          onChange={(e) => handleInputChange("day", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="month" className="sr-only">Month</Label>
                        <Input 
                          id="month" 
                          placeholder="MM" 
                          value={clientData.dateOfBirth.month} 
                          onChange={(e) => handleInputChange("month", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="year" className="sr-only">Year</Label>
                        <Input 
                          id="year" 
                          placeholder="YYYY" 
                          value={clientData.dateOfBirth.year} 
                          onChange={(e) => handleInputChange("year", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender:</Label>
                    <Select 
                      value={clientData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map(gender => (
                          <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Second Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Street Address:</Label>
                    <Input 
                      id="streetAddress" 
                      value={clientData.streetAddress} 
                      onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apartmentNo">Apartment #:</Label>
                    <Input 
                      id="apartmentNo" 
                      value={clientData.apartmentNo} 
                      onChange={(e) => handleInputChange("apartmentNo", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City:</Label>
                    <Input 
                      id="city" 
                      value={clientData.city} 
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="province">Province:</Label>
                    <Select 
                      value={clientData.province}
                      onValueChange={(value) => handleInputChange("province", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                          <SelectItem key={province} value={province}>{province}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code:</Label>
                    <Input 
                      id="postalCode" 
                      value={clientData.postalCode} 
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="homePhone">Home Phone:</Label>
                    <Input 
                      id="homePhone" 
                      value={clientData.homePhone} 
                      onChange={(e) => handleInputChange("homePhone", e.target.value)}
                      aria-invalid={!!formErrors.homePhone}
                      className={formErrors.homePhone ? "border-red-500" : ""}
                    />
                    {formErrors.homePhone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.homePhone}</p>
                    )}
                  </div>
                </div>
                
                {/* Third Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cellPhone">Cell Phone:</Label>
                    <Input 
                      id="cellPhone" 
                      value={clientData.cellPhone} 
                      onChange={(e) => handleInputChange("cellPhone", e.target.value)}
                      aria-invalid={!!formErrors.cellPhone}
                      className={formErrors.cellPhone ? "border-red-500" : ""}
                    />
                    {formErrors.cellPhone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cellPhone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workPhone">Work Phone:</Label>
                    <Input 
                      id="workPhone" 
                      value={clientData.workPhone} 
                      onChange={(e) => handleInputChange("workPhone", e.target.value)}
                      aria-invalid={!!formErrors.workPhone}
                      className={formErrors.workPhone ? "border-red-500" : ""}
                    />
                    {formErrors.workPhone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.workPhone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workPhoneExt">Work Phone Ext:</Label>
                    <Input 
                      id="workPhoneExt" 
                      value={clientData.workPhoneExt} 
                      onChange={(e) => handleInputChange("workPhoneExt", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={clientData.email} 
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      aria-required="true"
                      aria-invalid={!!formErrors.email}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company:</Label>
                    <Input 
                      id="company" 
                      value={clientData.company} 
                      onChange={(e) => handleInputChange("company", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 mb-8">
            <CardHeader className="bg-slate-100">
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="referralSource">Referral Source:</Label>
                    <Select 
                      value={clientData.referralSource}
                      onValueChange={(value) => handleInputChange("referralSource", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select referral source" />
                      </SelectTrigger>
                      <SelectContent>
                        {referralSources.map(source => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referralDetail">Referral Details:</Label>
                    <Input 
                      id="referralDetail" 
                      value={clientData.referralDetail} 
                      onChange={(e) => handleInputChange("referralDetail", e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Second Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="familyMD">Family MD:</Label>
                    <Input 
                      id="familyMD" 
                      value={clientData.familyMD} 
                      onChange={(e) => handleInputChange("familyMD", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referringMD">Referring MD:</Label>
                    <Input 
                      id="referringMD" 
                      value={clientData.referringMD} 
                      onChange={(e) => handleInputChange("referringMD", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="csrName">CSR Name:</Label>
                  <Select 
                    value={clientData.csrName}
                    onValueChange={(value) => handleInputChange("csrName", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select CSR" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">- Select -</SelectItem>
                      <SelectItem value="Johnson">Johnson</SelectItem>
                      <SelectItem value="Williams">Williams</SelectItem>
                      <SelectItem value="Davis">Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location:</Label>
                  <Select 
                    value={clientData.location}
                    onValueChange={(value) => handleInputChange("location", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 pt-4 border-t">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex items-center gap-2"
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
} 