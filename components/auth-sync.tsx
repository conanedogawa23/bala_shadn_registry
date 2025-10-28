"use client";

import { useEffect } from "react";

/**
 * AuthSync component
 * Syncs authentication state from localStorage to cookies
 * This ensures middleware can access auth state for server-side redirects
 */
export function AuthSync() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const syncAuthToCookies = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      const authToken = localStorage.getItem("authToken");

      // Helper to set cookie
      const setCookie = (name: string, value: string, days: number = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      };

      // Helper to get cookie
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };

      // Sync isAuthenticated to cookie if not already synced
      if (isAuthenticated && getCookie("isAuthenticated") !== "true") {
        setCookie("isAuthenticated", "true", 7);
      }

      // Sync authToken to cookie if not already synced
      if (authToken && getCookie("authToken") !== authToken) {
        setCookie("authToken", authToken, 7);
      }

      // If not authenticated, ensure cookies are cleared
      if (!isAuthenticated) {
        document.cookie = "isAuthenticated=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
        document.cookie = "authToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
      }
    };

    // Run sync on mount
    syncAuthToCookies();

    // Also sync on storage events (when auth changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isAuthenticated" || e.key === "authToken") {
        syncAuthToCookies();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

