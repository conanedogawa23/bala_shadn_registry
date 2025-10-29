'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import InvalidClinicError from '@/components/error/invalid-clinic-error';
import { generateLink } from '@/lib/route-utils';
import { useClinic } from '@/lib/contexts/clinic-context';

const formatNumber = (num: number = 0): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export default function ClinicPage() {
  const params = useParams();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;
  const { availableClinics, loading, error } = useClinic();
  
  // Find clinic from dynamic data
  const clinic = availableClinics.find(c => c.name === clinicSlug);

  // Handle loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !clinic) {
    return <InvalidClinicError clinicSlug={clinicSlug} />;
  }

  const quickActions = [
    {
      title: 'Clients',
      href: generateLink('clinic', 'clients', clinicSlug),
      icon: Users,
      description: 'Manage client records',
      count: formatNumber(clinic.clientCount ?? 0),
      disabled: clinic.status === 'no-data',
    },
    {
      title: 'Appointments',
      href: generateLink('clinic', 'appointments', clinicSlug),
      icon: Calendar,
      description: 'Schedule appointments',
      count: formatNumber(clinic.totalAppointments ?? 0),
      disabled: clinic.status === 'no-data',
    },
    {
      title: 'Orders',
      href: generateLink('clinic', 'orders', clinicSlug),
      icon: TrendingUp,
      description: 'Process orders',
      count: formatNumber(clinic.totalOrders ?? 0),
      disabled: clinic.status === 'no-data',
    },
    {
      title: 'Reports',
      href: generateLink('clinic', 'reports', clinicSlug),
      icon: Activity,
      description: 'View analytics',
      count: clinic.status === 'active' ? '12' : '0',
      disabled: clinic.status === 'no-data',
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">

      {/* Status Messages */}
      {clinic.status !== 'active' && (
        <Card className={cn(
          "border-l-4",
          clinic.status === 'no-data' && "border-l-blue-500 bg-blue-50/50",
          clinic.status === 'inactive' && "border-l-gray-500 bg-gray-50/50",
          clinic.status === 'historical' && "border-l-orange-500 bg-orange-50/50"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {clinic.status === 'no-data' && <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />}
              {clinic.status === 'inactive' && <Clock className="h-5 w-5 text-gray-600 mt-0.5" />}
              {clinic.status === 'historical' && <Clock className="h-5 w-5 text-orange-600 mt-0.5" />}
              <div>
                <h3 className="font-medium mb-1">
                  {clinic.status === 'no-data' && 'Clinic Setup in Progress'}
                  {clinic.status === 'inactive' && 'Inactive Clinic'}
                  {clinic.status === 'historical' && 'Recently Inactive'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {clinic.status === 'no-data' && 'This clinic is being configured. Some features may not be available yet.'}
                  {clinic.status === 'inactive' && `This clinic has been inactive since ${clinic.lastActivity}. Data is available in read-only mode.`}
                  {clinic.status === 'historical' && `Operations stopped on ${clinic.lastActivity}. All data is available for review.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className={cn(
                "group transition-all duration-200 hover:shadow-md",
                action.disabled ? "opacity-60" : "hover:bg-accent/5 cursor-pointer"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <action.icon className={cn(
                    "h-8 w-8",
                    action.disabled ? "text-muted-foreground" : "text-primary"
                  )} />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{action.count}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>

                {!action.disabled ? (
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    <Link href={action.href} className="flex items-center justify-center gap-2">
                      Open <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4" 
                    disabled
                  >
                    Not Available
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Clinic Summary */}
      {clinic.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Clinic Overview
            </CardTitle>
            <CardDescription>
              {clinic.description || 'Active physiotherapy clinic providing comprehensive rehabilitation services'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{formatNumber(clinic.clientCount ?? 0)}</div>
                <div className="text-sm text-green-600">Active Clients</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{formatNumber(clinic.totalAppointments ?? 0)}</div>
                <div className="text-sm text-blue-600">Total Appointments</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">15+</div>
                <div className="text-sm text-purple-600">Years Operating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 