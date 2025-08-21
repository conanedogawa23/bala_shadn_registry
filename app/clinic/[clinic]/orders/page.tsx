"use client";

import React, { useState, useMemo } from "react";
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
import { Search, Calendar, Plus, ChevronRight, ChevronLeft, Eye, Edit2, Trash2, Printer, FileText, DollarSign, UserCircle, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { slugToClinic } from "@/lib/data/clinics";
import { generateLink } from "@/lib/route-utils";

// Import real API hooks and utilities
import { 
  useOrdersByClinic, 
  useOrderMutation, 
  OrderUtils,
  Order,
  OrderStatus,
  PaymentStatus
} from "@/lib/hooks";

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  // State for search and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  
  // Get clinic data for API calls
  const clinicData = useMemo(() => slugToClinic(clinic), [clinic]);
  
  // Fetch orders using real API
  const { 
    orders, 
    loading: isLoading, 
    error, 
    refetch 
  } = useOrdersByClinic({
    clinicName: clinicData?.name || "",
    autoFetch: !!clinicData?.name
  });

  // Order mutation hook for operations
  const { 
    cancelOrder, 
    loading: mutationLoading, 
    error: mutationError 
  } = useOrderMutation();
  
  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase();
    return orders.filter(order =>
      order.orderNumber.toLowerCase().includes(query) ||
      order.clientName.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.paymentStatus.toLowerCase().includes(query) ||
      formatDate(order.orderDate).toLowerCase().includes(query) ||
      formatDate(order.serviceDate).toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);
  
  // Calculate pagination
  const totalFilteredOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalFilteredOrders / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  
  // Event handlers
  const handleViewOrder = (order: Order) => {
    // Navigate to order details using order ID
    router.push(generateLink('clinic', `orders/${order._id}`, clinic));
  };
  
  const handleEditOrder = (order: Order) => {
    // Navigate to order edit page
    router.push(generateLink('clinic', `orders/${order._id}/edit`, clinic));
  };
  
  const handleDeleteOrder = async (order: Order) => {
    if (window.confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) {
      try {
        await cancelOrder(order._id, "Cancelled by user");
        // Refetch orders to update the list
        refetch();
      } catch (error) {
        console.error("Error cancelling order:", error);
      }
    }
  };
  
  const handlePrintInvoice = (order: Order) => {
    // Navigate to order details for invoice printing
    router.push(generateLink('clinic', `orders/${order._id}`, clinic));
  };
  
  const handleCreateNewOrder = () => {
    router.push(generateLink('clinic', 'orders/new', clinic));
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
  
  // Function to render combined status badge (order + payment status)
  const getStatusBadge = (order: Order) => {
    // Primary status based on order status
    const orderStatusColor = OrderUtils.getStatusColor(order.status);
    const paymentStatusColor = OrderUtils.getPaymentStatusColor(order.paymentStatus);
    
    return (
      <div className="flex flex-col gap-1">
        <Badge className={`${orderStatusColor} text-xs`}>
          {order.status === OrderStatus.SCHEDULED && "Scheduled"}
          {order.status === OrderStatus.IN_PROGRESS && "In Progress"}
          {order.status === OrderStatus.COMPLETED && "Completed"}
          {order.status === OrderStatus.CANCELLED && "Cancelled"}
          {order.status === OrderStatus.NO_SHOW && "No Show"}
        </Badge>
        <Badge className={`${paymentStatusColor} text-xs`}>
          {order.paymentStatus === PaymentStatus.PENDING && "Payment Pending"}
          {order.paymentStatus === PaymentStatus.PARTIAL && "Partially Paid"}
          {order.paymentStatus === PaymentStatus.PAID && "Paid"}
          {order.paymentStatus === PaymentStatus.OVERDUE && "Overdue"}
          {order.paymentStatus === PaymentStatus.REFUNDED && "Refunded"}
        </Badge>
      </div>
    );
  };

  // Handle clinic not found
  if (!clinicData) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Clinic Not Found</h2>
            <p className="text-gray-600">The requested clinic could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Orders - {clinicData.name}
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all orders for {clinicData.name}
          </p>
        </div>
        <Button 
          onClick={handleCreateNewOrder}
          className="flex items-center gap-2 self-start"
          disabled={mutationLoading}
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
              placeholder="Search by order number, client name, status, or date..."
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
      
      {/* Mutation Error Display */}
      {mutationError && (
        <Card className="shadow-sm border border-red-200 mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={16} />
              <span className="text-sm">{mutationError}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
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
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
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
                            {OrderUtils.formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(order)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye size={14} />
                              </Button>
                              {(order.status === OrderStatus.SCHEDULED || order.status === OrderStatus.IN_PROGRESS) && (
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleEditOrder(order)}
                                  disabled={mutationLoading}
                                >
                                  <Edit2 size={14} />
                                </Button>
                              )}
                              {order.status !== OrderStatus.CANCELLED && (
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteOrder(order)}
                                  disabled={mutationLoading}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handlePrintInvoice(order)}
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
                          colSpan={7} 
                          className="text-center py-8 text-gray-500"
                        >
                          {searchQuery ? "No orders match your search criteria" : "No orders found for this clinic"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-6">
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