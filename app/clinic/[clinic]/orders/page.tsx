import React from 'react';
import { notFound } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Server-side data fetchers
import { fetchOrdersByClinic, fetchClinics } from '@/lib/server/data-fetchers';

// Client Components
import { OrdersHeader } from './_components/OrdersHeader';
import { OrdersSearch } from './_components/OrdersSearch';
import { OrdersTable } from './_components/OrdersTable';
import { OrdersPagination } from './_components/OrdersPagination';

interface PageProps {
  params: Promise<{
    clinic: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

/**
 * Server Component: Orders Page
 * 
 * Benefits:
 * - Server-Side Rendering (SSR)
 * - Automatic caching with Next.js
 * - Reduced client-side JavaScript
 * - Better SEO
 * - Faster initial page load
 */
export default async function OrdersPage({ params, searchParams }: PageProps) {
  // Await params and searchParams (Next.js 15 requirement)
  const { clinic } = await params;
  const { page: pageParam, search } = await searchParams;
  
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = 10;

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

  // Fetch orders data server-side
  let ordersData;
  let error: string | null = null;
  
  try {
    ordersData = await fetchOrdersByClinic(backendClinicName, {
      page: currentPage,
      limit: pageSize,
      search,
      revalidate: 180, // Cache for 3 minutes
      tags: ['orders', `clinic-${backendClinicName}`]
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    error = err instanceof Error ? err.message : 'Failed to fetch orders';
    ordersData = {
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

  const orders = ordersData.data;
  const pagination = {
    page: ordersData.pagination.page,
    limit: ordersData.pagination.limit,
    total: ordersData.pagination.total,
    totalPages: ordersData.pagination.pages
  };

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <OrdersHeader 
          clinicName={clinic}
          clinicDisplayName={clinicData.displayName || clinicData.name}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <OrdersHeader 
        clinicName={clinic}
        clinicDisplayName={clinicData.displayName || clinicData.name}
      />
      
      {/* Search */}
      <OrdersSearch 
        initialSearch={search || ''}
        totalOrders={pagination.total}
      />
      
      {/* Orders Table */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <OrdersTable 
            orders={orders}
            clinicName={clinic}
          />
          
          {/* Server-side Pagination */}
          <OrdersPagination pagination={pagination} />
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
    // Use case-insensitive matching for metadata generation
    const clinicLower = clinic.toLowerCase();
    const clinicData = clinics.find(c => 
      c.name?.toLowerCase() === clinicLower || 
      c.backendName?.toLowerCase() === clinicLower ||
      c.displayName?.toLowerCase().replace(/\s+/g, '') === clinicLower
    );
    
    if (clinicData) {
      return {
        title: `Orders - ${clinicData.displayName || clinicData.name}`,
        description: `Manage orders for ${clinicData.displayName || clinicData.name}`
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: 'Orders',
    description: 'Manage clinic orders'
  };
}
