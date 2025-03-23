"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePicker } from "@/app/components/ui/date-picker";
import { ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";

export default function NewPaymentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [formState, setFormState] = useState({
    clientId: "",
    clientName: "",
    invoiceNumber: "",
    paymentMethod: "",
    amount: "",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    if (!formState.clientName || !formState.amount || !formState.paymentMethod || !paymentDate) {
      alert("Please fill out all required fields");
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API request
    setTimeout(() => {
      // In a real app, this would be an API call
      alert("Payment recorded successfully!");
      router.push("/payments");
    }, 1000);
  };

  // Client search feature (mock)
  const handleClientSearch = () => {
    if (!formState.clientId) return;
    
    // Simulate API request to fetch client
    setTimeout(() => {
      // Mock data
      if (formState.clientId === "21770481") {
        setFormState(prev => ({
          ...prev,
          clientName: "HEALTH BIOFORM",
          invoiceNumber: "87572700"
        }));
      } else {
        alert("Client not found. Please check the ID.");
      }
    }, 500);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/payments" className="hover:text-primary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Record Payment</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Record a new payment from a client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Client Information</h3>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="clientId">Client ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="clientId" 
                      name="clientId"
                      value={formState.clientId}
                      onChange={handleChange}
                      placeholder="Enter client ID"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClientSearch}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input 
                  id="clientName" 
                  name="clientName"
                  value={formState.clientName}
                  onChange={handleChange}
                  placeholder="Client name"
                  required
                />
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input 
                    id="invoiceNumber" 
                    name="invoiceNumber"
                    value={formState.invoiceNumber}
                    onChange={handleChange}
                    placeholder="Enter invoice number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    name="amount"
                    value={formState.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <DatePicker 
                    date={paymentDate} 
                    setDate={setPaymentDate} 
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={formState.paymentMethod} 
                    onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                    required
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit card">Credit Card</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input 
                  id="notes" 
                  name="notes"
                  value={formState.notes}
                  onChange={handleChange}
                  placeholder="Additional notes (optional)"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <CreditCard className="h-4 w-4" />
              {isSubmitting ? "Processing..." : "Record Payment"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
} 