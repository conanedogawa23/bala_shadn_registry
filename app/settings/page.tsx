"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
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
    
    setSuccessMessage("Your changes have been saved successfully.");
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
  };

  // Only render select components after hydration
  const renderSelects = () => {
    if (!mounted) {
      return null;
    }

    return (
      <>
        {/* Gender select */}
        <div className="space-y-2">
          <label htmlFor="gender" className="text-sm font-medium">Gender</label>
          <Select defaultValue={user?.gender || undefined}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Blood type select */}
        <div className="space-y-2">
          <label htmlFor="bloodType" className="text-sm font-medium">Blood Type</label>
          <Select defaultValue={user?.clinicalInformation?.bloodType || undefined}>
            <SelectTrigger id="bloodType">
              <SelectValue placeholder="Select your blood type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Height unit select */}
        <div className="space-y-2">
          <label htmlFor="heightUnit" className="text-sm font-medium">Height Unit</label>
          <Select defaultValue={user?.wellnessProfile?.height?.unit || undefined}>
            <SelectTrigger id="heightUnit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">Centimeters (cm)</SelectItem>
              <SelectItem value="in">Inches (in)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Weight unit select */}
        <div className="space-y-2">
          <label htmlFor="weightUnit" className="text-sm font-medium">Weight Unit</label>
          <Select defaultValue={user?.wellnessProfile?.weight?.unit || undefined}>
            <SelectTrigger id="weightUnit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="lb">Pounds (lb)</SelectItem>
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
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
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
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Information</TabsTrigger>
          <TabsTrigger value="wellness">Wellness Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-slate-50 pb-3 pt-4">
              <CardTitle className="text-base font-medium">Personal Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                  <Input 
                    id="name" 
                    placeholder="Your full name" 
                    defaultValue={user?.name || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Your email" 
                    defaultValue={user?.email || ""} 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email cannot be changed
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                  <Input 
                    id="phone" 
                    placeholder="Your phone number" 
                    defaultValue={user?.phone || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
                  <Input 
                    id="dob" 
                    type="date"
                    placeholder="Date of birth" 
                    defaultValue={user?.dob || ""} 
                  />
                </div>
              </div>
              
              {/* Render gender select conditionally based on mounted state */}
              {renderSelects()}
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Address</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="street" className="text-sm font-medium">Street Address</label>
                    <Input 
                      id="street" 
                      placeholder="Street address" 
                      defaultValue={user?.address?.street || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">City</label>
                    <Input 
                      id="city" 
                      placeholder="City" 
                      defaultValue={user?.address?.city || ""} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium">State/Province</label>
                    <Input 
                      id="state" 
                      placeholder="State/Province" 
                      defaultValue={user?.address?.state || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="text-sm font-medium">ZIP/Postal Code</label>
                    <Input 
                      id="zipCode" 
                      placeholder="ZIP/Postal Code" 
                      defaultValue={user?.address?.zipCode || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium">Country</label>
                    <Input 
                      id="country" 
                      placeholder="Country" 
                      defaultValue={user?.address?.country || ""} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Emergency Contact</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="emergencyName" className="text-sm font-medium">Contact Name</label>
                    <Input 
                      id="emergencyName" 
                      placeholder="Emergency contact name" 
                      defaultValue={user?.emergencyContact?.name || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="emergencyRelationship" className="text-sm font-medium">Relationship</label>
                    <Input 
                      id="emergencyRelationship" 
                      placeholder="Relationship" 
                      defaultValue={user?.emergencyContact?.relationship || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="emergencyPhone" className="text-sm font-medium">Phone Number</label>
                    <Input 
                      id="emergencyPhone" 
                      placeholder="Emergency contact phone" 
                      defaultValue={user?.emergencyContact?.phone || ""} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 border-destructive/10 bg-destructive/5">
                <div>
                  <div className="font-medium">Sign Out from All Devices</div>
                  <div className="text-sm text-muted-foreground">
                    Sign out from all devices where you are currently logged in
                  </div>
                </div>
                <Button variant="outline" size="sm">Sign Out All</Button>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-4 border-destructive/10 bg-destructive/5">
                <div>
                  <div className="font-medium">Delete Account</div>
                  <div className="text-sm text-muted-foreground">
                    Permanently delete your account and all your data
                  </div>
                </div>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clinical">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Information</CardTitle>
              <CardDescription>Manage your health data and medical information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="allergies" className="text-sm font-medium">Allergies</label>
                  <Input 
                    id="allergies" 
                    placeholder="List any allergies (comma separated)" 
                    defaultValue={user?.clinicalInformation?.allergies?.join(", ") || ""} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="conditions" className="text-sm font-medium">Chronic Conditions</label>
                <Input 
                  id="conditions" 
                  placeholder="List any chronic conditions (comma separated)" 
                  defaultValue={user?.clinicalInformation?.chronicConditions?.join(", ") || ""} 
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Current Medications</h3>
                {user?.clinicalInformation?.currentMedications?.map((medication, index) => (
                  <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-2 p-2 border rounded-md">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Name</label>
                      <Input 
                        placeholder="Medication name" 
                        defaultValue={medication.name} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Dosage</label>
                      <Input 
                        placeholder="Dosage" 
                        defaultValue={medication.dosage} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Frequency</label>
                      <Input 
                        placeholder="Frequency" 
                        defaultValue={medication.frequency} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Purpose</label>
                      <Input 
                        placeholder="Purpose" 
                        defaultValue={medication.purpose} 
                      />
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Add Medication
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Wellness Profile</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Render height/weight selects conditionally */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Height</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Height" 
                        defaultValue={user?.wellnessProfile?.height?.value || ""} 
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Weight</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Weight" 
                        defaultValue={user?.wellnessProfile?.weight?.value || ""} 
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="wellness">
          <Card>
            <CardHeader>
              <CardTitle>Wellness Profile</CardTitle>
              <CardDescription>Manage your wellness profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="bmi" className="text-sm font-medium">BMI</label>
                <Input 
                  type="number" 
                  placeholder="BMI" 
                  defaultValue={user?.wellnessProfile?.bmi || ""} 
                  className="flex-1"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <Button 
          variant="outline" 
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
} 