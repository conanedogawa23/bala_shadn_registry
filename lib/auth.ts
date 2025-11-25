"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { currentUserData } from "@/lib/mock-data";
import { BaseApiService } from "@/lib/api/baseApiService";

// Enhanced User interface with comprehensive profile information
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  role?: string; // User role for authorization (admin, manager, staff, etc.)
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

// Helper to set a non-HttpOnly cookie for server-side reads
const setServerReadableCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// Clear any session cookies (backup cleanup)
const destroyAllCookies = () => {
  if (typeof document === "undefined") return;
  
  const hostname = window.location.hostname;
  const domains = [hostname, `.${hostname}`, ''];
  const paths = ['/', ''];
  
  // Get current pathname segments to clear path-specific cookies
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += '/' + segment;
    paths.push(currentPath);
  }
  
  // Get all visible cookies
  const allCookies = document.cookie.split(';');
  
  for (const cookieStr of allCookies) {
    const cookieName = cookieStr.split('=')[0].trim();
    if (!cookieName) continue;
    
    // Try EVERY combination to kill this cookie
    for (const domain of domains) {
      for (const path of paths) {
        const domainPart = domain ? `;domain=${domain}` : '';
        
        // Expired date approach
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'}${domainPart}`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'}${domainPart};SameSite=Lax`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'}${domainPart};SameSite=Strict`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'}${domainPart};SameSite=None;Secure`;
        
        // Max-age=0 approach
        document.cookie = `${cookieName}=;max-age=0;path=${path || '/'}${domainPart}`;
        document.cookie = `${cookieName}=;max-age=0;path=${path || '/'}${domainPart};SameSite=Lax`;
        
        // Max-age=-1 approach (negative)
        document.cookie = `${cookieName}=;max-age=-1;path=${path || '/'}${domainPart}`;
      }
    }
  }
};

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

// Login the user (call this after successful authentication)
// Tokens stored in localStorage + non-HttpOnly cookie for server-side reads
export const login = (userData: User, token?: string, refreshToken?: string) => {
  if (typeof window === "undefined") return;
  
  console.log('[Auth] Logging in user, storing tokens in localStorage');
  
  // Store in localStorage (primary storage)
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("user", JSON.stringify(userData));
  
  if (token) {
    localStorage.setItem("authToken", token);
    // Also set non-HttpOnly cookie for Next.js Server Components
    setServerReadableCookie("accessToken", token, 1/96); // 15 minutes
    console.log('[Auth] Access token stored in localStorage + cookie for SSR');
  }
  
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
    setServerReadableCookie("refreshToken", refreshToken, 7); // 7 days
    console.log('[Auth] Refresh token stored in localStorage + cookie for SSR');
  }
};

// Call backend logout API to revoke tokens
const callBackendLogout = async (): Promise<boolean> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const endpoint = `${apiUrl}/api/v1/auth/logout`;
    const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const authToken = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    console.log('[Auth] Calling backend logout at:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }), // Include access token in header
      },
      // Include refresh token in the request body for revocation
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      console.log('[Auth] Backend logout successful - tokens revoked');
      return true;
    } else {
      console.warn(`[Auth] Backend logout failed:`, response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.warn('[Auth] Backend logout error:', error);
    return false;
  }
};

// Logout the user - async version that calls backend API
export const logout = async () => {
  if (typeof window === "undefined") return;
  
  console.log('[Auth] ========== LOGOUT START ==========');
  console.log('[Auth] localStorage keys BEFORE:', Object.keys(localStorage));
  
  // 1. Call backend to revoke tokens in database
  await callBackendLogout();
  
  // 2. CLEAR localStorage completely (where tokens are stored)
  try { 
    localStorage.clear(); 
    console.log('[Auth] ✓ localStorage cleared (tokens removed)');
  } catch (e) { 
    console.error('[Auth] ✗ Could not clear localStorage:', e);
  }
  
  // 3. CLEAR sessionStorage
  try { 
    sessionStorage.clear(); 
    console.log('[Auth] ✓ sessionStorage cleared');
  } catch (e) {
    console.error('[Auth] ✗ Could not clear sessionStorage:', e);
  }
  
  // 4. Clear any remaining cookies (just session cookies, not auth tokens)
  destroyAllCookies();
  
  // 5. Clear API cache
  try { 
    BaseApiService.clearAllCache(); 
    console.log('[Auth] ✓ API cache cleared');
  } catch (e) {
    console.error('[Auth] ✗ Could not clear API cache:', e);
  }
  
  console.log('[Auth] localStorage keys AFTER:', Object.keys(localStorage));
  console.log('[Auth] ========== LOGOUT COMPLETE ==========');
};

// Synchronous logout for cases where async isn't practical
export const logoutSync = () => {
  if (typeof window === "undefined") return;
  
  console.log('[Auth] Sync logout - clearing local data');
  
  // Fire and forget backend call
  callBackendLogout().catch(() => {});
  
  // Clear local storage (where tokens are stored)
  try { localStorage.clear(); } catch { /* ignore */ }
  try { sessionStorage.clear(); } catch { /* ignore */ }
  try { BaseApiService.clearAllCache(); } catch { /* ignore */ }
  destroyAllCookies();
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
    logout: async () => {
      await logout();
      // Force hard reload to clear all in-memory state
      window.location.href = redirectTo;
    }
  };
}

// Public routes hook for login/register pages
export function usePublicRoute(redirectIfAuthenticated = "/clinic/bodyblissphysio") {
  const router = useRouter();

  useEffect(() => {
    // Only access localStorage when in browser environment
    if (typeof window !== "undefined") {
      if (isAuthenticated()) {
        console.log('[Auth] User already authenticated, redirecting to:', redirectIfAuthenticated);
        router.push(redirectIfAuthenticated);
      }
    }
  }, [router, redirectIfAuthenticated]);
} 