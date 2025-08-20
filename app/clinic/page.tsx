'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCachedAvailableClinics, RetainedClinic } from '@/lib/api/clinicService';

export default function ClinicSelectionPage() {
  const router = useRouter();
  const [clinics, setClinics] = useState<RetainedClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const availableClinics = await getCachedAvailableClinics();
        setClinics(availableClinics);
      } catch (error) {
        console.error('Failed to fetch available clinics:', error);
        setError('Failed to load available clinics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading available clinics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-red-600">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Clinics</h2>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>

          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Select a Clinic</h1>
          <p className="text-lg text-gray-600">
            Choose a clinic to manage payments and appointments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <Card key={clinic.slug} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{clinic.name}</CardTitle>
                  <Badge variant={clinic.isActive ? "default" : "secondary"}>
                    {clinic.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>
                  Manage {clinic.name.toLowerCase()} operations and payments
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">
                    Clinic ID: {clinic.slug}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => router.push(`/clinic/${clinic.slug}/payments`)}
                      className="flex-1"
                      disabled={!clinic.isActive}
                    >
                      View Payments
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/clinic/${clinic.slug}`)}
                      disabled={!clinic.isActive}
                    >
                      Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {clinics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Clinics Available</h3>
            <p className="text-gray-600">
              No clinics are currently available for access. Please contact your administrator.
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Showing {clinics.length} available clinics • Data driven by backend configuration</p>
        </div>
      </div>
    </div>
  );
}
