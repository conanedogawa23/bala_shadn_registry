"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
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

export default function NewOrderPage() {
  const router = useRouter();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 8;
  
  // Mock clients data - in a real app, this would be fetched from an API
  const [clients, setClients] = useState<Client[]>([]);
  
  useEffect(() => {
    // Simulate API call to fetch clients
    const fetchClients = async () => {
      try {
        // Wait for 500ms to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockClients = [
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
          },
          {
            id: "45678901",
            name: "WILLIAMS, ROBERT",
            phone: "416-555-4567",
            email: "r.williams@email.com"
          },
          {
            id: "56789012",
            name: "BROWN, PATRICIA",
            phone: "416-555-5678",
            email: "p.brown@email.com"
          },
          {
            id: "67890123",
            name: "ANDERSON, JENNIFER",
            phone: "416-555-6789",
            email: "j.anderson@email.com"
          },
          {
            id: "78901234",
            name: "TAYLOR, MICHAEL",
            phone: "416-555-7890",
            email: "m.taylor@email.com"
          },
          {
            id: "89012345",
            name: "WILSON, LINDA",
            phone: "416-555-8901",
            email: "l.wilson@email.com"
          },
          {
            id: "90123456",
            name: "MILLER, JAMES",
            phone: "416-555-9012",
            email: "j.miller@email.com"
          },
          {
            id: "01234567",
            name: "CLARK, SUSAN",
            phone: "416-555-0123",
            email: "s.clark@email.com"
          }
        ];
        
        setClients(mockClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);
  
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
    router.back();
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
          Back to Orders
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.primary }}>
            Create New Order
          </h1>
          <p className="text-gray-600 mt-2">
            Select a client to create a new order
          </p>
        </div>
      </div>
      
      {/* Search */}
      <Card className="shadow-md border-0 mb-8">
        <CardHeader className="bg-slate-100">
          <CardTitle className="text-lg">Search Client</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            <Label htmlFor="clientSearch" className="sr-only">Search Clients</Label>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="clientSearch"
              placeholder="Search by client name, phone, or email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on new search
              }}
            />
          </div>
          <div className="flex items-center justify-end mt-2">
            <span className="text-sm text-gray-500">
              {filteredClients.length} clients found
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Clients Table */}
      <Card className="shadow-md border-0">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        Client Name
                      </div>
                    </TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentClients.length > 0 ? (
                    currentClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            className="flex items-center gap-1"
                            size="sm"
                            onClick={() => handleCreateOrderForClient(client.id)}
                          >
                            <Plus size={14} />
                            Create Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={4} 
                        className="text-center py-8 text-gray-500"
                      >
                        {searchQuery ? "No clients match your search criteria" : "No clients found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex gap-1" aria-label="Pagination">
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
                  </nav>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 