"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  Settings,
  Filter,
  ArrowDownUp,
  RefreshCw
} from "lucide-react";
import { activityData } from "@/lib/mock-data";

export default function ActivityPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // If not authenticated, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call to refresh data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Map icon strings to icon components
  const getIconComponent = (iconName: string, size = 16) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag size={size} className="text-slate-600" />;
      case 'Users':
        return <Users size={size} className="text-slate-600" />;
      case 'CreditCard':
        return <CreditCard size={size} className="text-slate-600" />;
      case 'Settings':
        return <Settings size={size} className="text-slate-600" />;
      case 'Calendar':
        return <Calendar size={size} className="text-slate-600" />;
      default:
        return <ShoppingBag size={size} className="text-slate-600" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Activity Log</h1>
          <p className="text-gray-600 mt-1">View all system activity and actions</p>
        </div>
        <div className="flex gap-2 self-stretch sm:self-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter size={14} />
            Filter
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <ArrowDownUp size={14} />
            Sort
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="pt-6 pb-4">
              <div className="space-y-6">
                {activityData.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                    <div className="bg-slate-100 p-2 rounded-full mt-0.5">
                      {getIconComponent(activity.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <h3 className="text-sm font-medium">{activity.title}</h3>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex gap-2">
                          {activity.type === 'order' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-8 px-2"
                              onClick={() => router.push(`/orders/${activity.id}`)}
                            >
                              View Order
                            </Button>
                          )}
                          {activity.type === 'client' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-8 px-2"
                              onClick={() => router.push(`/clients/${activity.id}`)}
                            >
                              View Client
                            </Button>
                          )}
                          {activity.type === 'payment' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-8 px-2"
                              onClick={() => router.push(`/payments/${activity.id}`)}
                            >
                              View Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t py-4">
              <div className="text-sm text-gray-500">Showing 10 of 124 activities</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="pt-6 pb-4">
              <div className="space-y-6">
                {activityData
                  .filter(activity => activity.type === 'order')
                  .map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                      <div className="bg-slate-100 p-2 rounded-full mt-0.5">
                        {getIconComponent(activity.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="text-sm font-medium">{activity.title}</h3>
                            <p className="text-xs text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-8 px-2"
                              onClick={() => router.push(`/orders/${activity.id}`)}
                            >
                              View Order
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t py-4">
              <div className="text-sm text-gray-500">Showing {activityData.filter(a => a.type === 'order').length} of 45 activities</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-4">
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="pt-6 pb-4">
              <div className="space-y-6">
                {activityData
                  .filter(activity => activity.type === 'client')
                  .map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                      <div className="bg-slate-100 p-2 rounded-full mt-0.5">
                        {getIconComponent(activity.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="text-sm font-medium">{activity.title}</h3>
                            <p className="text-xs text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-8 px-2"
                              onClick={() => router.push(`/clients/${activity.id}`)}
                            >
                              View Client
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t py-4">
              <div className="text-sm text-gray-500">Showing {activityData.filter(a => a.type === 'client').length} of 32 activities</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="pt-6 pb-4">
              <div className="space-y-6">
                {activityData
                  .filter(activity => activity.type === 'payment')
                  .map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                      <div className="bg-slate-100 p-2 rounded-full mt-0.5">
                        {getIconComponent(activity.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="text-sm font-medium">{activity.title}</h3>
                            <p className="text-xs text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-8 px-2"
                              onClick={() => router.push(`/payments/${activity.id}`)}
                            >
                              View Payment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t py-4">
              <div className="text-sm text-gray-500">Showing {activityData.filter(a => a.type === 'payment').length} of 29 activities</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="pt-6 pb-4">
              <div className="space-y-6">
                {activityData
                  .filter(activity => activity.type === 'settings')
                  .map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                      <div className="bg-slate-100 p-2 rounded-full mt-0.5">
                        {getIconComponent(activity.icon)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{activity.title}</h3>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t py-4">
              <div className="text-sm text-gray-500">Showing {activityData.filter(a => a.type === 'settings').length} of 18 activities</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 