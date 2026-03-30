"use client";

import { logger } from './utils/logger';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseApiService } from "@/lib/api/baseApiService";
import type { UserPermissions } from "@/lib/api/userApiService";

// Enhanced User interface with comprehensive profile information
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  role?: string; // User role for authorization (admin, manager, staff, etc.)
  /** Persisted from API on login; required for /admin/users and permission-gated UI */
  permissions?: UserPermissions;
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

const clearServerReadableCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
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

/**
 * Clears local auth artifacts and optionally redirects to login.
 * Used when token refresh fails or a session has expired.
 */
export const clearAuthState = (redirectTo: string | null = "/login"): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  } catch (error) {
    logger.warn("[Auth] Failed to clear local auth storage:", error);
  }

  try {
    BaseApiService.clearAllCache();
  } catch (error) {
    logger.warn("[Auth] Failed to clear API cache during session cleanup:", error);
  }

  clearServerReadableCookie("accessToken");
  clearServerReadableCookie("refreshToken");

  if (redirectTo && window.location.pathname !== redirectTo) {
    window.location.href = redirectTo;
  }
};

/** True if the signed-in user may open system user management (matches API user routes). */
export function canManageSystemUsers(): boolean {
  if (typeof window === "undefined") return false;
  const userJson = localStorage.getItem("user");
  if (!userJson) return false;
  try {
    const userData = JSON.parse(userJson) as {
      permissions?: { canManageUsers?: boolean };
      role?: string;
    };
    if (userData.permissions?.canManageUsers === true) return true;
    return userData.role === "admin";
  } catch {
    return false;
  }
}

// Get logged in user with full profile data
export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  
  try {
    const userData = JSON.parse(userJson);
    return userData as User;
  } catch (error) {
    logger.error("Error parsing user data:", error);
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
    logger.error("Error updating user profile:", error);
    return false;
  }
};

// Login the user (call this after successful authentication)
// Tokens stored in localStorage + non-HttpOnly cookie for server-side reads
export const login = (
  userData: User,
  token?: string,
  refreshToken?: string,
  accessTokenExpiresInSeconds: number = 3600
) => {
  if (typeof window === "undefined") return;
  
  logger.debug('[Auth] Logging in user, storing tokens in localStorage');
  
  // Store in localStorage (primary storage)
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("user", JSON.stringify(userData));
  
  if (token) {
    localStorage.setItem("authToken", token);
    // Also set non-HttpOnly cookie for Next.js Server Components
    setServerReadableCookie(
      "accessToken",
      token,
      Math.max(accessTokenExpiresInSeconds, 60) / 86400
    );
    logger.debug('[Auth] Access token stored in localStorage + cookie for SSR');
  }
  
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
    setServerReadableCookie("refreshToken", refreshToken, 7); // 7 days
    logger.debug('[Auth] Refresh token stored in localStorage + cookie for SSR');
  }
};

// Call backend logout API to revoke tokens
const callBackendLogout = async (): Promise<boolean> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const endpoint = `${apiUrl}/auth/logout`;
    const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const authToken = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    logger.debug('[Auth] Calling backend logout at:', endpoint);
    
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
      logger.debug('[Auth] Backend logout successful - tokens revoked');
      return true;
    } else {
      logger.warn(`[Auth] Backend logout failed:`, response.status, response.statusText);
      return false;
    }
  } catch (error) {
    logger.warn('[Auth] Backend logout error:', error);
    return false;
  }
};

// Logout the user - async version that calls backend API
export const logout = async () => {
  if (typeof window === "undefined") return;
  
  logger.debug('[Auth] ========== LOGOUT START ==========');
  logger.debug('[Auth] localStorage keys BEFORE:', Object.keys(localStorage));
  
  // 1. Call backend to revoke tokens in database
  await callBackendLogout();
  
  // 2. CLEAR localStorage completely (where tokens are stored)
  try { 
    localStorage.clear(); 
    logger.debug('[Auth] ✓ localStorage cleared (tokens removed)');
  } catch (e) { 
    logger.error('[Auth] ✗ Could not clear localStorage:', e);
  }
  
  // 3. CLEAR sessionStorage
  try { 
    sessionStorage.clear(); 
    logger.debug('[Auth] ✓ sessionStorage cleared');
  } catch (e) {
    logger.error('[Auth] ✗ Could not clear sessionStorage:', e);
  }
  
  // 4. Clear any remaining cookies (just session cookies, not auth tokens)
  destroyAllCookies();
  
  // 5. Clear API cache
  try { 
    BaseApiService.clearAllCache(); 
    logger.debug('[Auth] ✓ API cache cleared');
  } catch (e) {
    logger.error('[Auth] ✗ Could not clear API cache:', e);
  }
  
  logger.debug('[Auth] localStorage keys AFTER:', Object.keys(localStorage));
  logger.debug('[Auth] ========== LOGOUT COMPLETE ==========');
};

// Synchronous logout for cases where async isn't practical
export const logoutSync = () => {
  if (typeof window === "undefined") return;
  
  logger.debug('[Auth] Sync logout - clearing local data');
  
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
        logger.debug('[Auth] User already authenticated, redirecting to:', redirectIfAuthenticated);
        router.push(redirectIfAuthenticated);
      }
    }
  }, [router, redirectIfAuthenticated]);
} 