'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Eye,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useClinic } from '@/lib/contexts/clinic-context';

// Import real API hooks
import { useClients, Client } from '@/lib/hooks';

const themeColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

export default function ClientsPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // State for fetching ALL clients for proper statistics calculation
  const [allClients, setAllClients] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Get clinic data from context (API-provided with correct backendName)
  const { availableClinics } = useClinic();
  const clinicData = useMemo(() => {
    return availableClinics.find(c => c.name === clinic);
  }, [clinic, availableClinics]);
  
  // Get the proper backend clinic name for API calls
  // MongoDB expects lowercase names (e.g., 'bodyblissphysio' not 'BodyBlissPhysio')
  const backendClinicName = useMemo(() => {
    const name = clinicData?.backendName || clinicData?.name || "";
    return name.toLowerCase().replace(/\s+/g, '');
  }, [clinicData]);

  // Debounce search query for server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to page 1 when search changes to avoid empty results
      if (searchQuery !== debouncedSearchQuery) {
        setCurrentPage(1);
      }
    }, 500); // 500ms debounce for server calls

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);
  
  // Fetch clients using real API with pagination and server-side search
  const { 
    clients: rawClients, 
    loading: isLoading, 
    error,
    pagination,
    refetch 
  } = useClients({
    clinicName: backendClinicName,
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchQuery || undefined, // Pass search query to API
    autoFetch: !!backendClinicName
  });

  // Ensure clients is always an array for safe operations
  const clients = rawClients || [];

  // Fetch ALL clients for proper statistics calculation using pagination
  useEffect(() => {
    if (backendClinicName) {
      const fetchAllClientsForStats = async () => {
        setStatsLoading(true);
        try {
          const allClientsData: any[] = [];
          const maxLimit = 100; // API limit
          let currentPage = 1;
          let hasMore = true;

          // Check first 10 pages for recent clients
          const maxPages = 10;
          
          while (hasMore && currentPage <= maxPages) {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/clients/clinic/${backendClinicName}/frontend-compatible?page=${currentPage}&limit=${maxLimit}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data && data.data.length > 0) {
                allClientsData.push(...data.data);
                hasMore = data.pagination?.hasNext || false && currentPage < maxPages;
                currentPage++;
              } else {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
          }
          
          setAllClients(allClientsData);
        } catch (error) {
          setAllClients([]);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchAllClientsForStats();
    }
  }, [backendClinicName]);

  // Calculate client statistics efficiently in a single pass
  const clientStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Use pagination total for the overall count, calculate others from current page
    const pageStats = clients.reduce((stats, client) => {
      // Count active clients on current page
      if ((client.status || 'active') === 'active') {
        stats.active++;
      }
      
      // Count clients with email on current page
      if (client.email && client.email.trim()) {
        stats.withEmail++;
      }
      
      return stats;
    }, {
      active: 0,
      withEmail: 0,
      newThisMonth: 0
    });

    // Calculate "New This Month" from ALL clients, not just current page
    const newThisMonth = allClients.filter(client => {
      const dateToUse = client.createdAt || client.dateOfBirth;
      if (!dateToUse) return false;
      const clientDate = new Date(dateToUse);
      return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
    }).length;

    return {
      total: pagination?.total || clients.length, // Use server total, fallback to current page
      active: pageStats.active,
      withEmail: pageStats.withEmail,
      newThisMonth: newThisMonth // Now calculated from all clients
    };
  }, [clients, pagination?.total, allClients]);

  const handleViewClient = useCallback((clientId: string | number) => {
    router.push(`/clinic/${clinic}/clients/${clientId}`);
  }, [router, clinic]);

  const handleEditClient = useCallback((clientId: string | number) => {
    router.push(`/clinic/${clinic}/clients/${clientId}/edit`);
  }, [router, clinic]);

  const handleAddClient = () => {
    router.push(`/clinic/${clinic}/clients/new`);
  };

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (pagination?.hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  }, [pagination?.hasPrev]);

  const handleNextPage = useCallback(() => {
    if (pagination?.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination?.hasNext]);

  // Search handler for server-side search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Define columns for DataTable
  const columns: ColumnDef<Client>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Client",
      cell: ({ row }) => {
        const client = row.original;
        const clientName = client.firstName && client.lastName 
          ? `${client.firstName} ${client.lastName}` 
          : client.name || 'Unknown';
        const firstLetter = clientName.charAt(0).toUpperCase();
        
        return (
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: themeColors.primary }}
            >
              {firstLetter}
            </div>
            <div>
              <div className="font-medium">{clientName}</div>
              <div className="text-sm text-gray-600">
                Age {calculateAge(client.dateOfBirth)} • {client.gender || 'N/A'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              {client.email || 'Not provided'}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              {client.phone || 'Not provided'}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const client = row.original;
        // Use client status if available, otherwise default to 'active'
        const status = client.status || 'active';
        return (
          <Badge variant="secondary" className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "lastVisit",
      header: "Last Visit",
      cell: ({ row }) => {
        const client = row.original;
        // Use updatedAt or createdAt as last visit date
        const lastVisit = client.updatedAt || client.createdAt;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            {formatDate(lastVisit)}
          </div>
        );
      },
    },
    {
      accessorKey: "nextAppointment",
      header: "Next Appointment",
      cell: () => {
        // This would need to be fetched from appointments data
        // For now, we'll show placeholder
        return (
          <span className="text-sm text-gray-400">Check appointments</span>
        );
      },
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      cell: () => {
        // This would need to be calculated from orders data
        // For now, show placeholder
        return <span className="text-sm font-medium">-</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewClient(client.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditClient(client.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [handleEditClient, handleViewClient]);

  // Handle clinic not found
  if (!clinicData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Clinic Not Found</h2>
            <p className="text-gray-600">The requested clinic could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Clients</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Clients - {clinicData.displayName || clinicData.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all clients for this clinic
          </p>
        </div>
        
        <Button 
          onClick={handleAddClient}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Client
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold">{clientStats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold">{clientStats.active}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold">{clientStats.newThisMonth}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">With Email</p>
              <p className="text-2xl font-bold">{clientStats.withEmail}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {debouncedSearchQuery ? (
              <>Search Results ({clientStats.total})</>
            ) : (
              <>All Clients ({clientStats.total})</>
            )}
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2"></div>
            )}
            {searchQuery !== debouncedSearchQuery && searchQuery && (
              <div className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                Searching...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientStats.total === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {debouncedSearchQuery ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                  <p className="text-gray-600 mb-4">
                    No clients match your search for "{debouncedSearchQuery}". Try adjusting your search terms.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setDebouncedSearchQuery('');
                      }}
                    >
                      Clear Search
                    </Button>
                    <Button onClick={handleAddClient}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Client
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                  <p className="text-gray-600 mb-4">
                    Get started by adding your first client to this clinic.
                  </p>
                  <Button onClick={handleAddClient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Client
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              <DataTable 
                columns={columns} 
                data={clients}
                filterPlaceholder="Search clients by name, email, or phone..."
                searchValue={searchQuery}
                onSearchChange={handleSearchChange}
                showPagination={false}
              />
              
              {/* Server-side Pagination Controls */}
              {pagination && pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t gap-4">
                  <div className="text-sm text-gray-700 order-2 sm:order-1">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} clients
                  </div>
                  
                  <div className="flex items-center space-x-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1.5 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    
                    {/* Smart Page numbers with ellipsis */}
                    <div className="flex items-center space-x-1">
                      {/* First page */}
                      {pagination.page > 3 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            className="w-8 h-8 p-0 text-xs sm:text-sm"
                          >
                            1
                          </Button>
                          {pagination.page > 4 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                        </>
                      )}
                      
                      {/* Pages around current page */}
                      {Array.from({ length: 5 }, (_, i) => {
                        const pageNum = pagination.page - 2 + i;
                        if (pageNum < 1 || pageNum > pagination.pages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0 text-xs sm:text-sm"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      {/* Last page */}
                      {pagination.page < pagination.pages - 2 && (
                        <>
                          {pagination.page < pagination.pages - 3 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.pages)}
                            className="w-8 h-8 p-0 text-xs sm:text-sm"
                          >
                            {pagination.pages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1.5 text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
