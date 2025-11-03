"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccessMessage("Your account settings have been updated successfully.");
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccessMessage("Your password has been changed successfully.");
    setIsChangingPassword(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="bg-slate-50 pb-3 pt-4">
            <CardTitle className="text-base font-medium">Password Security</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
              <Input 
                id="currentPassword" 
                type="password"
                placeholder="Enter your current password" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
              <Input 
                id="newPassword" 
                type="password"
                placeholder="Enter your new password" 
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long and include a mix of letters, numbers, and symbols
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
              <Input 
                id="confirmPassword" 
                type="password"
                placeholder="Confirm your new password" 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="bg-slate-50 pb-3 pt-4">
            <CardTitle className="text-base font-medium">Notification Preferences</CardTitle>
            <CardDescription>Manage how we contact you</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appointment-reminders" className="text-sm font-medium">Appointment Reminders</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications about upcoming appointments</p>
                </div>
                <div className="flex h-6 items-center">
                  <input
                    id="appointment-reminders"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    defaultChecked={user?.accountSettings?.notificationSettings?.appointmentReminders || false}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appointment-changes" className="text-sm font-medium">Appointment Changes</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications when appointments are changed</p>
                </div>
                <div className="flex h-6 items-center">
                  <input
                    id="appointment-changes"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    defaultChecked={user?.accountSettings?.notificationSettings?.appointmentChanges || false}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="promotional-content" className="text-sm font-medium">Promotional Content</Label>
                  <p className="text-xs text-muted-foreground">Receive special offers and promotions</p>
                </div>
                <div className="flex h-6 items-center">
                  <input
                    id="promotional-content"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    defaultChecked={user?.accountSettings?.notificationSettings?.promotionalContent || false}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-6 text-center md:text-left">
        <Button 
          variant="outline" 
          onClick={() => router.push("/settings")}
        >
          Back to Settings
        </Button>
      </div>
    </div>
  );
} 