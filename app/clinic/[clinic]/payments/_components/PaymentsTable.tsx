'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface Payment {
  _id: string;
  paymentId: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  orderId?: string;
  [key: string]: any;
}

interface PaymentsTableProps {
  payments: Payment[];
  clinicName: string;
}

export function PaymentsTable({ payments, clinicName }: PaymentsTableProps) {
  const router = useRouter();

  const getStatusColorClass = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'writeoff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {payments.map((payment) => (
        <Card key={payment._id} className="shadow-sm border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-medium">
                  {payment.paymentId}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  <CreditCard className="inline h-3 w-3 mr-1" />
                  {payment.clientName}
                </p>
              </div>
              <Badge className={getStatusColorClass(payment.status)}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <div className="px-6 pb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span>{formatDate(payment.paymentDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Method:</span>
              <span>{payment.paymentMethod}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => router.push(`/clinic/${clinicName}/payments/${payment._id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => router.push(`/clinic/${clinicName}/payments/${payment._id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

