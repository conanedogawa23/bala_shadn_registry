"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table/Table";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";
import { Search, Calendar, Plus, ChevronRight, ChevronLeft, Eye, Edit2, Trash2, Printer, FileText, DollarSign, UserCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { slugToClinic } from "@/lib/data/clinics";

// Define Order type locally
interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  clientName: string;
  clientId: string;
  productCount: number;
  totalAmount: number;
  totalPaid: number;
  totalOwed: number;
  status: "paid" | "partially paid" | "unpaid";
  products: {
    name: string;
    description: string;
    price: number;
    quantity: number;
  }[];
  clinic: string;
}

// Mock data generation function
const generateMockOrders = (clinicName: string): Order[] => {
  const isOrthopedic = clinicName.toLowerCase().includes('orthopedic') || 
                      clinicName.toLowerCase().includes('ortholine') ||
                      clinicName.toLowerCase().includes('orthotic');

  const products = isOrthopedic ? [
    { name: "Custom Orthotics", price: 350, desc: "Custom-made orthotic insoles" },
    { name: "Heel Cups", price: 45, desc: "Gel heel cups for comfort" },
    { name: "Arch Supports", price: 60, desc: "Arch support insoles" },
    { name: "Orthopedic Shoes", price: 180, desc: "Therapeutic footwear" },
    { name: "Compression Stockings", price: 75, desc: "Medical compression wear" }
  ] : [
    { name: "Physiotherapy Session", price: 80, desc: "60-minute therapy session" },
    { name: "Massage Therapy", price: 90, desc: "Therapeutic massage" },
    { name: "Acupuncture", price: 70, desc: "Traditional acupuncture" },
    { name: "Exercise Program", price: 120, desc: "Personalized exercise plan" }
  ];

  const clientNames = [
    "Amin, Hasmukhlal",
    "Banquerigo, Charity", 
    "Campagna, Frank",
    "David, G. Levi",
    "Enverga, Rosemer",
    "Fung, Mei Chu",
    "Galang, Alma",
    "Gotzev, Boris",
    "Henderson, Sarah",
    "Jackson, Michael"
  ];

  const orders: Order[] = [];
  const orderCount = 15;

  for (let i = 0; i < orderCount; i++) {
    const clientName = clientNames[i % clientNames.length];
    const productCount = Math.floor(Math.random() * 3) + 1;
    let totalAmount = 0;
    
    const orderProducts = [];
    for (let j = 0; j < productCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const price = product.price + (Math.random() * 50 - 25);
      orderProducts.push({
        name: product.name,
        description: product.desc,
        price: Math.round(price * 100) / 100,
        quantity: Math.floor(Math.random() * 2) + 1
      });
      totalAmount += price;
    }
    
    totalAmount = Math.round(totalAmount * 100) / 100;
    const statusRand = Math.random();
    let status: "paid" | "partially paid" | "unpaid";
    let totalPaid: number;
    
    if (statusRand < 0.7) {
      status = "paid";
      totalPaid = totalAmount;
    } else if (statusRand < 0.9) {
      status = "partially paid";
      totalPaid = Math.round((totalAmount * (0.3 + Math.random() * 0.4)) * 100) / 100;
    } else {
      status = "unpaid";
      totalPaid = 0;
    }
    
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 180));
    
    orders.push({
      id: (i + 1).toString(),
      orderNumber: `SH${90000 + i + 1}`,
      orderDate: orderDate.toISOString().split('T')[0],
      clientName: clientName,
      clientId: `CLI${i + 1000}`,
      productCount: orderProducts.length,
      totalAmount,
      totalPaid,
      totalOwed: Math.round((totalAmount - totalPaid) * 100) / 100,
      status,
      products: orderProducts,
      clinic: clinicName
    });
  }
  
  return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  
  // Mock orders data - in a real app, this would be fetched from an API based on clinic
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // Fetch real orders for this clinic
    const fetchOrders = async () => {
      try {
        // Wait for 500ms to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get clinic name from slug and fetch real orders
        const clinicData = slugToClinic(clinic);
        const clinicName = clinicData?.name || clinic.replace('-', ' ');
        const realOrders = generateMockOrders(clinicName);
        
        setOrders(realOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [clinic]);
  
  // Filter orders based on search query
  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.orderDate.includes(searchQuery)
  );
  
  // Calculate pagination
  const totalFilteredOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalFilteredOrders / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  
  // Event handlers
  const handleViewOrder = (clientId: string, orderId: string) => {
    router.push(`/clients/${clientId}/orders/${orderId}`);
  };
  
  const handleEditOrder = (clientId: string, orderId: string) => {
    router.push(`/clients/${clientId}/orders/${orderId}/edit`);
  };
  
  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      // In a real app, this would be an API call
      setOrders(orders.filter(order => order.id !== orderId));
    }
  };
  
  const handlePrintInvoice = (clientId: string, orderId: string) => {
    router.push(`/clients/${clientId}/orders/${orderId}`);
  };
  
  const handleCreateNewOrder = () => {
    router.push(`/clinic/${clinic}/orders/new`);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Pagination navigation handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  // Function to render status badge
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "partially paid":
        return <Badge className="bg-yellow-500">Partially Paid</Badge>;
      case "unpaid":
        return <Badge className="bg-red-500">Unpaid</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Orders - {clinic.replace('-', ' ')}
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all orders for {clinic.replace('-', ' ')} clinic
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
      
      {/* Search */}
      <Card className="shadow-sm border border-gray-200 mb-8">
        <CardHeader className="bg-slate-50 pb-3 pt-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Search size={16} />
            Search Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Label htmlFor="orderSearch" className="sr-only">Search Orders</Label>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="orderSearch"
              placeholder="Search by order number, client name, date, or status..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on new search
              }}
            />
          </div>
          <div className="flex items-center justify-end mt-2">
            <span className="text-sm text-gray-500">
              {filteredOrders.length} orders found
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
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
                          Date
                        </div>
                      </TableHead>
                      <TableHead className="font-medium">
                        <div className="flex items-center gap-1">
                          <UserCircle size={14} />
                          Client
                        </div>
                      </TableHead>
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
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell>
                          <TableCell>{order.clientName}</TableCell>
                          <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleViewOrder(order.clientId, order.id)}
                              >
                                <Eye size={14} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditOrder(order.clientId, order.id)}
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handlePrintInvoice(order.clientId, order.id)}
                              >
                                <Printer size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell 
                          colSpan={6} 
                          className="text-center py-8 text-gray-500"
                        >
                          {searchQuery ? "No orders match your search criteria" : "No orders found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, totalFilteredOrders)} of {totalFilteredOrders} orders
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show proper page range centered around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const middlePoint = Math.min(Math.max(currentPage, 3), totalPages - 2);
                        pageNum = middlePoint - 2 + i;
                      }
                      
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-primary text-white' : ''}`}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 