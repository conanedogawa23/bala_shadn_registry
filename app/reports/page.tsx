"use client";

import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Printer, FileText, Calendar, Download, ChevronRight } from "lucide-react";
import { DatePicker } from "@/app/components/ui/date-picker";

export default function ReportsPage() {
  const [selectedClinic, setSelectedClinic] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<string>("account-summary");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data
  const clinics = [
    { id: "all", name: "All Clinics" },
    { id: "bodybliss", name: "Body Bliss" },
    { id: "orthocare", name: "OrthoCarePlus" },
    { id: "foothealth", name: "Foot Health Center" }
  ];

  const statusOptions = [
    { id: "all", label: "All Statuses" },
    { id: "complete", label: "Complete" },
    { id: "partial", label: "Partially Paid" },
    { id: "unpaid", label: "Unpaid" }
  ];

  const reportTypes = [
    { 
      id: "account-summary", 
      name: "Account Summary Report", 
      description: "Comprehensive summary of all account activities",
      icon: <FileText className="h-5 w-5" />
    },
    { 
      id: "account-summary-2", 
      name: "Account Summary Report 2", 
      description: "Detailed breakdown of accounts with extended metrics",
      icon: <FileText className="h-5 w-5" />
    },
    { 
      id: "payment-summary", 
      name: "Payment Summary by Day Range", 
      description: "Analysis of payments received within a specific date range",
      icon: <Calendar className="h-5 w-5" />
    },
    { 
      id: "time-sheet", 
      name: "Time Sheet", 
      description: "Staff work hours and productivity metrics",
      icon: <Calendar className="h-5 w-5" />
    },
    { 
      id: "copay-summary", 
      name: "Co Pay Summary", 
      description: "Summary of all co-payments collected",
      icon: <FileText className="h-5 w-5" />
    },
    { 
      id: "marketing-budget", 
      name: "Marketing Budget Summary", 
      description: "Overview of marketing expenditures and allocations",
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // In a real application, this would generate and download the report
      alert(`Generated ${selectedReport} report for ${selectedClinic} clinic with status ${selectedStatus}`);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection Panel */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Report Type</CardTitle>
              <CardDescription>Select the type of report to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {reportTypes.map((report) => (
                <div 
                  key={report.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedReport === report.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className={`${selectedReport === report.id ? 'text-primary' : 'text-muted-foreground'}`}>
                    {report.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  {selectedReport === report.id && (
                    <ChevronRight className="ml-auto text-primary h-5 w-5" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Report Parameters Panel */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Report Parameters</CardTitle>
              <CardDescription>Configure the parameters for your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinic" className="text-sm font-medium">Clinic</Label>
                  <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                    <SelectTrigger id="clinic" className="h-10 mt-1">
                      <SelectValue placeholder="Select clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium">Order Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger id="status" className="h-10 mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-from" className="text-sm font-medium">Date From</Label>
                  <DatePicker 
                    date={dateFrom} 
                    setDate={setDateFrom} 
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-sm font-medium">Date To</Label>
                  <DatePicker 
                    date={dateTo} 
                    setDate={setDateTo} 
                    className="w-full mt-1"
                  />
                </div>
              </div>

              {/* Report-specific fields */}
              {selectedReport === "account-summary" && (
                <div>
                  <Label htmlFor="account-type" className="text-sm font-medium">Account Type</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="account-type" className="h-10 mt-1">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="provider">Provider</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedReport === "payment-summary" && (
                <div>
                  <Label htmlFor="payment-method" className="text-sm font-medium">Payment Method</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="payment-method" className="h-10 mt-1">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedReport === "time-sheet" && (
                <div>
                  <Label htmlFor="staff-member" className="text-sm font-medium">Staff Member</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="staff-member" className="h-10 mt-1">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      <SelectItem value="doctor1">Dr. Smith</SelectItem>
                      <SelectItem value="doctor2">Dr. Johnson</SelectItem>
                      <SelectItem value="tech1">Tech Williams</SelectItem>
                      <SelectItem value="tech2">Tech Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t py-4 flex justify-between gap-2">
              <Button variant="outline">Reset</Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Preview
                </Button>
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    "Generating..."
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 