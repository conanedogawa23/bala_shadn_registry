import React from 'react';
import { notFound } from 'next/navigation';
import { AlertCircle, User, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Server-side data fetchers
import { fetchClientsByClinic, fetchClinics } from '@/lib/server/data-fetchers';

// Client Components
import { ClientsHeader } from './_components/ClientsHeader';
import { ClientsStats } from './_components/ClientsStats';
import { ClientsTable } from './_components/ClientsTable';
import { ClientsPagination } from './_components/ClientsPagination';
import { ClientsSearchWrapper } from './_components/ClientsSearchWrapper';

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

  // Fetch clients data server-side
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

  // Calculate client statistics from current page data
  // For accurate "New This Month" stat, we'd need to fetch all clients or have a stats endpoint
  const clientStats = {
    total: pagination.total,
    active: clients.filter(c => (c.status || 'active') === 'active').length,
    withEmail: clients.filter(c => c.email && c.email.trim()).length,
    newThisMonth: 0 // TODO: Calculate from all clients or use stats endpoint
  };

  // Calculate "New This Month" from current page (approximation)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  clientStats.newThisMonth = clients.filter(client => {
    const dateToUse = client.createdAt || client.dateOfBirth;
    if (!dateToUse) return false;
    const clientDate = new Date(dateToUse);
    return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
  }).length;

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

      {/* Search Bar */}
      <div className="mb-6">
        <ClientsSearchWrapper initialSearch={search || ''} />
      </div>

      {/* Clients Table */}
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
              <ClientsTable 
                clients={clients}
                clinicName={clinic}
                searchValue={search || ''}
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
