'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { themeColors } from '@/registry/new-york/theme-config/theme-config';

interface OrdersHeaderProps {
  clinicName: string;
  clinicDisplayName: string;
}

export function OrdersHeader({ clinicName, clinicDisplayName }: OrdersHeaderProps) {
  const router = useRouter();

  const handleCreateNewOrder = () => {
    router.push(`/clinic/${clinicName}/orders/new`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
          Orders - {clinicDisplayName}
        </h1>
        <p className="text-gray-600 mt-1">
          View and manage all orders for {clinicDisplayName}
        </p>
      </div>
      <Button 
        onClick={handleCreateNewOrder}
        className="flex items-center gap-2 self-start"
      >
        <Plus size={16} />
        Create New Order
      </Button>
    </div>
  );
}

