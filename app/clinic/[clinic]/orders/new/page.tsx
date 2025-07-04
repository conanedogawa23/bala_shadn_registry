"use client";

import React, { useState } from "react";
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
import { ArrowLeft, Search, Plus, User } from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export default function ClinicOrdersNewPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 8;
  
  // Mock clients data filtered by clinic - in a real app, this would be fetched from an API
  const [clients] = useState<Client[]>([
    {
      id: "21770481",
      name: "HEALTH BIOFORM",
      phone: "905-670-0204",
      email: "info@healthbioform.com"
    },
    {
      id: "16883465",
      name: "ROBINSON, DAVID",
      phone: "416-555-1234",
      email: "d.robinson@email.com"
    },
    {
      id: "23456789",
      name: "SMITH, JOHN",
      phone: "416-555-2345",
      email: "j.smith@email.com"
    },
    {
      id: "34567890",
      name: "JOHNSON, MARY",
      phone: "416-555-3456",
      email: "m.johnson@email.com"
    }
  ]);
  
  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.phone.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  });
  
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
    router.push(`/clinic/${clinic}/orders`);
  };
  
  const handleCreateOrderForClient = (clientId: string) => {
    router.push(`/clients/${clientId}/orders/create`);
  };

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
          Back to {clinic} Orders
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.primary }}>
            New Order - {clinic}
          </h1>
          <p className="text-gray-600 mt-2">
            Select a client to create a new order for this clinic
          </p>
        </div>
      </div>

      {/* Search and Client Selection */}
      <Card className="shadow-md border-0">
        <CardHeader className="bg-slate-100">
          <CardTitle className="text-lg">Select Client</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="mb-6">
            <Label htmlFor="search" className="block mb-2">Search Clients:</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Search by name, phone, or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Clients Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentClients.length > 0 ? (
                      currentClients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.phone}</TableCell>
                          <TableCell>{client.email}</TableCell>
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          {searchQuery ? "No clients found matching your search" : "No clients available"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`w-8 h-8 p-0 ${currentPage === page ? 'bg-primary text-white' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                             )}
         </CardContent>
       </Card>

      {/* Quick Actions */}
      <Card className="shadow-md border-0 mt-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/clients')}
              className="flex items-center gap-2"
            >
              <User size={16} />
              Add New Client
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/clinic/${clinic}/clients`)}
              className="flex items-center gap-2"
            >
              <User size={16} />
              Manage {clinic} Clients
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 