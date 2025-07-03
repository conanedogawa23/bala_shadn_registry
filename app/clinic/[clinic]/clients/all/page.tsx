'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Eye,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  status: 'active' | 'inactive' | 'archived';
  lastVisit: string;
  totalOrders: number;
  nextAppointment?: string;
}

const themeColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

export default function AllClientsPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 12;

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockClients: Client[] = [
          {
            id: "16883465",
            name: "ROBINSON, DAVID",
            email: "d.robinson@email.com",
            phone: "416-555-1234",
            dateOfBirth: "1985-06-15",
            gender: "male",
            status: "active",
            lastVisit: "2024-01-15",
            totalOrders: 12,
            nextAppointment: "2024-02-01"
          },
          {
            id: "21770481",
            name: "HEALTH BIOFORM",
            email: "info@healthbioform.com",
            phone: "905-670-0204",
            dateOfBirth: "1978-03-22",
            gender: "female",
            status: "active",
            lastVisit: "2024-01-10",
            totalOrders: 8,
            nextAppointment: "2024-01-28"
          },
          {
            id: "23456789",
            name: "SMITH, JOHN",
            email: "j.smith@email.com",
            phone: "416-555-2345",
            dateOfBirth: "1992-09-08",
            gender: "male",
            status: "inactive",
            lastVisit: "2023-12-05",
            totalOrders: 5
          },
          {
            id: "34567890",
            name: "JOHNSON, MARY",
            email: "m.johnson@email.com",
            phone: "416-555-3456",
            dateOfBirth: "1975-11-30",
            gender: "female",
            status: "active",
            lastVisit: "2024-01-12",
            totalOrders: 15,
            nextAppointment: "2024-02-05"
          },
          {
            id: "45678901",
            name: "BROWN, ROBERT",
            email: "r.brown@email.com",
            phone: "416-555-4567",
            dateOfBirth: "1988-07-14",
            gender: "male",
            status: "archived",
            lastVisit: "2023-08-22",
            totalOrders: 3
          }
        ];
        setClients(mockClients);
        setFilteredClients(mockClients);
        setIsLoading(false);
      }, 1000);
    };

    fetchClients();
  }, [clinic]);

  // Filter clients based on search query and status
  useEffect(() => {
    let filtered = clients;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(client => client.status === statusFilter);
    }
    
    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, clients]);

  // Calculate pagination
  const totalFilteredClients = filteredClients.length;
  const totalPages = Math.ceil(totalFilteredClients / clientsPerPage);
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

  const handleBack = () => {
    router.push(`/clinic/${clinic}/clients`);
  };

  const handleViewClient = (clientId: string) => {
    router.push(`/clinic/${clinic}/clients/${clientId}`);
  };

  const handleEditClient = (clientId: string) => {
    router.push(`/clinic/${clinic}/clients/${clientId}/edit`);
  };

  const handleAddClient = () => {
    router.push(`/clinic/${clinic}/clients/new`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

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
      {/* Back Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Clients
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            All Clients - {clinic.replace('-', ' ')}
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all clients for this clinic
          </p>
        </div>
        <Button 
          onClick={handleAddClient}
          className="flex items-center gap-2"
          style={{ backgroundColor: themeColors.primary }}
        >
          <Plus size={16} />
          Add New Client
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {indexOfFirstClient + 1}-{Math.min(indexOfLastClient, totalFilteredClients)} of {totalFilteredClients} clients
        </p>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    {client.name.split(' ')[0][0]}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Age {calculateAge(client.dateOfBirth)} • {client.gender}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className={getStatusColor(client.status)}>
                  {client.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Last visit: {formatDate(client.lastVisit)}
                </div>
                {client.nextAppointment && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Calendar className="h-4 w-4" />
                    Next: {formatDate(client.nextAppointment)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {client.totalOrders} orders
                </div>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {currentClients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No clients found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by adding your first client"}
          </p>
          <Button 
            onClick={handleAddClient}
            style={{ backgroundColor: themeColors.primary }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 