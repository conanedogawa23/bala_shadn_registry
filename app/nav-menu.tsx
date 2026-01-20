"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  Home, 
  Settings,
  ShoppingBag,
  CreditCard,
  LogIn,
  UserCircle,
  Bell,
  ChevronDown,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { isAuthenticated, getUser, logout, User } from "@/lib/auth";
import { ClinicSelector } from "@/components/clinic/clinic-selector";
import { useClinic } from "@/lib/contexts/clinic-context";
import { generateLink } from "@/lib/route-utils";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useNotifications } from "@/lib/hooks/useNotifications";

export default function NavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedClinic } = useClinic();
  const [mounted, setMounted] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get clinic name for notifications
  const clinicName = selectedClinic?.name || 'bodyblissphysio';
  
  // Use notifications hook for unread count
  const { unreadCount } = useNotifications({
    clinicName,
    pollingInterval: 30000,
    enablePolling: userAuthenticated,
    limit: 2
  });

  // Handle hydration mismatch and setup auth listener
  useEffect(() => {
    setMounted(true);
    
    // Initial auth check
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setUserAuthenticated(authStatus);
      
      if (authStatus) {
        const user = getUser();
        setUserData(user);
      } else {
        setUserData(null);
      }
    };
    
    checkAuth();
    
    // Setup auth check interval
    const authCheckInterval = setInterval(checkAuth, 5000); // Check every 5 seconds
    
    return () => clearInterval(authCheckInterval);
  }, []);

  // Toggle user menu dropdown
  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen(prev => !prev);
    if (notificationsOpen) setNotificationsOpen(false);
  }, [notificationsOpen]);

  // Toggle notifications dropdown
  const toggleNotifications = useCallback(() => {
    setNotificationsOpen(prev => !prev);
    if (userMenuOpen) setUserMenuOpen(false);
  }, [userMenuOpen]);

  // Close all dropdowns when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      if (userMenuOpen) setUserMenuOpen(false);
      if (notificationsOpen) setNotificationsOpen(false);
      if (mobileMenuOpen) setMobileMenuOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen, notificationsOpen, mobileMenuOpen]);

  const handleLogout = useCallback(async () => {
    // Immediately update UI state
    setUserAuthenticated(false);
    setUserData(null);
    setUserMenuOpen(false);
    
    // Perform logout (clears cookies, localStorage, sessionStorage, API cache, calls backend API)
    await logout();
    
    // Force a hard page reload to clear all in-memory state (React state, contexts, etc.)
    // This ensures a completely clean slate and redirects to login
    window.location.href = '/login';
  }, []);
  
  const isActive = useCallback((path: string) => {
    // Exact match only
    return pathname === path;
  }, [pathname]);
  
  // Generate clinic-aware navigation items using the route utility
  const getClinicSlug = (): string => {
    if (!selectedClinic) return 'bodyblissphysio';
    // Use the clinic name directly to match MongoDB
    return selectedClinic.name;
  };

  const navItems = [
    {
      name: "Dashboard",
      href: generateLink('clinic', '', getClinicSlug()),
      icon: <Home className="h-5 w-5" />
    },
    {
      name: "Clients",
      href: generateLink('clinic', 'clients', getClinicSlug()),
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "Orders",
      href: generateLink('clinic', 'orders', getClinicSlug()),
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      name: "Payments",
      href: generateLink('clinic', 'payments', getClinicSlug()),
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      name: "Reports",
      href: generateLink('clinic', 'reports', getClinicSlug()),
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      name: "Settings",
      href: generateLink('clinic', 'settings', getClinicSlug()),
      icon: <Settings className="h-5 w-5" />
    }
  ];
  
  // Get user's membership status if available
  const membershipStatus = userData?.membershipDetails?.membershipStatus || null;
  const membershipBadge = membershipStatus === "Premium" 
    ? <span className="ml-2 text-xs bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full font-medium">Premium</span>
    : null;

  // Get user's notification preferences if available
  const notificationEnabled = userData?.accountSettings?.notificationSettings?.appointmentReminders || false;
  
  // Debug: Log selected clinic and logo status
  React.useEffect(() => {
    if (selectedClinic) {
      console.log('🏥 Selected clinic in nav:', {
        name: selectedClinic.name,
        displayName: selectedClinic.displayName,
        hasLogo: !!selectedClinic.logo,
        hasLogoData: !!selectedClinic.logo?.data,
        logoDataLength: selectedClinic.logo?.data?.length || 0,
        logoContentType: selectedClinic.logo?.contentType
      });
    }
  }, [selectedClinic]);
  
  return (
    <nav className="bg-white border-b">
      <div className="max-w-8xl mx-auto px-1 sm:px-2 lg:px-3">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {selectedClinic?.logo?.data ? (
                <Link href="/" className="flex items-center">
                  <img 
                    src={`data:${selectedClinic.logo.contentType};base64,${selectedClinic.logo.data}`}
                    alt={`${selectedClinic.displayName} logo`}
                    className="h-10 w-auto object-contain"
                  />
                </Link>
              ) : null}
            </div>
            
            {/* Clinic Selector */}
            <div className="hidden md:ml-2 md:flex md:items-center">
              <ClinicSelector className="w-[180px] lg:w-[200px]" />
            </div>
            
            <div className="hidden lg:ml-2 lg:flex lg:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1.5 pt-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap",
                    isActive(item.href)
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {item.icon}
                    <span className="hidden xl:inline">{item.name}</span>
                  </span>
                </Link>
              ))}
            </div>
            
            {/* Compact nav for medium screens */}
            <div className="hidden md:flex lg:hidden md:ml-2 md:space-x-1">
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                  title={item.name}
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:ml-3 md:flex md:items-center space-x-3 pr-1">
            {mounted && userAuthenticated ? (
              <>
                {/* Notifications button */}
                {notificationEnabled && (
                  <div className="relative">
                    <button 
                      onClick={e => { e.stopPropagation(); toggleNotifications(); }}
                      className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium ring-2 ring-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Notifications dropdown */}
                    <NotificationDropdown
                      clinicName={clinicName}
                      isOpen={notificationsOpen}
                      onClose={() => setNotificationsOpen(false)}
                    />
                  </div>
                )}
                
                {/* User profile dropdown */}
                <div className="relative">
                  <button 
                    onClick={e => { e.stopPropagation(); toggleUserMenu(); }}
                    className="flex items-center space-x-3 text-sm focus:outline-none hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium overflow-hidden">
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />}
                    </div>
                    <div className="hidden lg:flex lg:flex-col lg:items-start min-w-0">
                      <span className="text-sm font-medium text-gray-900 flex items-center truncate max-w-[120px]">
                        {userData?.name || "User"}
                        {membershipBadge}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[120px]">
                        {userData?.email || ""}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                        <p className="text-sm font-medium text-gray-900">{userData?.name}</p>
                        <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
                      </div>
                      <Link 
                        href={generateLink('clinic', 'settings/profile', getClinicSlug())}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link 
                        href={generateLink('clinic', 'settings/account', getClinicSlug())}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Account Settings
                      </Link>
                      {(userData?.role === 'admin' || userData?.role === 'manager') && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Link 
                            href="/admin/users"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            User Management
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : mounted ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            ) : null}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2 pr-1">
            {/* Mobile clinic selector */}
            <div className="sm:block md:hidden">
              <ClinicSelector className="w-[140px]" />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={cn("md:hidden", mobileMenuOpen ? "block" : "hidden")}>
        <div className="pt-2 pb-3 space-y-1 border-t border-gray-200">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors",
                isActive(item.href)
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              <span className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </span>
            </Link>
          ))}
          {mounted && userAuthenticated && (userData?.role === 'admin' || userData?.role === 'manager') && (
            <>
              <div className="border-t border-gray-200 my-2"></div>
              <Link
                href="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors",
                  isActive('/admin/users')
                    ? "bg-purple-50 border-purple-500 text-purple-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                <span className="flex items-center">
                  <Shield className="h-5 w-5" />
                  <span className="ml-3">User Management</span>
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 