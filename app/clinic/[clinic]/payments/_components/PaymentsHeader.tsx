'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { themeColors } from '@/registry/new-york/theme-config/theme-config';

interface PaymentsHeaderProps {
  clinicName: string;
  clinicDisplayName: string;
}

export function PaymentsHeader({ clinicName, clinicDisplayName }: PaymentsHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold break-words" style={{ color: themeColors.primary }}>
        Payments - {clinicDisplayName}
      </h1>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
        <p className="text-gray-600">
          View and manage all payments for {clinicDisplayName}
        </p>
        <Button 
          onClick={() => router.push(`/clinic/${clinicName}/payments/new`)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} />
          Record Payment
        </Button>
      </div>
    </div>
  );
}

