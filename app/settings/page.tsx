"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClinic } from "@/lib/contexts/clinic-context";
import { generateLink } from "@/lib/route-utils";
import { clinicToSlug } from "@/lib/data/clinics";
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  CreditCard, 
  ArrowRight,
  Users
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { selectedClinic } = useClinic();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Set mounted state to true after hydration
  useEffect(() => {
    setMounted(true);
    
    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const userData = JSON.parse(userJson);
          setUserRole(userData.role);
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
    }
  }, []);

  // Get clinic slug for generating links
  const getClinicSlug = (): string => {
    if (!selectedClinic) return 'bodyblissphysio';
    return selectedClinic.name;
  };

  // Settings categories
  const userSettings = [
    {
      title: "Profile",
      description: "Manage your personal information",
      icon: <User className="h-6 w-6" />,
      href: "/settings/profile",
      color: "text-blue-600"
    },
    {
      title: "Account",
      description: "Manage your account settings and security",
      icon: <Shield className="h-6 w-6" />,
      href: "/settings/account",
      color: "text-green-600"
    },
    {
      title: "Notifications",
      description: "Configure your notification preferences",
      icon: <Bell className="h-6 w-6" />,
      href: "/settings/notifications",
      color: "text-amber-600"
    }
  ];

  const clinicSettings = selectedClinic ? [
    {
      title: "Clinic Settings",
      description: `Manage settings for ${selectedClinic.displayName}`,
      icon: <Building2 className="h-6 w-6" />,
      href: generateLink('clinic', 'settings', getClinicSlug()),
      color: "text-purple-600"
    },
    {
      title: "Billing & Payments",
      description: "Manage billing and payment settings",
      icon: <CreditCard className="h-6 w-6" />,
      href: generateLink('clinic', 'settings?tab=billing', getClinicSlug()),
      color: "text-indigo-600"
    }
  ] : [];

  const adminSettings = (userRole === 'admin' || userRole === 'manager') ? [
    {
      title: "User Management",
      description: "Manage system users, roles, and permissions",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/users",
      color: "text-rose-600"
    }
  ] : [];

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application settings</p>
      </div>

      <div className="space-y-8">
        {/* User Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">User Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSettings.map((setting) => (
              <Card 
                key={setting.title} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(setting.href)}
              >
                <CardHeader className="pb-2">
                  <div className={`${setting.color} mb-2`}>
                    {setting.icon}
                  </div>
                  <CardTitle className="text-lg">{setting.title}</CardTitle>
                  <CardDescription>{setting.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
                  >
                    <span>Manage</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Clinic Settings */}
        {selectedClinic && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Clinic Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinicSettings.map((setting) => (
                <Card 
                  key={setting.title} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(setting.href)}
                >
                  <CardHeader className="pb-2">
                    <div className={`${setting.color} mb-2`}>
                      {setting.icon}
                    </div>
                    <CardTitle className="text-lg">{setting.title}</CardTitle>
                    <CardDescription>{setting.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
                    >
                      <span>Manage</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Admin Settings */}
        {adminSettings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Administration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminSettings.map((setting) => (
                <Card 
                  key={setting.title} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-rose-100"
                  onClick={() => router.push(setting.href)}
                >
                  <CardHeader className="pb-2">
                    <div className={`${setting.color} mb-2`}>
                      {setting.icon}
                    </div>
                    <CardTitle className="text-lg">{setting.title}</CardTitle>
                    <CardDescription>{setting.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
                    >
                      <span>Manage</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}