"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Eye, FileEdit, Trash2 } from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

// Mock data for client list
const mockClients = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "(555) 123-4567",
    dateOfBirth: "1985-04-12",
    lastVisit: "2023-10-15",
    status: "active",
  },
  {
    id: "2",
    name: "Michael Smith",
    email: "michael.smith@example.com",
    phone: "(555) 987-6543",
    dateOfBirth: "1978-09-23",
    lastVisit: "2023-11-02",
    status: "active",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "(555) 456-7890",
    dateOfBirth: "1992-06-18",
    lastVisit: "2023-09-30",
    status: "inactive",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.wilson@example.com",
    phone: "(555) 321-9876",
    dateOfBirth: "1982-12-05",
    lastVisit: "2023-10-22",
    status: "active",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    email: "lisa.thompson@example.com",
    phone: "(555) 654-3210",
    dateOfBirth: "1990-03-28",
    lastVisit: "2023-08-15",
    status: "inactive",
  },
  {
    id: "6",
    name: "Robert Garcia",
    email: "robert.garcia@example.com",
    phone: "(555) 789-0123",
    dateOfBirth: "1975-07-17",
    lastVisit: "2023-11-10",
    status: "active",
  },
  {
    id: "7",
    name: "Jennifer Martinez",
    email: "jennifer.martinez@example.com",
    phone: "(555) 234-5678",
    dateOfBirth: "1988-01-09",
    lastVisit: "2023-09-05",
    status: "active",
  },
  {
    id: "8",
    name: "David Anderson",
    email: "david.anderson@example.com",
    phone: "(555) 876-5432",
    dateOfBirth: "1969-11-22",
    lastVisit: "2023-10-05",
    status: "active",
  },
  {
    id: "9",
    name: "Amanda Taylor",
    email: "amanda.taylor@example.com",
    phone: "(555) 765-4321",
    dateOfBirth: "1995-02-14",
    lastVisit: "2023-07-20",
    status: "inactive",
  },
  {
    id: "10",
    name: "Brian Moore",
    email: "brian.moore@example.com",
    phone: "(555) 543-2109",
    dateOfBirth: "1980-08-30",
    lastVisit: "2023-11-01",
    status: "active",
  },
];

export default function AllClientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(5);
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  // Filter clients based on search query and status
  const filteredClients = React.useMemo(() => {
    return mockClients.filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery);
        
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);
  
  // Calculate pagination
  const indexOfLastClient = currentPage * itemsPerPage;
  const indexOfFirstClient = indexOfLastClient - itemsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  
  // Navigate to client detail page
  const handleViewClient = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Calculate days since last visit
  const daysSinceLastVisit = (lastVisitDate: string) => {
    const lastVisit = new Date(lastVisitDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.primary }}>All Clients</h1>
          <p className="text-gray-500 mt-1">Manage and view all client records</p>
        </div>
        
        <Button 
          className="flex items-center gap-2"
          style={{ 
            background: themeColors.gradient.primary,
            boxShadow: themeColors.shadow.button
          }}
          onClick={() => router.push("/clients")}
        >
          <UserPlus size={16} />
          New Client
        </Button>
      </div>
      
      <Card className="shadow-lg border-0 mb-6" style={{ boxShadow: themeColors.shadow.medium }}>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find clients by name, email, or phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange("all")}
                className="min-w-[80px]"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange("active")}
                className="min-w-[80px]"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange("inactive")}
                className="min-w-[80px]"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-0" style={{ boxShadow: themeColors.shadow.large }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentClients.length > 0 ? (
                  currentClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{client.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{client.email}</div>
                        <div className="text-sm text-gray-500">{client.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(client.dateOfBirth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{formatDate(client.lastVisit)}</div>
                        <div className="text-xs text-gray-500">
                          {daysSinceLastVisit(client.lastVisit)} days ago
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={client.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {client.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewClient(client.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewClient(client.id)}
                          >
                            <FileEdit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No clients found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredClients.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstClient + 1} to {Math.min(indexOfLastClient, filteredClients.length)} of {filteredClients.length} clients
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Body Bliss Visio Patient Management System</p>
      </div>
    </div>
  );
} 