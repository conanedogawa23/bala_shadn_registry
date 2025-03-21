"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit2, ChevronRight, Settings, User, Calendar, FileText, CreditCard, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserInfo, ProfileFormValues } from "./user-info";
import { AppointmentHistory, Appointment } from "./appointment-history";

// Mock user data
const mockUserData: ProfileFormValues = {
  fullName: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  phone: "(555) 123-4567",
  address: "123 Wellness Ave, Healthtown, CA 94123",
  bio: "Fitness enthusiast and wellness advocate focused on holistic health approaches. Regularly attending yoga and pilates sessions to maintain balance and strength.",
  dateOfBirth: "1988-05-15",
  emergencyContact: "John Johnson (Husband) - (555) 987-6543",
};

// Mock appointment data
const appointments: Appointment[] = [
  {
    id: 1,
    service: "Therapeutic Massage",
    provider: "Dr. Maria Lopez",
    date: "2023-10-15",
    time: "10:00 AM",
    status: "completed",
  },
  {
    id: 2,
    service: "Wellness Consultation",
    provider: "Dr. James Wilson",
    date: "2023-11-05",
    time: "2:30 PM",
    status: "completed",
  },
  {
    id: 3,
    service: "Physical Therapy",
    provider: "Dr. Lisa Chen",
    date: "2023-12-20",
    time: "11:15 AM",
    status: "scheduled",
  },
  {
    id: 4,
    service: "Nutritional Assessment",
    provider: "Dr. Michael Brown",
    date: "2024-01-10",
    time: "3:00 PM",
    status: "scheduled",
  },
];

// Placeholder component for UserSettings
const UserSettings = () => (
  <div className="space-y-6">
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Change Password</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Confirm new password"
          />
        </div>
        <Button className="mt-2">Update Password</Button>
      </div>
    </div>
    
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Security Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <Button variant="outline">Enable</Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Login Notifications</h4>
            <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
          </div>
          <Button variant="outline">Enable</Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Account Recovery</h4>
            <p className="text-sm text-gray-500">Setup recovery options for your account</p>
          </div>
          <Button variant="outline">Setup</Button>
        </div>
      </div>
    </div>
    
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Account Management</h3>
      <div className="space-y-4">
        <Button variant="outline" className="w-full flex justify-center bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200">
          Delete Account
        </Button>
      </div>
    </div>
  </div>
);

// Placeholder component for UserBilling
const UserBilling = () => (
  <div className="space-y-6">
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
      <div className="space-y-4">
        <div className="border p-4 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-md p-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-sm text-gray-500">Expires 12/2025</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Edit</Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Remove</Button>
          </div>
        </div>
        
        <Button className="w-full">Add New Payment Method</Button>
      </div>
    </div>
    
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Insurance Information</h3>
      <div className="space-y-4">
        <div className="border p-4 rounded-md">
          <div className="flex justify-between mb-2">
            <p className="font-medium">HealthCare Plus</p>
            <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
          </div>
          <p className="text-sm text-gray-500">Policy #: HCP-12345678</p>
          <p className="text-sm text-gray-500">Group #: GP-987654</p>
          <p className="text-sm text-gray-500">Coverage: 01/01/2023 - 12/31/2023</p>
        </div>
        
        <Button className="w-full">Update Insurance Information</Button>
      </div>
    </div>
    
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Billing History</h3>
      <div className="space-y-2">
        <div className="border-b pb-2 pt-2 flex items-center justify-between">
          <div>
            <p className="font-medium">Physical Therapy Session</p>
            <p className="text-sm text-gray-500">Oct 15, 2023</p>
          </div>
          <p className="font-medium">$75.00</p>
        </div>
        
        <div className="border-b pb-2 pt-2 flex items-center justify-between">
          <div>
            <p className="font-medium">Wellness Consultation</p>
            <p className="text-sm text-gray-500">Nov 05, 2023</p>
          </div>
          <p className="font-medium">$120.00</p>
        </div>
        
        <div className="border-b pb-2 pt-2 flex items-center justify-between">
          <div>
            <p className="font-medium">Therapeutic Massage</p>
            <p className="text-sm text-gray-500">Dec 20, 2023</p>
          </div>
          <p className="font-medium">$90.00</p>
        </div>
        
        <Button variant="outline" className="w-full mt-4">View All Transactions</Button>
      </div>
    </div>
  </div>
);

// Placeholder component for UserPreferences
const UserPreferences = () => (
  <div className="space-y-6">
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive appointment reminders via email</p>
          </div>
          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">SMS Notifications</h4>
            <p className="text-sm text-gray-500">Receive appointment reminders via text message</p>
          </div>
          <div className="w-11 h-6 bg-[#6666FF] rounded-full after:content-[''] after:absolute after:top-0.5 after:left-[18px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Marketing Communications</h4>
            <p className="text-sm text-gray-500">Receive promotional offers and updates</p>
          </div>
          <div className="w-11 h-6 bg-gray-200 rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </div>
      </div>
    </div>
    
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Language & Region</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option>Pacific Time (PT)</option>
            <option>Mountain Time (MT)</option>
            <option>Central Time (CT)</option>
            <option>Eastern Time (ET)</option>
          </select>
        </div>
        
        <Button>Save Preferences</Button>
      </div>
    </div>
    
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Accessibility</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">High Contrast Mode</h4>
            <p className="text-sm text-gray-500">Enhance visual distinction between elements</p>
          </div>
          <div className="w-11 h-6 bg-gray-200 rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Text Size</h4>
            <p className="text-sm text-gray-500">Adjust the size of text throughout the application</p>
          </div>
          <select className="px-3 py-1 border rounded-md">
            <option>Normal</option>
            <option>Large</option>
            <option>Extra Large</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

// Badge component for UserBilling
const Badge = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

export default function ProfilePage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [userData, setUserData] = useState<ProfileFormValues>(mockUserData);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Toggle between view and edit modes
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  
  // Handle form submission
  const handleSave = (values: ProfileFormValues) => {
    setUserData(values);
    setIsEditMode(false);
  };
  
  // Handle cancel edit
  const handleCancel = () => {
    setIsEditMode(false);
  };

  // Navigation items for the sidebar
  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "records", label: "Medical Records", icon: FileText },
    { id: "billing", label: "Billing & Insurance", icon: CreditCard },
    { id: "settings", label: "Account Settings", icon: Settings },
    { id: "preferences", label: "Preferences", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="w-full h-48 bg-gradient-to-r from-[#6666FF] to-[#5151CC] relative">
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Image 
                  src="/images/clinic/health-icon.svg" 
                  alt="Body Bliss Visio" 
                  width={24} 
                  height={24} 
                  className="h-6 w-6"
                />
              </div>
              <h1 className="text-2xl font-bold text-white">Body Bliss Visio</h1>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                asChild
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                asChild
              >
                <Link href="/logout">Logout</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-16">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 flex flex-col items-center space-y-4 border-b">
                <div className="relative w-24 h-24">
                  <Image 
                    src="https://ui.shadcn.com/avatars/01.png"
                    alt={userData.fullName}
                    fill
                    className="rounded-full object-cover border-4 border-white"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">{userData.fullName}</h3>
                  <p className="text-sm text-gray-500">Patient ID: #BV78923</p>
                </div>
              </div>
              
              <nav className="p-2">
                <ul>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-left transition-colors ${
                            activeTab === item.id
                              ? "bg-[#6666FF]/10 text-[#6666FF] font-medium"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => setActiveTab(item.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className={activeTab === item.id ? "text-[#6666FF]" : "text-gray-500"} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight size={16} className="opacity-50" />
                        </button>
                      </li>
                    );
                  })}
                  
                  <li className="mt-2 pt-2 border-t">
                    <Link href="/logout" className="w-full flex items-center px-4 py-3 rounded-md text-left text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={18} className="mr-3" />
                      <span>Sign Out</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Personal Information</h2>
                    {!isEditMode && (
                      <Button onClick={toggleEditMode} variant="outline" className="gap-2">
                        <Edit2 size={16} /> Edit Profile
                      </Button>
                    )}
                  </div>
                  
                  <UserInfo 
                    userData={userData}
                    isEditMode={isEditMode}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </div>
              )}
              
              {/* Appointments Tab */}
              {activeTab === "appointments" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Appointments</h2>
                    <Button className="gap-2">
                      <Calendar size={16} /> Book New Appointment
                    </Button>
                  </div>
                  
                  <AppointmentHistory appointments={appointments} />
                </div>
              )}
              
              {/* Medical Records Tab */}
              {activeTab === "records" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Medical Records</h2>
                  
                  <div className="border rounded-lg p-8 text-center">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-medium mb-2">Your Medical Records</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Access your medical history, test results, and treatment plans.
                      All your health documents are securely stored and available anytime.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button>View Health Records</Button>
                      <Button variant="outline">Upload New Document</Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Billing Tab */}
              {activeTab === "billing" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Billing & Insurance</h2>
                  <UserBilling />
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  <UserSettings />
                </div>
              )}
              
              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Preferences</h2>
                  <UserPreferences />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 