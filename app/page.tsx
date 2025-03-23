"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  ArrowRight,
  CreditCard
} from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { useAuth } from "@/lib/auth";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Here&apos;s an overview of your business.
          </p>
        </div>
        <div className="flex gap-3 self-start">
          <Link
            href="/login"
            className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 ${isAuthenticated ? 'hidden' : ''}`}
          >
            Login
          </Link>
          <Link
            href="/register"
            className={`inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow transition-colors hover:bg-secondary/90 ${isAuthenticated ? 'hidden' : ''}`}
          >
            Register
          </Link>
        </div>
      </div>
      
      {isAuthenticated ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-slate-50 pb-3 pt-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Users size={16} /> Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="text-2xl font-bold">352</div>
                <p className="text-gray-600 text-sm mt-1">Total registered clients</p>
              </CardContent>
              <CardFooter className="border-t py-3">
                <Link href="/clients" className="w-full">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-between">
                    View all clients
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-slate-50 pb-3 pt-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <ShoppingBag size={16} /> Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="text-2xl font-bold">125</div>
                <p className="text-gray-600 text-sm mt-1">Orders this month</p>
              </CardContent>
              <CardFooter className="border-t py-3">
                <Link href="/orders" className="w-full">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-between">
                    View all orders
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-slate-50 pb-3 pt-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CreditCard size={16} /> Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="text-2xl font-bold">$24,350</div>
                <p className="text-gray-600 text-sm mt-1">Monthly revenue</p>
              </CardContent>
              <CardFooter className="border-t py-3">
                <Link href="/payments" className="w-full">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-between">
                    View payments
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-slate-50 pb-3 pt-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <TrendingUp size={16} /> Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="text-2xl font-bold">6</div>
                <p className="text-gray-600 text-sm mt-1">Available reports</p>
              </CardContent>
              <CardFooter className="border-t py-3">
                <Link href="/reports" className="w-full">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-between">
                    View reports
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm border border-gray-200 lg:col-span-1">
              <CardHeader className="bg-slate-50 pb-3 pt-4">
                <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <div className="grid gap-3">
                  <Link href="/clients/new">
                    <Button variant="secondary" size="sm" className="w-full justify-start text-sm h-10">
                      <Users size={14} className="mr-2" /> Add New Client
                    </Button>
                  </Link>
                  <Link href="/orders/new">
                    <Button variant="secondary" size="sm" className="w-full justify-start text-sm h-10">
                      <ShoppingBag size={14} className="mr-2" /> Create New Order
                    </Button>
                  </Link>
                  <Link href="/payments/new">
                    <Button variant="secondary" size="sm" className="w-full justify-start text-sm h-10">
                      <CreditCard size={14} className="mr-2" /> Record Payment
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="secondary" size="sm" className="w-full justify-start text-sm h-10">
                      <TrendingUp size={14} className="mr-2" /> Generate Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-gray-200 lg:col-span-2">
              <CardHeader className="bg-slate-50 pb-3 pt-4">
                <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-4 pb-0">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-slate-100 p-2 rounded-full mt-0.5">
                      <ShoppingBag size={14} className="text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">New order created</h3>
                      <p className="text-xs text-gray-600">Order #SH90136 for JOHNSON, MARY</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-slate-100 p-2 rounded-full mt-0.5">
                      <Users size={14} className="text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">New client registered</h3>
                      <p className="text-xs text-gray-600">WILSON, LINDA added to the system</p>
                      <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-slate-100 p-2 rounded-full mt-0.5">
                      <CreditCard size={14} className="text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Payment received</h3>
                      <p className="text-xs text-gray-600">$120.50 payment for Order #SH90133</p>
                      <p className="text-xs text-gray-500 mt-1">Yesterday at 2:15 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-4">
                    <div className="bg-slate-100 p-2 rounded-full mt-0.5">
                      <ShoppingBag size={14} className="text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Order status updated</h3>
                      <p className="text-xs text-gray-600">Order #SH90130 marked as completed</p>
                      <p className="text-xs text-gray-500 mt-1">Yesterday at 11:45 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t py-3">
                <Link href="/activity" className="w-full">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-between">
                    View all activity
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </>
      ) : (
        <div className="mt-16 mb-16 flex flex-col items-center justify-center text-center">
          <h2 className="mb-6 text-2xl font-bold">Welcome to Body Bliss Management System</h2>
          <p className="max-w-md text-muted-foreground mb-8">
            Please log in or register to access the full functionality of the dashboard.
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground shadow transition-colors hover:bg-secondary/90"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
