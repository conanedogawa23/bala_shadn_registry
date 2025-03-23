"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
}

export default function OrdersPage() {
  const router = useRouter();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  
  // Mock orders data - in a real app, this would be fetched from an API
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // Simulate API call to fetch orders
    const fetchOrders = async () => {
      try {
        // Wait for 500ms to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data based on the screenshots provided
        const mockOrders = [
          {
            id: "1",
            orderNumber: "SH90123",
            orderDate: "2023-12-15",
            clientName: "ROBINSON, DAVID",
            clientId: "16883465",
            productCount: 3,
            totalAmount: 195.98,
            totalPaid: 195.98,
            totalOwed: 0,
            status: "paid" as const
          },
          {
            id: "2",
            orderNumber: "SH90124",
            orderDate: "2023-12-18",
            clientName: "SMITH, JOHN",
            clientId: "23456789",
            productCount: 2,
            totalAmount: 120.45,
            totalPaid: 100.00,
            totalOwed: 20.45,
            status: "partially paid" as const
          },
          {
            id: "3",
            orderNumber: "SH90125",
            orderDate: "2023-12-20",
            clientName: "JOHNSON, MARY",
            clientId: "34567890",
            productCount: 1,
            totalAmount: 55.99,
            totalPaid: 0,
            totalOwed: 55.99,
            status: "unpaid" as const
          },
          {
            id: "4",
            orderNumber: "SH90126",
            orderDate: "2023-12-22",
            clientName: "WILLIAMS, ROBERT",
            clientId: "45678901",
            productCount: 4,
            totalAmount: 245.75,
            totalPaid: 245.75,
            totalOwed: 0,
            status: "paid" as const
          },
          {
            id: "5",
            orderNumber: "SH90127",
            orderDate: "2023-12-25",
            clientName: "BROWN, PATRICIA",
            clientId: "56789012",
            productCount: 2,
            totalAmount: 89.99,
            totalPaid: 0,
            totalOwed: 89.99,
            status: "unpaid" as const
          },
          {
            id: "6",
            orderNumber: "SH90128",
            orderDate: "2023-12-27",
            clientName: "ANDERSON, JENNIFER",
            clientId: "67890123",
            productCount: 1,
            totalAmount: 35.50,
            totalPaid: 35.50,
            totalOwed: 0,
            status: "paid" as const
          },
          {
            id: "7",
            orderNumber: "SH90129",
            orderDate: "2023-12-30",
            clientName: "TAYLOR, MICHAEL",
            clientId: "78901234",
            productCount: 5,
            totalAmount: 324.99,
            totalPaid: 200.00,
            totalOwed: 124.99,
            status: "partially paid" as const
          },
          {
            id: "8",
            orderNumber: "SH90130",
            orderDate: "2024-01-02",
            clientName: "WILSON, LINDA",
            clientId: "89012345",
            productCount: 3,
            totalAmount: 156.75,
            totalPaid: 156.75,
            totalOwed: 0,
            status: "paid" as const
          },
          {
            id: "9",
            orderNumber: "SH90131",
            orderDate: "2024-01-05",
            clientName: "MILLER, JAMES",
            clientId: "90123456",
            productCount: 2,
            totalAmount: 99.99,
            totalPaid: 0,
            totalOwed: 99.99,
            status: "unpaid" as const
          },
          {
            id: "10",
            orderNumber: "SH90132",
            orderDate: "2024-01-08",
            clientName: "CLARK, SUSAN",
            clientId: "01234567",
            productCount: 4,
            totalAmount: 289.99,
            totalPaid: 150.00,
            totalOwed: 139.99,
            status: "partially paid" as const
          },
          {
            id: "11",
            orderNumber: "SH90133",
            orderDate: "2024-01-10",
            clientName: "HEALTH BIOFORM",
            clientId: "21770481",
            productCount: 10,
            totalAmount: 1250.00,
            totalPaid: 1250.00,
            totalOwed: 0,
            status: "paid" as const
          },
          {
            id: "12",
            orderNumber: "SH90134",
            orderDate: "2024-01-12",
            clientName: "ROBINSON, DAVID",
            clientId: "16883465",
            productCount: 1,
            totalAmount: 45.99,
            totalPaid: 0,
            totalOwed: 45.99,
            status: "unpaid" as const
          },
          {
            id: "13",
            orderNumber: "SH90135",
            orderDate: "2024-01-15",
            clientName: "SMITH, JOHN",
            clientId: "23456789",
            productCount: 2,
            totalAmount: 88.50,
            totalPaid: 88.50,
            totalOwed: 0,
            status: "paid" as const
          },
          {
            id: "14",
            orderNumber: "SH90136",
            orderDate: "2024-01-18",
            clientName: "JOHNSON, MARY",
            clientId: "34567890",
            productCount: 3,
            totalAmount: 165.25,
            totalPaid: 100.00,
            totalOwed: 65.25,
            status: "partially paid" as const
          },
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    return (
      order.clientName.toLowerCase().includes(query) ||
      order.orderNumber.toLowerCase().includes(query) ||
      formatDate(order.orderDate).toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });
  
  // Calculate pagination
  const totalFilteredOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalFilteredOrders / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  
  // Handlers
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
    router.push("/orders/new");
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
            Orders
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all customer orders
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