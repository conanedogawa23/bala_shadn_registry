"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to true after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccessMessage("Settings have been saved successfully.");
    setIsSaving(false);
  };

  // Only render select components after hydration
  const renderSelects = () => {
    if (!mounted) {
      return null;
    }

    return (
      <>
        {/* Timezone select */}
        <div className="space-y-2">
          <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
          <Select defaultValue="America/New_York">
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Language select */}
        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-medium">Language</label>
          <Select defaultValue="en">
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Currency select */}
        <div className="space-y-2">
          <label htmlFor="currency" className="text-sm font-medium">Currency</label>
          <Select defaultValue="USD">
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">US Dollar (USD)</SelectItem>
              <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Settings - {clinic.replace('-', ' ')}
          </h1>
          <p className="text-gray-600 mt-1">Manage clinic settings and preferences for {clinic.replace('-', ' ')}</p>
        </div>
      </div>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="clinic">Clinic Information</TabsTrigger>
          <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium">General Settings</CardTitle>
              <CardDescription>Configure general clinic preferences</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="clinicName" className="text-sm font-medium">Clinic Name</label>
                  <Input 
                    id="clinicName" 
                    placeholder="Clinic name" 
                    defaultValue={clinic.replace('-', ' ')} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="operatingHours" className="text-sm font-medium">Operating Hours</label>
                  <Input 
                    id="operatingHours" 
                    placeholder="9:00 AM - 5:00 PM" 
                    defaultValue="9:00 AM - 5:00 PM" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                  <Input 
                    id="phone" 
                    placeholder="(555) 123-4567" 
                    defaultValue="(555) 123-4567" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="contact@clinic.com" 
                    defaultValue="contact@clinic.com" 
                  />
                </div>
              </div>
              
              {/* Render selects conditionally based on mounted state */}
              {renderSelects()}
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Address</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="street" className="text-sm font-medium">Street Address</label>
                    <Input 
                      id="street" 
                      placeholder="123 Main St" 
                      defaultValue="123 Main St" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">City</label>
                    <Input 
                      id="city" 
                      placeholder="City" 
                      defaultValue="City" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium">State/Province</label>
                    <Input 
                      id="state" 
                      placeholder="State" 
                      defaultValue="State" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="text-sm font-medium">ZIP/Postal Code</label>
                    <Input 
                      id="zipCode" 
                      placeholder="12345" 
                      defaultValue="12345" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium">Country</label>
                    <Input 
                      id="country" 
                      placeholder="United States" 
                      defaultValue="United States" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/clinic/${clinic}`)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={isSaving}
                style={{ 
                  background: themeColors.gradient.primary,
                  boxShadow: themeColors.shadow.button
                }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
                             <CardDescription>Manage your clinic&apos;s detailed information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="licenseNumber" className="text-sm font-medium">License Number</label>
                  <Input 
                    id="licenseNumber" 
                    placeholder="License number" 
                    defaultValue="LIC-123456" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="taxId" className="text-sm font-medium">Tax ID</label>
                  <Input 
                    id="taxId" 
                    placeholder="Tax ID" 
                    defaultValue="12-3456789" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="services" className="text-sm font-medium">Services Offered</label>
                <Input 
                  id="services" 
                  placeholder="List services (comma separated)" 
                  defaultValue="Physical Therapy, Massage, Wellness Consultation" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="specialties" className="text-sm font-medium">Specialties</label>
                <Input 
                  id="specialties" 
                  placeholder="List specialties (comma separated)" 
                  defaultValue="Sports Medicine, Pain Management, Rehabilitation" 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/clinic/${clinic}`)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={isSaving}
                style={{ 
                  background: themeColors.gradient.primary,
                  boxShadow: themeColors.shadow.button
                }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Payments</CardTitle>
              <CardDescription>Configure billing and payment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="paymentMethods" className="text-sm font-medium">Accepted Payment Methods</label>
                  <Input 
                    id="paymentMethods" 
                    placeholder="Cash, Credit Card, Insurance" 
                    defaultValue="Cash, Credit Card, Debit, Insurance" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="invoicePrefix" className="text-sm font-medium">Invoice Prefix</label>
                  <Input 
                    id="invoicePrefix" 
                    placeholder="INV-" 
                    defaultValue="INV-" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="taxRate" className="text-sm font-medium">Tax Rate (%)</label>
                  <Input 
                    id="taxRate" 
                    type="number" 
                    placeholder="8.5" 
                    defaultValue="8.5" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lateFee" className="text-sm font-medium">Late Payment Fee ($)</label>
                  <Input 
                    id="lateFee" 
                    type="number" 
                    placeholder="25.00" 
                    defaultValue="25.00" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/clinic/${clinic}`)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={isSaving}
                style={{ 
                  background: themeColors.gradient.primary,
                  boxShadow: themeColors.shadow.button
                }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>Manage staff roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Staff Members</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Dr. Sarah Johnson</div>
                      <div className="text-sm text-muted-foreground">Lead Practitioner</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Michael Chen</div>
                      <div className="text-sm text-muted-foreground">Physical Therapist</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Emily Davis</div>
                      <div className="text-sm text-muted-foreground">Receptionist</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Add Staff Member
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/clinic/${clinic}`)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={isSaving}
                style={{ 
                  background: themeColors.gradient.primary,
                  boxShadow: themeColors.shadow.button
                }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 