"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Search, CreditCard } from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

interface PaymentFormData {
  clientId: string;
  clientName: string;
  amount: string;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  notes: string;
}

export default function ClinicPaymentsNewPage() {
  const router = useRouter();
  const params = useParams();
  const clinic = params.clinic as string;
  
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    clientId: "",
    clientName: "",
    amount: "",
    paymentMethod: "credit-card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    notes: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClientSearch, setShowClientSearch] = useState(false);
  
  // Mock clients data for the clinic
  const clinicClients = [
    { id: "21770481", name: "HEALTH BIOFORM", email: "info@healthbioform.com" },
    { id: "16883465", name: "ROBINSON, DAVID", email: "d.robinson@email.com" },
    { id: "23456789", name: "SMITH, JOHN", email: "j.smith@email.com" },
    { id: "34567890", name: "JOHNSON, MARY", email: "m.johnson@email.com" }
  ];
  
  const filteredClients = clinicClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleClientSelect = (client: { id: string; name: string }) => {
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name
    }));
    setShowClientSearch(false);
    setSearchQuery("");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to create the payment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to clinic payments page
      router.push(`/clinic/${clinic}/payments`);
    } catch (error) {
      console.error("Failed to process payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    router.push(`/clinic/${clinic}/payments`);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to {clinic} Payments
        </Button>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary }}>
          New Payment - {clinic}
        </h1>
        <p className="text-gray-600 mt-1">
          Process a new payment for this clinic
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Client Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client">Selected Client *</Label>
              <div className="flex gap-2">
                <Input
                  id="client"
                  value={formData.clientName}
                  placeholder="Click 'Search Client' to select"
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowClientSearch(!showClientSearch)}
                >
                  Search Client
                </Button>
              </div>
            </div>
            
            {showClientSearch && (
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="mb-3">
                  <Input
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredClients.map(client => (
                    <div
                      key={client.id}
                      className="flex justify-between items-center p-2 hover:bg-white rounded cursor-pointer"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                      <Button size="sm" variant="ghost">Select</Button>
                    </div>
                  ))}
                  {filteredClients.length === 0 && (
                    <div className="text-center py-4 text-gray-500">No clients found</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="debit-card">Debit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.paymentMethod === 'credit-card' || formData.paymentMethod === 'debit-card') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional payment notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <Card className="shadow-sm">
          <CardFooter className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.clientName || !formData.amount}
              className="flex items-center gap-2"
              style={{ 
                background: themeColors.gradient.primary,
                boxShadow: themeColors.shadow.button
              }}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Processing...' : 'Process Payment'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
} 