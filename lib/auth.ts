"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { currentUserData } from "@/lib/mock-data";

// Enhanced User interface with comprehensive profile information
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    primaryHolder: boolean;
    coverageStartDate: string;
    coverageEndDate: string;
  };
  clinicalInformation: {
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    currentMedications: {
      name: string;
      dosage: string;
      frequency: string;
      purpose: string;
    }[];
    surgicalHistory: {
      procedure: string;
      date: string;
      hospital: string;
    }[];
    vaccinations: {
      name: string;
      date: string;
    }[];
  };
  wellnessProfile: {
    height: { value: number; unit: string };
    weight: { value: number; unit: string };
    bmi: number;
    exerciseFrequency: string;
    dietaryPreferences: string[];
    sleepAverage: number;
    stressLevel: string;
    goals: string[];
  };
  treatmentPreferences: {
    preferredClinics: number[];
    preferredProviders: number[];
    preferredAppointmentDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    preferredAppointmentTimes: string[];
    communicationPreferences: {
      appointmentReminders: string;
      generalCommunication: string;
      promotionalOffers: boolean;
    };
  };
  accountSettings: {
    language: string;
    timezone: string;
    receiveNewsletter: boolean;
    twoFactorEnabled: boolean;
    notificationSettings: {
      appointmentReminders: boolean;
      appointmentChanges: boolean;
      treatmentSummaries: boolean;
      billingUpdates: boolean;
      promotionalContent: boolean;
    };
    privacySettings: {
      shareDataForResearch: boolean;
      allowLocationTracking: boolean;
    };
  };
  membershipDetails: {
    memberSince: string;
    membershipType: string;
    membershipStatus: string;
    membershipExpiration: string;
    loyaltyPoints: number;
    referrals: number;
  };
}

// Check if user is authenticated client-side
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  
  const isAuth = localStorage.getItem("isAuthenticated") === "true";
  return isAuth;
};

// Get logged in user with full profile data
export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  
  try {
    // Get basic user data from localStorage
    const basicUserData = JSON.parse(userJson);
    
    // If this is just basic auth data (from login), fetch the full user profile
    if (!basicUserData.id && basicUserData.email) {
      // In a real app, this would be an API call using the email to get user details
      // For this demo, we'll use the mock data directly
      return currentUserData as User;
    }
    
    return basicUserData as User;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = (userData: Partial<User>): boolean => {
  if (typeof window === "undefined") return false;
  
  try {
    // Get current user data
    const currentUser = getUser();
    if (!currentUser) return false;
    
    // Merge new data with existing data
    const updatedUser = { ...currentUser, ...userData };
    
    // Save updated user data to localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
};

// Logout the user
export const logout = () => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
};

// Authentication hook for protected routes
export function useAuth(redirectTo = "/login") {
  const router = useRouter();

  useEffect(() => {
    // Only access localStorage when in browser environment
    if (typeof window !== "undefined") {
      if (!isAuthenticated()) {
        router.push(redirectTo);
      }
    }
  }, [router, redirectTo]);

  return {
    isAuthenticated: isAuthenticated(),
    user: getUser(),
    updateProfile: updateUserProfile,
    logout: () => {
      logout();
      router.push(redirectTo);
    }
  };
}

// Public routes hook for login/register pages
export function usePublicRoute(redirectIfAuthenticated = "/") {
  const router = useRouter();

  useEffect(() => {
    // Only access localStorage when in browser environment
    if (typeof window !== "undefined") {
      if (isAuthenticated()) {
        router.push(redirectIfAuthenticated);
      }
    }
  }, [router, redirectIfAuthenticated]);
} 