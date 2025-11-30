import React from 'react';
import { notFound } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

// Server-side data fetchers
import { fetchPaymentsByClinic, fetchClinics } from '@/lib/server/data-fetchers';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

// Client Components
import { PaymentsHeader } from './_components/PaymentsHeader';
import { PaymentsTable } from './_components/PaymentsTable';

interface PageProps {
  params: Promise<{
    clinic: string;
  }>;
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

/**
 * Server Component: Payments Page
 * 
 * Benefits:
 * - Server-Side Rendering (SSR)
 * - Automatic caching with Next.js
 * - Reduced client-side JavaScript
 * - Better SEO
 * - Faster initial page load
 */
export default async function PaymentsPage({ params, searchParams }: PageProps) {
  // Await params and searchParams (Next.js 15 requirement)
  const { clinic } = await params;
  const { page: pageParam, status } = await searchParams;
  
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = 20;

  // Fetch clinic data to get display name and validate clinic exists
  let clinicData;
  try {
    const clinics = await fetchClinics({ revalidate: 3600 }); // Cache for 1 hour
    // Use case-insensitive matching to handle URL slug variations
    const clinicLower = clinic.toLowerCase();
    clinicData = clinics.find(c => 
      c.name?.toLowerCase() === clinicLower || 
      c.backendName?.toLowerCase() === clinicLower ||
      c.displayName?.toLowerCase().replace(/\s+/g, '') === clinicLower
    );
    
    if (!clinicData) {
      notFound(); // Returns 404 if clinic doesn't exist
    }
  } catch (error) {
    console.error('Error fetching clinic data:', error);
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Clinic</h2>
            <p className="text-gray-600">Unable to load clinic information.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the proper backend clinic name for API calls
  const backendClinicName = clinicData.backendName || clinicData.name.toLowerCase().replace(/\s+/g, '');

  // Fetch payments data server-side
  let paymentsData;
  let error: string | null = null;
  
  try {
    paymentsData = await fetchPaymentsByClinic(backendClinicName, {
      page: currentPage,
      limit: pageSize,
      status,
      revalidate: 0, // No caching - always fetch fresh data
      tags: ['payments', `clinic-${backendClinicName}`]
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    error = err instanceof Error ? err.message : 'Failed to fetch payments';
    paymentsData = {
      data: [],
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  const payments = paymentsData.data;

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <PaymentsHeader 
          clinicName={clinic}
          clinicDisplayName={clinicData.displayName || clinicData.name}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payments</h2>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <PaymentsHeader 
        clinicName={clinic}
        clinicDisplayName={clinicData.displayName || clinicData.name}
      />
      
      {/* Payments Table/Grid */}
      {payments.length > 0 ? (
        <PaymentsTable 
          payments={payments}
          clinicName={clinic}
        />
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600">
            No payments have been recorded for this clinic yet.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Generate metadata for the page (SEO)
 */
export async function generateMetadata({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  
  try {
    const clinics = await fetchClinics({ revalidate: 3600 });
    // Use case-insensitive matching for metadata generation
    const clinicLower = clinic.toLowerCase();
    const clinicData = clinics.find(c => 
      c.name?.toLowerCase() === clinicLower || 
      c.backendName?.toLowerCase() === clinicLower ||
      c.displayName?.toLowerCase().replace(/\s+/g, '') === clinicLower
    );
    
    if (clinicData) {
      return {
        title: `Payments - ${clinicData.displayName || clinicData.name}`,
        description: `Manage payments for ${clinicData.displayName || clinicData.name}`
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: 'Payments',
    description: 'Manage clinic payments'
  };
}
