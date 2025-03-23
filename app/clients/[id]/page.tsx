"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save,
  Trash,
  Edit as EditIcon,
  X,
  ChevronRight,
  AlertCircle,
  Plus
} from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table/Table";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

interface ScheduleHistoryEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  beginTime: string;
  endTime: string;
  provider: string;
  status: string;
}

interface OrderHistoryEntry {
  id: string;
  orderNumber: string;
  orderDate: string;
  productCount: string;
  totalAmount: string;
  totalPaid: string;
  totalOwed: string;
  status: string;
}

interface ContactHistoryEntry {
  date: string;
  note: string;
}

interface OrderProduct {
  productName: string;
  productCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  serviceDate: string;
  referringMD: string;
}

interface OrderDetail {
  orderNumber: string;
  orderDate: string;
  products: OrderProduct[];
  paymentMethod: string;
  dispenseDate: string | null;
}

// Form field type for contact notes
interface ContactFormState {
  date: string;
  note: string;
}

export default function ClientDetailPage() {
  const router = useRouter();
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Contact form state
  const [contactForm, setContactForm] = useState<ContactFormState>({
    date: "",
    note: ""
  });
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // State for order detail view
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Mock client data
  const [clientData, setClientData] = useState({
    id: "16883465",
    firstName: "LABELS",
    lastName: "ABCA",
    dateOfBirth: {
      day: "2",
      month: "1",
      year: "2000"
    },
    gender: "Female",
    streetAddress: "100 Labels St.",
    apartmentNo: "",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M3B 3R4",
    homePhone: "416-416-4164",
    cellPhone: "416-523-5655",
    workPhone: "416-224-9900",
    workPhoneExt: "00",
    email: "labels@bodybliss.ca",
    company: "Bodybliss",
    referralSource: "Concert",
    referralDetail: "Concert Other",
    familyMD: "Dr. REMENTILLA,F",
    referringMD: "Dr. REMENTILLA,F",
    csrName: "none", // Changed from empty string to "none" for consistency
    location: "BodyBliss",
    scheduleHistory: [
      {
        id: "1",
        date: "2023-12-15",
        title: "Initial Assessment",
        description: "First visit assessment for knee pain",
        beginTime: "10:00",
        endTime: "11:00",
        provider: "Dr. Smith, John",
        status: "confirmed"
      },
      {
        id: "2",
        date: "2023-12-22",
        title: "Follow-up Visit",
        description: "Follow-up for knee treatment",
        beginTime: "14:30",
        endTime: "15:15",
        provider: "Dr. Johnson, Sarah",
        status: "confirmed"
      },
      {
        id: "3",
        date: "2024-01-05",
        title: "Therapy Session",
        description: "Regular therapy session",
        beginTime: "09:15",
        endTime: "10:00",
        provider: "Dr. Williams, David",
        status: "pending"
      }
    ] as ScheduleHistoryEntry[],
    orderHistory: [
      {
        id: "1",
        orderNumber: "91243654",
        orderDate: "01/24/2013",
        productCount: "1",
        totalAmount: "$90.00",
        totalPaid: "$90.00",
        totalOwed: "0",
        status: "Final Paid"
      },
      {
        id: "2",
        orderNumber: "86254119",
        orderDate: "01/24/2013",
        productCount: "1",
        totalAmount: "$90.00",
        totalPaid: "$90.00",
        totalOwed: "0",
        status: "Final Paid"
      },
      {
        id: "3",
        orderNumber: "81264584",
        orderDate: "01/24/2013",
        productCount: "1",
        totalAmount: "$90.00",
        totalPaid: "$90.00",
        totalOwed: "0",
        status: "Final Paid"
      },
      {
        id: "4",
        orderNumber: "61635929",
        orderDate: "01/24/2013",
        productCount: "1",
        totalAmount: "$90.00",
        totalPaid: "$90.00",
        totalOwed: "0",
        status: "Final Paid"
      },
      {
        id: "5",
        orderNumber: "85924633",
        orderDate: "01/24/2013",
        productCount: "1",
        totalAmount: "$90.00",
        totalPaid: "$90.00",
        totalOwed: "0",
        status: "Final Paid"
      }
    ] as OrderHistoryEntry[],
    contactHistory: [] as ContactHistoryEntry[]
  });

  // Dropdown options
  const cities = ["Toronto", "Mississauga", "Markham", "Vaughan", "Richmond Hill"];
  const provinces = ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"];
  const genders = ["Female", "Male", "Other", "Prefer not to say"];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) => (2024 - i).toString());
  const referralSources = ["Concert", "Friend", "Google", "Social Media", "Doctor", "Insurance", "Other"];
  const locations = [
    "BodyBliss", 
    "Ortholine Duncan Mills", 
    "Bioform Health", 
    "Orthopedic Orthotic Appliances", 
    "Markham Orthopedic", 
    "Evergold", 
    "BodyBlissPhysio",
    "Family Chiro",
    "ExtremePhysio",
    "Physio Bliss"
  ];

  // Form validation
  const validateContactForm = (): boolean => {
    if (!contactForm.date.trim()) {
      setError("Date is required");
      return false;
    }
    if (!contactForm.note.trim()) {
      setError("Note content is required");
      return false;
    }
    return true;
  };

  // Handler functions grouped by functionality
  // ----------------------------------------
  
  // Navigation handlers
  const handleBack = () => {
    router.back();
  };
  
  const handleNext = () => {
    router.push(`/clients/${parseInt(clientData.id) + 1}`);
  };
  
  // Client data handlers
  const handleToggleEditMode = () => {
    if (isEditMode) {
      // If already in edit mode, just toggle it off
      setIsEditMode(false);
    } else {
      // Navigate to dedicated edit page
      router.push(`/clients/${clientData.id}/edit`);
    }
  };
  
  const handleSaveClientData = async () => {
    try {
      // In a real app, this would be an API call
      // await updateClient(clientData.id, clientData);
      setIsEditMode(false);
      alert("Client data saved successfully");
    } catch (error) {
      console.error("Failed to save client data:", error);
      alert("Failed to save client data. Please try again.");
    }
  };
  
  const handleDeleteClient = async () => {
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      try {
        setIsDeleting(true);
        // In a real app, this would be an API call
        // await deleteClient(clientData.id);
        alert("Client deleted successfully");
        router.push("/clients");
      } catch (error) {
        console.error("Failed to delete client:", error);
        alert("Failed to delete client. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  const handleCancel = () => {
    if (isEditMode) {
      if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
        setIsEditMode(false);
        // Reset form to original data
        // In a real app, this would refetch the data
      }
    } else {
      router.push("/clients");
    }
  };
  
  // Client data change handlers
  const handleClientDataChange = (field: string, value: string) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleDateOfBirthChange = (part: 'day' | 'month' | 'year', value: string) => {
    setClientData(prev => ({
      ...prev,
      dateOfBirth: {
        ...prev.dateOfBirth,
        [part]: value
      }
    }));
  };
  
  // Contact form handlers
  const handleContactFormChange = (field: keyof ContactFormState, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };
  
  const handleSaveContact = async () => {
    if (!validateContactForm()) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      // In a real app, this would be an API call
      // await saveContactNote(clientData.id, contactForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state with new contact note
      const newContact: ContactHistoryEntry = {
        date: contactForm.date,
        note: contactForm.note
      };
      
      setClientData(prev => ({
        ...prev,
        contactHistory: [newContact, ...prev.contactHistory]
      }));
      
      // Reset form
      setContactForm({ date: "", note: "" });
      alert("Contact note saved successfully");
    } catch (error) {
      console.error("Failed to save contact note:", error);
      setError("Failed to save contact note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteContact = async () => {
    if (!contactForm.date && !contactForm.note.trim()) {
      setError("No contact note to delete");
      return;
    }
    
    if (confirm("Are you sure you want to delete this contact note?")) {
      try {
        setIsDeleting(true);
        
        // In a real app, this would be an API call
        // await deleteContactNote(contactForm.id);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reset form
        setContactForm({ date: "", note: "" });
        setError(null);
      } catch (error) {
        console.error("Failed to delete contact note:", error);
        setError("Failed to delete contact note. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  // Insurance and PDF handlers
  const handleViewInsurance = (value: string) => {
    if (value && value !== "none") {
      // Logic to view selected insurance
      alert(`Viewing insurance: ${value}`);
    }
  };
  
  const handleGeneratePdf = () => {
    // Logic to generate PDF
    alert("Generating PDF form...");
  };

  // Order management handlers
  const handleViewOrder = (orderNumber: string) => {
    // In a real implementation, this would fetch the order detail from an API
    setSelectedOrder(orderNumber);
    
    // Mock order detail
    setOrderDetail({
      orderNumber,
      orderDate: "01/24/2013",
      products: [
        {
          productName: "Custom Made Orthotics",
          productCode: "CMO100",
          description: "Custom Made Orthotics\nnon-orthotic",
          quantity: 1,
          unitPrice: 90,
          serviceDate: "01/24/2013",
          referringMD: "Dr. Rementilla, F"
        }
      ],
      paymentMethod: "Cheque",
      dispenseDate: null
    });
  };
  
  const handleEditOrder = (order: OrderHistoryEntry) => {
    router.push(`/clients/${clientData.id}/orders/${order.id}/edit`);
  };
  
  const handleDeleteOrder = (orderNumber: string) => {
    if (confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
      // In a real app, this would be an API call
      setClientData(prev => ({
        ...prev,
        orderHistory: prev.orderHistory.filter(order => order.orderNumber !== orderNumber)
      }));
      
      if (selectedOrder === orderNumber) {
        setSelectedOrder(null);
        setOrderDetail(null);
      }
      
      alert(`Order ${orderNumber} has been deleted`);
    }
  };
  
  const handlePrintInvoice = (orderNumber: string) => {
    // Navigate to the order invoice page
    router.push(`/clients/${clientData.id}/orders/${orderNumber}`);
  };
  
  const handleEditProduct = (orderNumber: string, productCode: string) => {
    // Logic to edit product
    alert(`Editing product ${productCode} from order ${orderNumber}`);
  };
  
  const handleDeleteProduct = (orderNumber: string, productCode: string) => {
    if (confirm(`Are you sure you want to delete product ${productCode} from order ${orderNumber}?`)) {
      // In a real app, this would be an API call
      alert(`Product ${productCode} has been deleted from order ${orderNumber}`);
    }
  };
  
  const handleNewOrder = () => {
    // Logic to create new order
    alert("Creating new order");
  };
  
  const handleCloseOrderDetail = () => {
    setSelectedOrder(null);
    setOrderDetail(null);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Calculate total pages
  const totalOrders = clientData.orderHistory.length;
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  
  // Get current orders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = clientData.orderHistory.slice(indexOfFirstOrder, indexOfLastOrder);

  // Handle schedule actions
  const handleNewSchedule = () => {
    router.push(`/clients/${clientData.id}/schedules/create`);
  };
  
  const handleViewSchedule = (scheduleId: string) => {
    // In a real app, this would likely navigate to a detail view
    // For now, just alert the schedule details
    const schedule = clientData.scheduleHistory.find(s => s.id === scheduleId);
    if (schedule) {
      alert(`Viewing schedule: ${schedule.title} on ${schedule.date}`);
    }
  };
  
  const handleEditSchedule = (scheduleId: string) => {
    router.push(`/clients/${clientData.id}/schedules/${scheduleId}/edit`);
  };
  
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      setIsDeleting(true);
      
      try {
        // In a real app, this would be an API call
        // For now, simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update client data by removing the deleted schedule
        setClientData(prev => ({
          ...prev,
          scheduleHistory: prev.scheduleHistory.filter(s => s.id !== scheduleId)
        }));
      } catch (err) {
        setError("Failed to delete appointment. Please try again.");
        console.error("Error deleting appointment:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Main component render
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Clients
        </Button>
      </div>

      {/* Client Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.primary }}>
            {clientData.firstName} {clientData.lastName}
          </h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-gray-600">
              CLIENT ID: {clientData.id}
            </Badge>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleToggleEditMode}
          >
            <EditIcon size={16} />
            {isEditMode ? "Cancel Edit" : "Edit"}
          </Button>
          <Button 
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleDeleteClient}
            disabled={isDeleting}
          >
            <Trash size={16} />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="client_information" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="client_information">Client Information</TabsTrigger>
          <TabsTrigger value="schedule_history">Schedule History</TabsTrigger>
          <TabsTrigger value="order_history">Order History</TabsTrigger>
          <TabsTrigger value="contact_history">Contact History</TabsTrigger>
        </TabsList>

        {/* Client Information Tab */}
        <TabsContent value="client_information" className="mt-0">
          <Card className="shadow-md border-0">
            <CardHeader className="bg-slate-100">
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name:</Label>
                    <Input 
                      id="lastName" 
                      value={clientData.lastName} 
                      onChange={(e) => handleClientDataChange("lastName", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name:</Label>
                    <Input 
                      id="firstName" 
                      value={clientData.firstName} 
                      onChange={(e) => handleClientDataChange("firstName", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date of Birth (Day/Month/Year):</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={clientData.dateOfBirth.day}
                        onValueChange={(value) => handleDateOfBirthChange("day", value)}
                        disabled={!isEditMode}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={clientData.dateOfBirth.month}
                        onValueChange={(value) => handleDateOfBirthChange("month", value)}
                        disabled={!isEditMode}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month} value={month}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={clientData.dateOfBirth.year}
                        onValueChange={(value) => handleDateOfBirthChange("year", value)}
                        disabled={!isEditMode}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender:</Label>
                    <Select 
                      value={clientData.gender}
                      onValueChange={(value) => handleClientDataChange("gender", value)}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map(gender => (
                          <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Street Address:</Label>
                    <Input 
                      id="streetAddress" 
                      value={clientData.streetAddress} 
                      onChange={(e) => handleClientDataChange("streetAddress", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apartmentNo">Apartment No.:</Label>
                    <Input 
                      id="apartmentNo" 
                      value={clientData.apartmentNo} 
                      onChange={(e) => handleClientDataChange("apartmentNo", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                </div>
                
                {/* Middle Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City:</Label>
                    <Select 
                      value={clientData.city}
                      onValueChange={(value) => handleClientDataChange("city", value)}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="province">Province:</Label>
                    <Select 
                      value={clientData.province}
                      onValueChange={(value) => handleClientDataChange("province", value)}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                          <SelectItem key={province} value={province}>{province}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code:</Label>
                    <Input 
                      id="postalCode" 
                      value={clientData.postalCode} 
                      onChange={(e) => handleClientDataChange("postalCode", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="homePhone">Home Phone:</Label>
                    <Input 
                      id="homePhone" 
                      value={clientData.homePhone} 
                      onChange={(e) => handleClientDataChange("homePhone", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cellPhone">Cell Phone:</Label>
                    <Input 
                      id="cellPhone" 
                      value={clientData.cellPhone} 
                      onChange={(e) => handleClientDataChange("cellPhone", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company:</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="company" 
                        value={clientData.company} 
                        onChange={(e) => handleClientDataChange("company", e.target.value)}
                        readOnly={!isEditMode} 
                        className="flex-1" 
                      />
                      {isEditMode && (
                        <Button variant="outline" size="sm" className="text-xs">add</Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>How did you hear about us?</Label>
                    <Select 
                      value={clientData.referralSource}
                      onValueChange={(value) => handleClientDataChange("referralSource", value)}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {referralSources.map(source => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={clientData.referralDetail}
                      onValueChange={(value) => handleClientDataChange("referralDetail", value)}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select detail" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Concert Other">Concert Other</SelectItem>
                        <SelectItem value="Friend Referral">Friend Referral</SelectItem>
                        <SelectItem value="Google Search">Google Search</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workPhone">Work Phone:</Label>
                    <Input 
                      id="workPhone" 
                      value={clientData.workPhone} 
                      onChange={(e) => handleClientDataChange("workPhone", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workPhoneExt">Work Phone Ext:</Label>
                    <Input 
                      id="workPhoneExt" 
                      value={clientData.workPhoneExt} 
                      onChange={(e) => handleClientDataChange("workPhoneExt", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address:</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={clientData.email} 
                      onChange={(e) => handleClientDataChange("email", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="familyMD">Family MD:</Label>
                    <Input 
                      id="familyMD" 
                      value={clientData.familyMD} 
                      onChange={(e) => handleClientDataChange("familyMD", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referringMD">Referring MD:</Label>
                    <Input 
                      id="referringMD" 
                      value={clientData.referringMD} 
                      onChange={(e) => handleClientDataChange("referringMD", e.target.value)}
                      readOnly={!isEditMode} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="csrName">CSR Name:</Label>
                    <Select 
                      value={clientData.csrName}
                      onValueChange={(value) => handleClientDataChange("csrName", value)}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="- Select -" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">- Select -</SelectItem>
                        <SelectItem value="Sarah">Sarah</SelectItem>
                        <SelectItem value="Michael">Michael</SelectItem>
                        <SelectItem value="Jessica">Jessica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location:</Label>
                    <Select 
                      value={clientData.location}
                      onValueChange={(value) => handleClientDataChange("location", value)}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Save button for edit mode */}
              {isEditMode && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveClientData} className="flex items-center gap-2">
                    <Save size={16} />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule History Tab */}
        <TabsContent value="schedule_history" className="mt-0">
          <Card className="shadow-md border-0">
            <CardHeader className="bg-slate-100 flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Schedule History</CardTitle>
              <Button 
                onClick={handleNewSchedule}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus size={16} />
                New Appointment
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Begin Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientData.scheduleHistory.length > 0 ? (
                    clientData.scheduleHistory.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.title}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.beginTime}</TableCell>
                        <TableCell>{entry.endTime}</TableCell>
                        <TableCell>{entry.provider}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              entry.status === "confirmed" ? "bg-green-100 text-green-800" :
                              entry.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }
                          >
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                              onClick={() => handleEditSchedule(entry.id)}
                            >
                              EDIT
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                              onClick={() => handleDeleteSchedule(entry.id)}
                              disabled={isDeleting}
                            >
                              DELETE
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={8} 
                        className="text-center py-4 text-gray-500"
                        aria-label="No schedule history available"
                      >
                        No schedule history available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order History Tab */}
        <TabsContent value="order_history" className="mt-0">
          <Card className="shadow-md border-0">
            <CardHeader className="bg-slate-100 flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Order History</CardTitle>
              <Button 
                variant="outline" 
                className="bg-green-50 border-green-200 hover:bg-green-100 hover:text-green-700"
                onClick={handleNewOrder}
              >
                + New Order
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {!selectedOrder ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead># of Products</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Total Owed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.length > 0 ? (
                        currentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-blue-600 hover:underline"
                                onClick={() => handleViewOrder(order.orderNumber)}
                              >
                                {order.orderNumber}
                              </Button>
                            </TableCell>
                            <TableCell>{order.orderDate}</TableCell>
                            <TableCell>{order.productCount}</TableCell>
                            <TableCell>{order.totalAmount}</TableCell>
                            <TableCell>{order.totalPaid}</TableCell>
                            <TableCell>{order.totalOwed}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={order.status === "Final Paid" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                onClick={() => handleEditOrder(order)}
                              >
                                EDIT
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                onClick={() => handleDeleteOrder(order.orderNumber)}
                              >
                                DELETE
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                                onClick={() => handlePrintInvoice(order.orderNumber)}
                              >
                                PRINT INVOICE
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell 
                            colSpan={8} 
                            className="text-center py-4 text-gray-500"
                            aria-label="No order history available"
                          >
                            No order history available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4 gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={`w-8 h-8 p-0 ${currentPage === page ? 'bg-primary text-white' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                orderDetail && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">
                        Edit Product(s) - Order Number: {orderDetail.orderNumber}
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCloseOrderDetail}
                      >
                        <X size={16} className="mr-2" />
                        Close
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Product Description</TableHead>
                            <TableHead>QTY</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead>Service Date</TableHead>
                            <TableHead>Referring MD</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderDetail.products.map((product) => (
                            <TableRow key={product.productCode}>
                              <TableCell>{orderDetail.orderDate}</TableCell>
                              <TableCell>
                                <Select defaultValue={product.productCode}>
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={product.productCode}>{product.productCode}</SelectItem>
                                    <SelectItem value="CMO101">CMO101</SelectItem>
                                    <SelectItem value="CMO102">CMO102</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="max-w-[200px] whitespace-pre-line">{product.description}</TableCell>
                              <TableCell>
                                <Select defaultValue={product.quantity.toString()}>
                                  <SelectTrigger className="w-[60px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>${product.unitPrice.toFixed(2)}</TableCell>
                              <TableCell>${(product.quantity * product.unitPrice).toFixed(2)}</TableCell>
                              <TableCell>{product.serviceDate}</TableCell>
                              <TableCell>{product.referringMD}</TableCell>
                              <TableCell className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                  onClick={() => handleEditProduct(orderDetail.orderNumber, product.productCode)}
                                >
                                  EDIT
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                  onClick={() => handleDeleteProduct(orderDetail.orderNumber, product.productCode)}
                                >
                                  DELETE
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Payment Method:</Label>
                          <Select defaultValue={orderDetail.paymentMethod}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cheque">Cheque</SelectItem>
                              <SelectItem value="Credit Card">Credit Card</SelectItem>
                              <SelectItem value="Debit">Debit</SelectItem>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Insurance">Insurance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="dispenseDate">Dispense Date:</Label>
                          <Input 
                            id="dispenseDate" 
                            type="date" 
                            defaultValue={orderDetail.dispenseDate || ""} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCloseOrderDetail}
                      >
                        Cancel
                      </Button>
                      <Button>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact History Tab */}
        <TabsContent value="contact_history" className="mt-0">
          <Card className="shadow-md border-0">
            <CardHeader className="bg-slate-100">
              <CardTitle className="text-lg">Contact History</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Add Contact Note */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactDate">DATE:</Label>
                    <Input 
                      id="contactDate" 
                      type="date" 
                      value={contactForm.date}
                      onChange={(e) => handleContactFormChange("date", e.target.value)}
                      aria-required="true"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea 
                      className="min-h-[200px]" 
                      value={contactForm.note}
                      onChange={(e) => handleContactFormChange("note", e.target.value)}
                      placeholder="Enter contact notes here..."
                      aria-required="true"
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 flex items-center gap-2 text-sm">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteContact}
                      disabled={isDeleting}
                    >
                      <Trash size={16} className="mr-2" />
                      {isDeleting ? "Deleting..." : "DELETE"}
                    </Button>
                    <Button 
                      onClick={handleSaveContact}
                      disabled={isSaving}
                    >
                      <Save size={16} className="mr-2" />
                      {isSaving ? "Saving..." : "SAVE"}
                    </Button>
                  </div>
                </div>
                
                {/* Right Column - Contact Archive */}
                <div className="space-y-4">
                  <Label>Contact Archive</Label>
                  <div 
                    className="border rounded-md h-[250px] overflow-y-auto p-2"
                    aria-label={clientData.contactHistory.length === 0 ? "No contact history available" : "Contact history list"}
                  >
                    {clientData.contactHistory.length > 0 ? (
                      clientData.contactHistory.map((contact, index) => (
                        <div key={index} className="border-b pb-2 mb-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{contact.date}</span>
                          </div>
                          <p className="text-sm mt-1">{contact.note}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">No contact history available</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Action Buttons */}
      <div className="mt-8 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={handleToggleEditMode}
          >
            {isEditMode ? "Cancel Edit" : "Edit"}
          </Button>
          
          {isEditMode && (
            <Button 
              variant="outline"
              onClick={handleSaveClientData}
            >
              Update
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleDeleteClient}
            disabled={isDeleting}
          >
            <Trash size={16} />
            Delete
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleCancel}
          >
            <X size={16} />
            Cancel
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleNext}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Button variant="link" className="p-0 h-auto text-blue-600 hover:underline">
              View Insurance
            </Button>
            <Select onValueChange={handleViewInsurance}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="--Please Select--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">--Please Select--</SelectItem>
                <SelectItem value="sunlife">SunLife</SelectItem>
                <SelectItem value="manulife">Manulife</SelectItem>
                <SelectItem value="canada_life">Canada Life</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 items-center">
            <Select>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="SUPPLEMENTARY HEALTH BENEFIT" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleGeneratePdf}>
              Generate pdf form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 