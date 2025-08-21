"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table/Table";
import { ArrowLeft, Search, Plus, User, AlertCircle } from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { slugToClinic } from "@/lib/data/clinics";
import { generateLink } from "@/lib/route-utils";

// Import real API hooks
import { useClients } from "@/lib/hooks";

export default function ClinicOrdersNewPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 8;
  
  // Get clinic data for API calls
  const clinicData = useMemo(() => slugToClinic(clinic), [clinic]);
  
  // Fetch clients using real API
  const { 
    clients, 
    loading: isLoading, 
    error,
    refetch 
  } = useClients({
    clinicName: clinicData?.name || "",
    autoFetch: !!clinicData?.name
  });
  
  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    
    const query = searchQuery.toLowerCase();
    return clients.filter(client => {
      const clientName = client.firstName && client.lastName 
        ? `${client.firstName} ${client.lastName}` 
        : client.name || '';
      return clientName.toLowerCase().includes(query) ||
             (client.email && client.email.toLowerCase().includes(query));
    });
  }, [clients, searchQuery]);
  
  // Calculate pagination
  const totalFilteredClients = filteredClients.length;
  const totalPages = Math.ceil(totalFilteredClients / clientsPerPage);
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  
  // Navigation handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleBack = () => {
    router.push(generateLink('clinic', 'orders', clinic));
  };
  
  const handleCreateOrderForClient = (clientId: string | number) => {
    router.push(generateLink('clinic', `clients/${clientId}/orders/new`, clinic));
  };

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
            <div className="flex gap-2 justify-center">
              <Button onClick={handleBack} variant="outline">Back to Orders</Button>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to {clinicData.displayName || clinicData.name} Orders
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.primary }}>
            New Order - {clinicData.displayName || clinicData.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Select a client to create a new order for this clinic
          </p>
        </div>
      </div>

      {/* Search and Client Selection */}
      <Card className="shadow-md border-0">
        <CardHeader className="bg-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <User size={20} />
            Select Client ({clients.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="mb-6">
            <Label htmlFor="search" className="block mb-2">Search Clients:</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-2">
                Found {filteredClients.length} client(s) matching "{searchQuery}"
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Clients Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Information</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentClients.length > 0 ? (
                      currentClients.map((client) => {
                        const clientName = client.firstName && client.lastName 
                          ? `${client.firstName} ${client.lastName}` 
                          : client.name || 'Unknown Client';
                        
                        return (
                          <TableRow key={client.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <div className="font-medium">{clientName}</div>
                                {client.gender && client.dateOfBirth && (
                                  <div className="text-sm text-gray-500">
                                    {client.gender} • Born {new Date(client.dateOfBirth).getFullYear()}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {client.email && (
                                  <div className="truncate max-w-48">{client.email}</div>
                                )}
                                {client.phone && (
                                  <div className="text-gray-500">{client.phone}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm"
                                onClick={() => handleCreateOrderForClient(client.id)}
                                className="flex items-center gap-2"
                              >
                                <Plus size={14} />
                                Create Order
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <User className="h-8 w-8 text-gray-400" />
                            <p className="text-gray-500">
                              {searchQuery ? "No clients found matching your search" : "No clients available"}
                            </p>
                            {!searchQuery && (
                              <Button 
                                variant="outline" 
                                onClick={() => router.push(generateLink('clinic', 'clients/new', clinic))}
                                className="mt-2"
                              >
                                <Plus size={16} className="mr-2" />
                                Add First Client
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstClient + 1} to {Math.min(indexOfLastClient, totalFilteredClients)} of {totalFilteredClients} clients
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const middlePoint = Math.min(Math.max(currentPage, 3), totalPages - 2);
                        pageNum = middlePoint - 2 + i;
                      }
                      
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
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

      {/* Quick Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Need to add a new client?</h3>
                <p className="text-sm text-gray-600">Create a client profile first, then come back to create an order.</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => router.push(generateLink('clinic', 'clients/new', clinic))}
              >
                <Plus size={16} className="mr-2" />
                Add Client
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 