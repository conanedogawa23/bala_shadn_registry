"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table/Table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Printer, Search, Plus, FileText, CreditCard, MoreHorizontal, Download, Filter } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

interface Payment {
  id: string;
  paymentDate: string;
  clientName: string;
  clientId: string;
  invoiceNumber: string;
  paymentMethod: string;
  amount: number;
  status: "completed" | "pending" | "failed";
}

export default function PaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalFilteredPayments, setTotalFilteredPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // Simulate API call to fetch payments for this clinic
    const fetchPayments = async () => {
      try {
        // This would be a real API call in a production app
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockPayments = [
          {
            id: "1",
            paymentDate: "2024-03-15",
            clientName: "HEALTH BIOFORM",
            clientId: "21770481",
            invoiceNumber: "87572700",
            paymentMethod: "Cheque",
            amount: 90.00,
            status: "completed" as const
          },
          {
            id: "2",
            paymentDate: "2024-03-14",
            clientName: "JOHNSON, MARY",
            clientId: "34511289",
            invoiceNumber: "87572701",
            paymentMethod: "Credit Card",
            amount: 120.50,
            status: "completed" as const
          },
          {
            id: "3",
            paymentDate: "2024-03-14",
            clientName: "SMITH, JOHN",
            clientId: "31956722",
            invoiceNumber: "87572702",
            paymentMethod: "Debit",
            amount: 65.75,
            status: "completed" as const
          },
          {
            id: "4",
            paymentDate: "2024-03-13",
            clientName: "GARCIA, ELENA",
            clientId: "32845109",
            invoiceNumber: "87572703",
            paymentMethod: "Cash",
            amount: 150.00,
            status: "completed" as const
          },
          {
            id: "5",
            paymentDate: "2024-03-12",
            clientName: "WONG, MICHAEL",
            clientId: "36721908",
            invoiceNumber: "87572704",
            paymentMethod: "Insurance",
            amount: 250.25,
            status: "pending" as const
          },
          {
            id: "6",
            paymentDate: "2024-03-11",
            clientName: "PATEL, PRIYA",
            clientId: "39088421",
            invoiceNumber: "87572705",
            paymentMethod: "Credit Card",
            amount: 80.00,
            status: "failed" as const
          },
          {
            id: "7",
            paymentDate: "2024-03-10",
            clientName: "TAYLOR, ROBERT",
            clientId: "33901267",
            invoiceNumber: "87572706",
            paymentMethod: "Cheque",
            amount: 110.50,
            status: "completed" as const
          },
          {
            id: "8",
            paymentDate: "2024-03-09",
            clientName: "NGUYEN, LILY",
            clientId: "37612954",
            invoiceNumber: "87572707",
            paymentMethod: "Debit",
            amount: 95.75,
            status: "completed" as const
          },
          {
            id: "9",
            paymentDate: "2024-03-08",
            clientName: "RODRIGUEZ, CARLOS",
            clientId: "31078562",
            invoiceNumber: "87572708",
            paymentMethod: "Cash",
            amount: 60.25,
            status: "completed" as const
          },
          {
            id: "10",
            paymentDate: "2024-03-07",
            clientName: "DAVIS, EMMA",
            clientId: "38420913",
            invoiceNumber: "87572709",
            paymentMethod: "Insurance",
            amount: 175.00,
            status: "pending" as const
          },
          {
            id: "11",
            paymentDate: "2024-03-06",
            clientName: "WILSON, JAMES",
            clientId: "35689741",
            invoiceNumber: "87572710",
            paymentMethod: "Credit Card",
            amount: 130.25,
            status: "completed" as const
          },
          {
            id: "12",
            paymentDate: "2024-03-05",
            clientName: "CHEN, WEI",
            clientId: "32147896",
            invoiceNumber: "87572711",
            paymentMethod: "Cheque",
            amount: 85.50,
            status: "failed" as const
          },
        ];
        
        setPayments(mockPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [clinic]);

  // Filter payments based on search query and filters
  useEffect(() => {
    let filtered = payments;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== "all") {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }

    // Filter by payment method
    if (selectedMethod && selectedMethod !== "all") {
      filtered = filtered.filter(payment => 
        payment.paymentMethod.toLowerCase() === selectedMethod.toLowerCase()
      );
    }

    // Filter by date
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(payment => payment.paymentDate === selectedDateStr);
    }

    setFilteredPayments(filtered);
    setTotalFilteredPayments(filtered.length);
    setTotalPages(Math.ceil(filtered.length / paymentsPerPage));
    setCurrentPage(1);
  }, [payments, searchQuery, selectedStatus, selectedMethod, selectedDate, paymentsPerPage]);

  // Get current payments for pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Debounce function for search
  function debounce(func: (value: string) => void, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(value), delay);
    };
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle printing receipt
  const handlePrintReceipt = (payment: Payment) => {
    console.log("Printing receipt for payment:", payment.id);
    // In a real app, this would trigger a print dialog or API call
  };

  // Handle voiding payment
  const handleVoidPayment = (payment: Payment) => {
    console.log("Voiding payment:", payment.id);
    // In a real app, this would call an API to void the payment
  };

  // Handle row click to navigate to payment details
  const handleRowClick = (paymentId: string) => {
    router.push(`/payments/${paymentId}`);
  };

  // Handle creating new payment
  const handleCreateNewPayment = () => {
    router.push(`/clinic/${clinic}/payments/new`);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
            Payments - {clinic.replace('-', ' ')}
          </h1>
          <p className="text-gray-600 mt-1">View and manage all payment records for {clinic.replace('-', ' ')} clinic</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 self-start">
          <Button onClick={handleCreateNewPayment} className="flex items-center gap-2">
            <Plus size={16} />
            Record Payment
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Printer size={16} />
            Print List
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200 mb-8">
        <CardHeader className="bg-slate-50 pt-4 pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter size={16} /> Filter Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by client or invoice..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  debounce(setSearchQuery, 300)(e.target.value);
                }}
              />
            </div>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedMethod}
              onValueChange={setSelectedMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit card">Credit Card</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
            <DatePicker
              date={selectedDate}
              setDate={setSelectedDate}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          <Card className="shadow-sm border border-gray-200 mb-6">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">Client</TableHead>
                    <TableHead className="font-medium">Invoice #</TableHead>
                    <TableHead className="font-medium">Method</TableHead>
                    <TableHead className="font-medium text-right">Amount</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPayments.map((payment) => (
                    <TableRow 
                      key={payment.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(payment.id)}
                    >
                      <TableCell className="py-3">{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell className="py-3 font-medium">{payment.clientName}</TableCell>
                      <TableCell className="py-3">{payment.invoiceNumber}</TableCell>
                      <TableCell className="py-3">{payment.paymentMethod}</TableCell>
                      <TableCell className="py-3 text-right">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRowClick(payment.id)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintReceipt(payment)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleVoidPayment(payment)}
                                className="text-red-600"
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Void Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t py-3">
              <div className="text-sm text-gray-600">
                Showing {paymentsPerPage * (currentPage - 1) + 1} to{" "}
                {Math.min(paymentsPerPage * currentPage, totalFilteredPayments)} of{" "}
                {totalFilteredPayments} payments
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
} 