import React from 'react';
import { notFound } from 'next/navigation';
import { AlertCircle, User, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Server-side data fetchers
import { fetchClientsByClinic, fetchClinics, fetchClientStats } from '@/lib/server/data-fetchers';

// Client Components
import { ClientsHeader } from './_components/ClientsHeader';
import { ClientsStats } from './_components/ClientsStats';
import { ClientsTableWrapper } from './_components/ClientsTableWrapper';
import { ClientsPagination } from './_components/ClientsPagination';

interface PageProps {
  params: Promise<{
    clinic: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

/**
 * Server Component: Clients Page
 * 
 * Benefits:
 * - Server-Side Rendering (SSR)
 * - Automatic caching with Next.js
 * - Reduced client-side JavaScript
 * - Better SEO
 * - Faster initial page load
 */
export default async function ClientsPage({ params, searchParams }: PageProps) {
  // Await params and searchParams (Next.js 15 requirement)
  const { clinic } = await params;
  const { page: pageParam, search, status } = await searchParams;
  
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = 20;

  // Fetch clinic data to get display name and validate clinic exists
  let clinicData;
  try {
    const clinics = await fetchClinics({ revalidate: 3600 }); // Cache for 1 hour
    clinicData = clinics.find(c => c.name === clinic || c.backendName === clinic);
    
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

  // Fetch clinic-wide statistics (NOT affected by search/filters)
  let statsData;
  try {
    statsData = await fetchClientStats(backendClinicName, {
      revalidate: 600, // Cache stats for 10 minutes
      tags: ['client-stats', `clinic-${backendClinicName}`]
    });
  } catch (err) {
    console.error('Error fetching client statistics:', err);
    statsData = {
      totalClients: 0,
      activeClients: 0,
      newThisMonth: 0,
      clientsWithInsurance: 0
    };
  }

  // Fetch a small sample to count clients with email
  let emailSampleData;
  try {
    emailSampleData = await fetchClientsByClinic(backendClinicName, {
      page: 1,
      limit: 100, // Sample for email count estimate
      revalidate: 600,
      tags: ['client-email-stats', `clinic-${backendClinicName}`]
    });
  } catch (err) {
    console.error('Error fetching email statistics:', err);
    emailSampleData = { data: [], pagination: { total: 0 } };
  }

  // Calculate email stats from sample
  const sampleClients = emailSampleData.data;
  const sampleSize = sampleClients.length;
  const withEmailCount = sampleSize > 0
    ? Math.round((sampleClients.filter(c => c.email && c.email.trim()).length / sampleSize) * statsData.totalClients)
    : 0;
  
  const clientStats = {
    total: statsData.totalClients,
    active: statsData.activeClients,
    withEmail: withEmailCount,
    newThisMonth: statsData.newThisMonth
  };

  // Fetch filtered/paginated clients data for the table
  let clientsData;
  let error: string | null = null;
  
  try {
    clientsData = await fetchClientsByClinic(backendClinicName, {
      page: currentPage,
      limit: pageSize,
      search,
      status,
      revalidate: 300, // Cache for 5 minutes
      tags: ['clients', `clinic-${backendClinicName}`]
    });
  } catch (err) {
    console.error('Error fetching clients:', err);
    error = err instanceof Error ? err.message : 'Failed to fetch clients';
    clientsData = {
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

  const clients = clientsData.data;
  const pagination = clientsData.pagination;

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <ClientsHeader 
          clinicName={clinic}
          clinicDisplayName={clinicData.displayName || clinicData.name}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Clients</h2>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <ClientsHeader 
        clinicName={clinic}
        clinicDisplayName={clinicData.displayName || clinicData.name}
      />

      {/* Statistics Cards */}
      <ClientsStats stats={clientStats} />

      {/* Clients Table with integrated search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {search ? (
              <>Search Results ({pagination.total})</>
            ) : (
              <>All Clients ({pagination.total})</>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pagination.total === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {search ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                  <p className="text-gray-600 mb-4">
                    No clients match your search for &quot;{search}&quot;. Try adjusting your search terms.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // This will need to be a Client Component wrapper or form
                        window.location.href = `/clinic/${clinic}/clients`;
                      }}
                    >
                      Clear Search
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                  <p className="text-gray-600 mb-4">
                    Get started by adding your first client to this clinic.
                  </p>
                  <Button onClick={() => {
                    window.location.href = `/clinic/${clinic}/clients/new`;
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Client
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              <ClientsTableWrapper 
                clients={clients}
                clinicName={clinic}
                initialSearch={search || ''}
              />
              
              {/* Server-side Pagination Controls */}
              <ClientsPagination pagination={pagination} />
            </>
          )}
        </CardContent>
      </Card>
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
    const clinicData = clinics.find(c => c.name === clinic || c.backendName === clinic);
    
    if (clinicData) {
      return {
        title: `Clients - ${clinicData.displayName || clinicData.name}`,
        description: `Manage clients for ${clinicData.displayName || clinicData.name}`
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: 'Clients',
    description: 'Manage clinic clients'
  };
}
