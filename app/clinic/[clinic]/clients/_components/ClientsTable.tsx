'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface Client {
  id: string;
  clientId?: number;
  firstName: string;
  lastName: string;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface ClientsTableProps {
  clients: Client[];
  clinicName: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const themeColors = {
  primary: '#6366f1',
};

export function ClientsTable({ 
  clients, 
  clinicName,
  searchValue = '',
  onSearchChange 
}: ClientsTableProps) {
  const router = useRouter();

  const handleViewClient = useCallback((clientId: string | number) => {
    router.push(`/clinic/${clinicName}/clients/${clientId}`);
  }, [router, clinicName]);

  const handleEditClient = useCallback((clientId: string | number) => {
    router.push(`/clinic/${clinicName}/clients/${clientId}/edit`);
  }, [router, clinicName]);

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
        return (
          <span className="text-sm text-gray-400">Check appointments</span>
        );
      },
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      cell: () => {
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

  return (
    <DataTable 
      columns={columns} 
      data={clients}
      filterPlaceholder="Search clients by name, email, or phone..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      showPagination={false}
    />
  );
}

