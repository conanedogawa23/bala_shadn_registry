'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  UserCircle, 
  DollarSign, 
  FileText,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table/Table';
import { formatDate } from '@/lib/utils';

interface Order {
  _id: string;
  orderNumber: string;
  serviceDate: string;
  clientName: string;
  items: Array<{ productName: string; [key: string]: any }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  [key: string]: any;
}

interface OrdersTableProps {
  orders: Order[];
  clinicName: string;
  onDeleteOrder?: (orderId: string) => void;
  isDeleting?: boolean;
}

export function OrdersTable({ 
  orders, 
  clinicName, 
  onDeleteOrder,
  isDeleting = false 
}: OrdersTableProps) {
  const router = useRouter();

  const handleViewOrder = useCallback((orderId: string) => {
    router.push(`/clinic/${clinicName}/orders/${orderId}`);
  }, [router, clinicName]);

  const handleEditOrder = useCallback((orderId: string) => {
    router.push(`/clinic/${clinicName}/orders/${orderId}/edit`);
  }, [router, clinicName]);

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
      case 'inprogress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
      case 'noshow':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
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

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-medium">
              <div className="flex items-center gap-1">
                <FileText size={14} />
                Order #
              </div>
            </TableHead>
            <TableHead className="font-medium">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                Service Date
              </div>
            </TableHead>
            <TableHead className="font-medium">
              <div className="flex items-center gap-1">
                <UserCircle size={14} />
                Client
              </div>
            </TableHead>
            <TableHead className="font-medium">Services</TableHead>
            <TableHead className="font-medium text-right">
              <div className="flex items-center gap-1 justify-end">
                <DollarSign size={14} />
                Total
              </div>
            </TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{formatDate(order.serviceDate)}</TableCell>
                <TableCell>{order.clientName}</TableCell>
                <TableCell>
                  <div className="max-w-48">
                    {order.items.length === 1 ? (
                      <span className="text-sm">{order.items[0].productName}</span>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {order.items.length} services
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(order.totalAmount)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge className={`${getOrderStatusColor(order.status)} text-xs`}>
                      {formatStatus(order.status)}
                    </Badge>
                    <Badge className={`${getPaymentStatusColor(order.paymentStatus)} text-xs`}>
                      {formatStatus(order.paymentStatus)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleViewOrder(order._id)}
                    >
                      <Eye size={14} />
                    </Button>
                    {(order.status === 'scheduled' || order.status === 'in_progress') && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditOrder(order._id)}
                        disabled={isDeleting}
                      >
                        <Edit2 size={14} />
                      </Button>
                    )}
                    {order.status !== 'cancelled' && onDeleteOrder && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => onDeleteOrder(order._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={7} 
                className="text-center py-8 text-gray-500"
              >
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

