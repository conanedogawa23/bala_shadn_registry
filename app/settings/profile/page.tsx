"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserApiService, User } from "@/lib/api/userApiService";

export default function ProfileSettingsPage() {
  const router = useRouter();
  // Don't use useAuth() hook here as it redirects before API call can happen
  // We'll check authentication directly in useEffect
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Canada"
    }
  });

  // Set mounted state to true after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile on mount
  useEffect(() => {
    console.log('=== ProfileSettingsPage useEffect RUNNING ===');
    
    const fetchUserProfile = async () => {
      console.log('Step 1: fetchUserProfile function called');
      
      // Check if running in browser
      if (typeof window === 'undefined') {
        console.log('Step 2: window is undefined, returning');
        return;
      }
      console.log('Step 2: window exists, continuing...');

      // Check authentication first
      const isAuthenticatedValue = localStorage.getItem('isAuthenticated');
      console.log('Step 3: isAuthenticated value:', isAuthenticatedValue);
      
      if (isAuthenticatedValue !== 'true') {
        console.log('Step 4: User not authenticated, redirecting to login...');
        router.push('/login');
        return;
      }
      console.log('Step 4: User is authenticated, continuing...');

      // Get user ID from localStorage directly to ensure we have the MongoDB _id
      const userJson = localStorage.getItem('user');
      console.log('Step 5: userJson:', userJson ? 'exists' : 'null');
      
      if (!userJson) {
        console.log('Step 6: No user data found, redirecting...');
        setIsLoading(false);
        setErrorMessage("User not authenticated. Please log in again.");
        router.push('/login');
        return;
      }
      console.log('Step 6: User data found, parsing...');

      let userId: string;
      try {
        const userData = JSON.parse(userJson);
        console.log('Step 7: Parsed user data:', userData);
        userId = userData.id || userData._id;
        console.log('Step 8: Extracted userId:', userId);
        
        if (!userId) {
          console.log('Step 9: userId is empty, stopping');
          setIsLoading(false);
          setErrorMessage("Invalid user data. Please log in again.");
          return;
        }
        console.log('Step 9: userId is valid, proceeding to API call...');
      } catch (error) {
        console.error("Step 7 ERROR: Failed to parse user data:", error);
        setIsLoading(false);
        setErrorMessage("Invalid user data. Please log in again.");
        return;
      }

      try {
        console.log("Step 10: Making API call for user ID:", userId);
        const profile = await UserApiService.getCurrentUser(userId);
        console.log("Step 11: API call successful, profile:", profile);
        console.log("Step 11b: profile.profile structure:", profile.profile);
        setUserProfile(profile);
        
        // Populate form with existing data
        const newFormData = {
          firstName: profile.profile?.firstName || "",
          lastName: profile.profile?.lastName || "",
          phone: profile.profile?.phone || "",
          dateOfBirth: profile.profile?.dateOfBirth 
            ? new Date(profile.profile.dateOfBirth).toISOString().split('T')[0] 
            : "",
          gender: profile.profile?.gender || "",
          address: {
            street: profile.profile?.address?.street || "",
            city: profile.profile?.address?.city || "",
            province: profile.profile?.address?.province || "",
            postalCode: profile.profile?.address?.postalCode || "",
            country: profile.profile?.address?.country || "Canada"
          }
        };
        console.log("Step 12: Setting form data to:", newFormData);
        setFormData(newFormData);
        console.log("Step 13: Form data set successfully");
      } catch (error) {
        console.error("Step 10 ERROR: Failed to fetch user profile:", error);
        setErrorMessage("Failed to load profile data. Please refresh the page.");
      } finally {
        setIsLoading(false);
        console.log("Step 14: Loading complete");
      }
    };

    fetchUserProfile();
    console.log('=== ProfileSettingsPage useEffect DONE (async function initiated) ===');
  }, []); // Run only once on mount

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveChanges = async () => {
    // Get user ID from localStorage directly
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userJson) {
      setErrorMessage("User not authenticated. Please log in again.");
      return;
    }

    let userId: string;
    try {
      const userData = JSON.parse(userJson);
      userId = userData.id || userData._id;
      
      if (!userId) {
        setErrorMessage("Invalid user data. Please log in again.");
        return;
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
      setErrorMessage("Invalid user data. Please log in again.");
      return;
    }

    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const updateData = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          gender: formData.gender,
          address: formData.address
        }
      };

      console.log("Updating user profile for ID:", userId, updateData);
      const updatedUser = await UserApiService.updateUserProfile(userId, updateData);
      setUserProfile(updatedUser);
      setSuccessMessage("Your profile has been updated successfully.");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setErrorMessage(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Only render select components after hydration
  const renderSelects = () => {
    if (!mounted) {
      return null;
    }

    return (
      <div className="space-y-2">
        <label htmlFor="gender" className="text-sm font-medium">Gender</label>
        <Select 
          value={formData.gender} 
          onValueChange={(value) => handleInputChange('gender', value)}
        >
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select your gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

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
      
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {errorMessage}
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
              <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
              <Input 
                id="firstName" 
                placeholder="Your first name" 
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
              <Input 
                id="lastName" 
                placeholder="Your last name" 
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Your email" 
                value={userProfile?.email || ""} 
                disabled 
              />
              <p className="text-xs text-muted-foreground">
                Your email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
              <Input 
                id="phone" 
                placeholder="Your phone number" 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
              <Input 
                id="dob" 
                type="date"
                placeholder="Date of birth" 
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
            {/* Render gender select conditionally based on mounted state */}
            {renderSelects()}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Address</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="street" className="text-sm font-medium">Street Address</label>
                <Input 
                  id="street" 
                  placeholder="Street address" 
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">City</label>
                <Input 
                  id="city" 
                  placeholder="City" 
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="province" className="text-sm font-medium">Province</label>
                <Input 
                  id="province" 
                  placeholder="Province" 
                  value={formData.address.province}
                  onChange={(e) => handleInputChange('address.province', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="postalCode" className="text-sm font-medium">Postal Code</label>
                <Input 
                  id="postalCode" 
                  placeholder="Postal Code" 
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium">Country</label>
                <Input 
                  id="country" 
                  placeholder="Country" 
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
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