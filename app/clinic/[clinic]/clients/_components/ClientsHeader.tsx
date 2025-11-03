'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientsHeaderProps {
  clinicName: string;
  clinicDisplayName: string;
}

const themeColors = {
  primary: '#6366f1',
};

export function ClientsHeader({ clinicName, clinicDisplayName }: ClientsHeaderProps) {
  const router = useRouter();

  const handleAddClient = () => {
    router.push(`/clinic/${clinicName}/clients/new`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
          Clients - {clinicDisplayName}
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
  );
}

