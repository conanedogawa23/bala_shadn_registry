'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Eye,
  Plus
} from 'lucide-react';
import { slugToClinic } from '@/lib/data/clinics';
import { MockDataService } from '@/lib/data/mockDataService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';

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
  const [isLoading, setIsLoading] = useState(true);

  // Get real clients from the database using MockDataService
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const clinicData = slugToClinic(clinic);
        if (clinicData) {
          // Use MockDataService to get clinic-specific clients
          const rawClients = MockDataService.getClientsByClinic(clinicData.name);
          const formattedClients = rawClients.map(client => MockDataService.formatClientForUI(client));
          setClients(formattedClients);
        }
        setIsLoading(false);
      }, 1000);
    };

    fetchClients();
  }, [clinic]);

  const handleBack = () => {
    router.push(`/clinic/${clinic}/clients`);
  };

  const handleViewClient = useCallback((clientId: string) => {
    router.push(`/clinic/${clinic}/clients/${clientId}`);
  }, [router, clinic]);

  const handleEditClient = useCallback((clientId: string) => {
    router.push(`/clinic/${clinic}/clients/${clientId}/edit`);
  }, [router, clinic]);

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

  // Define columns for DataTable
  const columns: ColumnDef<Client>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Client",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: themeColors.primary }}
            >
              {client.name.split(' ')[0][0]}
            </div>
            <div>
              <div className="font-medium">{client.name}</div>
              <div className="text-sm text-gray-600">
                Age {calculateAge(client.dateOfBirth)} • {client.gender}
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
              {client.email}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              {client.phone}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
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
        const lastVisit = row.getValue("lastVisit") as string;
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
      cell: ({ row }) => {
        const nextAppointment = row.original.nextAppointment;
        return nextAppointment ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Calendar className="h-4 w-4" />
            {formatDate(nextAppointment)}
          </div>
        ) : (
          <span className="text-sm text-gray-400">None scheduled</span>
        );
      },
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      cell: ({ row }) => {
        const totalOrders = row.getValue("totalOrders") as number;
        return <span className="text-sm font-medium">{totalOrders}</span>;
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
            All Clients - {slugToClinic(clinic)?.displayName || clinic.replace('-', ' ')}
          </h1>
          <p className="text-gray-600 mt-1">
            {slugToClinic(clinic)?.clientCount || 0} total clients • {slugToClinic(clinic)?.status || 'unknown'} clinic
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

      {/* Clients DataTable */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Client Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={clients}
            globalFilterKey="name"
            filterPlaceholder="Search clients by name..."
            defaultPageSize={15}
            showFilter={true}
            showColumnToggle={true}
          />
        </CardContent>
      </Card>

      {/* Empty State */}
      {clients.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No clients found
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first client
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
    </div>
  );
} 