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
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { isAuthenticated, getUser, logout, User } from "@/lib/auth";

export default function NavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen, notificationsOpen]);

  const handleLogout = useCallback(() => {
    logout();
    setUserAuthenticated(false);
    setUserData(null);
    setUserMenuOpen(false);
    router.push('/login');
  }, [router]);
  
  const isActive = useCallback((path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  }, [pathname]);
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />
    },
    {
      name: "Clients",
      href: "/clients",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "Orders",
      href: "/orders",
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      name: "Payments",
      href: "/payments",
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      name: "Settings",
      href: "/settings",
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
  
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl" style={{ color: themeColors.primary }}>Body Bliss Visio</Link>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.icon}
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            {mounted && userAuthenticated ? (
              <>
                {/* Notifications button */}
                {notificationEnabled && (
                  <div className="relative">
                    <button 
                      onClick={e => { e.stopPropagation(); toggleNotifications(); }}
                      className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </button>
                    
                    {/* Notifications dropdown */}
                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                            <p className="text-sm font-medium text-gray-900">Appointment Reminder</p>
                            <p className="text-xs text-gray-500">Your appointment with Dr. Emma Wilson is tomorrow at 10:30 AM</p>
                            <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                          </div>
                          <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                            <p className="text-sm font-medium text-gray-900">Payment Processed</p>
                            <p className="text-xs text-gray-500">Your payment of $75.00 has been processed successfully</p>
                            <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                          </div>
                        </div>
                        <div className="px-4 py-2 text-center border-t border-gray-100">
                          <Link href="/notifications" className="text-xs text-blue-600 hover:text-blue-800">
                            View all notifications
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* User profile dropdown */}
                <div className="relative">
                  <button 
                    onClick={e => { e.stopPropagation(); toggleUserMenu(); }}
                    className="flex items-center space-x-2 text-sm focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium overflow-hidden">
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />}
                    </div>
                    <div className="hidden md:flex md:flex-col md:items-start">
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {userData?.name || "User"}
                        {membershipBadge}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">
                        {userData?.email || ""}
                      </span>
                    </div>
                    <ChevronDown className="hidden md:block h-4 w-4 text-gray-500" />
                  </button>
                  
                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                        <p className="text-sm font-medium text-gray-900">{userData?.name}</p>
                        <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
                      </div>
                      <Link 
                        href="/settings/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link 
                        href="/settings/account" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Account Settings
                      </Link>
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
                  className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            ) : null}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              aria-expanded="false"
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
      <div className="sm:hidden hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                isActive(item.href)
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              <span className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 