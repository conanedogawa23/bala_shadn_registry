'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Package, 
  FileText, 
  Phone, 
  Mail,
  Edit,
  Printer,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { slugToClinic } from '@/lib/data/clinics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { generateLink } from '@/lib/route-utils';

interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderData {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  orderDate: string;
  dueDate: string;
  completedDate?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
}

const themeColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

export default function ViewClientOrderPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  const clientId = params.id as string;
  const orderId = params.orderId as string;
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate realistic data based on clinic and client
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const clinicData = slugToClinic(clinic);
        const mockOrder: OrderData = generateOrderData(clinicData, orderId, clientId);
        setOrderData(mockOrder);
        setIsLoading(false);
      }, 1000);
    };

    fetchOrder();
  }, [orderId, clientId, clinic]);

  // Generate order data based on clinic info
  const generateOrderData = (clinicData: { displayName?: string; status?: string } | undefined, orderId: string, clientId: string): OrderData => {
    const isActive = clinicData?.status === 'active';
    const clinicName = clinicData?.displayName || 'Unknown Clinic';
    
    // Client names based on common IDs from real DB
    const clientNames: { [key: string]: { name: string; email: string; phone: string } } = {
      "16883465": { name: "ROBINSON, DAVID", email: "d.robinson@email.com", phone: "416-555-1234" },
      "21770481": { name: "HEALTH BIOFORM", email: "info@healthbioform.com", phone: "905-670-0204" },
      "30000": { name: "ANDERSON, SARAH", email: "sarah.anderson@email.com", phone: "416-555-5678" },
      "30001": { name: "THOMPSON, MICHAEL", email: "michael.thompson@email.com", phone: "416-555-9012" },
      // Add more client IDs that match the actual IDs in the system
      "91000": { name: "JOHNSON, ROBERT", email: "r.johnson@email.com", phone: "416-555-1111" },
      "91001": { name: "WILLIAMS, JENNIFER", email: "j.williams@email.com", phone: "416-555-2222" },
      "91002": { name: "BROWN, JAMES", email: "j.brown@email.com", phone: "416-555-3333" },
      "91003": { name: "DAVIS, PATRICIA", email: "p.davis@email.com", phone: "416-555-4444" },
      "91004": { name: "MILLER, JOHN", email: "j.miller@email.com", phone: "416-555-5555" },
      "91005": { name: "WILSON, LINDA", email: "l.wilson@email.com", phone: "416-555-6666" },
      "91006": { name: "MOORE, BARBARA", email: "b.moore@email.com", phone: "416-555-7777" },
      "91007": { name: "TAYLOR, RICHARD", email: "r.taylor@email.com", phone: "416-555-8888" },
      "91008": { name: "ANDERSON, SUSAN", email: "s.anderson@email.com", phone: "416-555-9999" },
      "91009": { name: "THOMAS, CHARLES", email: "c.thomas@email.com", phone: "416-555-0000" }
    };

    const client = clientNames[clientId] || { 
      name: "UNKNOWN CLIENT", 
      email: "client@email.com", 
      phone: "416-555-0000" 
    };

    // Different services based on clinic type
    const getClinicServices = () => {
      if (clinicName.includes('Physio') || clinicName.includes('Physical')) {
        return [
          { name: "Physical Therapy Session", description: "60-minute individual therapy session", price: 120.00 },
          { name: "Exercise Equipment Package", description: "Resistance bands and therapy balls", price: 85.00 },
          { name: "Home Exercise Program", description: "Custom exercise plan with video instructions", price: 50.00 },
          { name: "Manual Therapy", description: "Hands-on treatment techniques", price: 95.00 }
        ];
      } else if (clinicName.includes('Orthopedic') || clinicName.includes('Orthotic')) {
        return [
          { name: "Custom Orthotic Assessment", description: "Comprehensive foot and gait analysis", price: 180.00 },
          { name: "Orthotic Device", description: "Custom-made orthotic insoles", price: 450.00 },
          { name: "Follow-up Adjustment", description: "Orthotic fitting and adjustment", price: 75.00 }
        ];
      } else {
        return [
          { name: "Consultation", description: "Initial health assessment", price: 150.00 },
          { name: "Treatment Session", description: "Therapeutic intervention", price: 100.00 },
          { name: "Equipment Rental", description: "Medical equipment rental", price: 60.00 }
        ];
      }
    };

    const availableServices = getClinicServices();
    const selectedServices = availableServices.slice(0, Math.floor(Math.random() * 3) + 1);
    
    const items: OrderItem[] = selectedServices.map((service, index) => {
      const quantity = Math.floor(Math.random() * 3) + 1;
      const totalPrice = service.price * quantity;
      return {
        id: (index + 1).toString(),
        name: service.name,
        description: service.description,
        quantity,
        unitPrice: service.price,
        totalPrice
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    return {
      id: orderId,
      clientId: clientId,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      status: isActive ? (Math.random() > 0.5 ? "processing" : "completed") : "completed",
      orderDate: isActive ? "2024-01-15" : "2023-08-15",
      dueDate: isActive ? "2024-02-01" : "2023-09-01",
      items,
      subtotal,
      tax,
      total,
      notes: `${clinicName} - Client prefers ${Math.random() > 0.5 ? 'morning' : 'afternoon'} appointments. Focus on ${clinicName.includes('Physio') ? 'rehabilitation' : 'treatment'}.`,
      assignedTo: `Dr. ${Math.random() > 0.5 ? 'Sarah Johnson' : 'Michael Chen'}`,
      priority: Math.random() > 0.5 ? "medium" : "high"
    };
  };

  const handleBack = () => {
    router.push(generateLink('clinic', `clients/${clientId}`, clinic));
  };

  const handleEditOrder = () => {
    router.push(generateLink('clinic', `clients/${clientId}/orders/${orderId}/edit`, clinic));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert('Order summary downloaded');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  if (!orderData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Order Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The order you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={handleBack} className="mt-4">
            Back to Client
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to {orderData.clientName}
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Order #{orderData.id}
          </h1>
          <p className="text-gray-600 mt-1">
            {slugToClinic(clinic)?.displayName || clinic.replace('-', ' ')} • {orderData.clientName}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </Button>
          <Button 
            onClick={handleEditOrder}
            size="sm"
            className="flex items-center gap-2"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Edit size={16} />
            Edit Order
          </Button>
        </div>
      </div>

      {/* Order Status & Info */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge variant="secondary" className={getStatusColor(orderData.status)}>
                {getStatusIcon(orderData.status)}
                <span className="ml-2 capitalize">{orderData.status}</span>
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Priority</span>
              <Badge variant="secondary" className={getPriorityColor(orderData.priority)}>
                <span className="capitalize">{orderData.priority}</span>
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Order Date</span>
              <span className="font-medium">{formatDate(orderData.orderDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="font-medium">{formatDate(orderData.dueDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Assigned To</span>
              <span className="font-medium">{orderData.assignedTo}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Name</span>
              <span className="font-medium">{orderData.clientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{orderData.clientEmail}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Phone</span>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{orderData.clientPhone}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Client ID</span>
              <span className="font-medium">#{orderData.clientId}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderData.items.map((item, index) => (
              <div key={item.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <div className="text-sm text-gray-600">
                      Qty: <span className="font-medium">{item.quantity}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Unit: <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                </div>
                {index < orderData.items.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(orderData.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">{formatCurrency(orderData.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(orderData.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {orderData.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{orderData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 