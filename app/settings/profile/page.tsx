"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
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
    
    setSuccessMessage("Your profile has been updated successfully.");
    setIsSaving(false);
  };

  // Only render select components after hydration
  const renderSelects = () => {
    if (!mounted) {
      return null;
    }

    return (
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
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
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
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push("/settings")}
          >
            Back to Settings
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 