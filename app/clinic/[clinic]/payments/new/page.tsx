'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, DollarSign, User, CreditCard, AlertCircle } from 'lucide-react';
import { slugToClinic } from '@/lib/data/clinics';
import { generateLink } from '@/lib/route-utils';
import { 
  usePaymentsByClinic,
  PaymentApiService, 
  PaymentMethod, 
  PaymentType,
  type CreatePaymentRequest,
  type PaymentAmounts
} from '@/lib/hooks';

// Line item interface for the form
interface FormLineItem {
  id: string;
  serviceCode: string;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;

}

// Form data interface
interface PaymentFormData {
  clientId: number | '';
  clientName: string;
  orderNumber: string;
  paymentMethod: PaymentMethod | '';
  paymentType: PaymentType | '';
  notes: string;
  referringNo: string;
  lineItems: FormLineItem[];
}

export default function NewPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicSlug = Array.isArray(params.clinic) ? params.clinic[0] : params.clinic as string;
  const clinic = slugToClinic(clinicSlug);

  // Payment hooks
  const { createPayment } = usePaymentsByClinic(clinic?.name || '', {});

  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    clientId: '',
    clientName: '',
    orderNumber: '',
    paymentMethod: '',
    paymentType: '',
    notes: '',
    referringNo: '',
    lineItems: [
      {
        id: 'item1',
        serviceCode: 'SVC001',
        serviceName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,

      }
    ]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate form from URL parameters
  useEffect(() => {
    const clientId = searchParams.get('clientId');
    const clientName = searchParams.get('clientName');
    const orderNumber = searchParams.get('orderNumber');
    const amount = searchParams.get('amount');

    if (clientId || clientName || orderNumber || amount) {
      setFormData(prev => ({
        ...prev,
        clientId: clientId ? parseInt(clientId, 10) : prev.clientId,
        clientName: clientName || prev.clientName,
        orderNumber: orderNumber || prev.orderNumber,
        lineItems: amount ? [{
          ...prev.lineItems[0],
          serviceName: 'Payment Processing',
          description: `Payment for order ${orderNumber || ''}`.trim(),
          unitPrice: parseFloat(amount) || 0,
          totalPrice: parseFloat(amount) || 0
        }] : prev.lineItems
      }));
    }
  }, [searchParams]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.push(generateLink('clinic', 'payments', clinicSlug));
  }, [router, clinicSlug]);

  // Form handlers
  const handleInputChange = useCallback((field: keyof PaymentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  }, []);

  const handleLineItemChange = useCallback((index: number, field: keyof FormLineItem, value: string | number | boolean) => {
    setFormData(prev => {
      const updatedItems = [...prev.lineItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };

      // Recalculate total price when quantity or unit price changes
      if (field === 'quantity' || field === 'unitPrice') {
        updatedItems[index].totalPrice = Number(updatedItems[index].quantity) * Number(updatedItems[index].unitPrice);
      }

      return {
        ...prev,
        lineItems: updatedItems
      };
    });
  }, []);

  const addLineItem = useCallback(() => {
    const newItem: FormLineItem = {
      id: `item${formData.lineItems.length + 1}`,
      serviceCode: `SVC${(formData.lineItems.length + 1).toString().padStart(3, '0')}`,
      serviceName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };

    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  }, [formData.lineItems.length]);

  const removeLineItem = useCallback((index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  }, [formData.lineItems.length]);

  // Calculation functions
  const calculateTotals = useCallback(() => {
    const total = formData.lineItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    return { subtotal: total, total };
  }, [formData.lineItems]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!clinic?.name) {
      setError('Clinic information not found');
      return;
    }

    if (!formData.clientId || !formData.clientName || !formData.paymentMethod || !formData.paymentType) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.lineItems.some(item => !item.serviceName || item.quantity <= 0 || item.unitPrice < 0)) {
      setError('Please ensure all line items have valid service names, quantities, and prices');
      return;
    }

    setIsLoading(true);

    try {
      const { total } = calculateTotals();

      // Convert form line items to API format
      const lineItems = formData.lineItems.map(item => ({
        id: item.id,
        serviceCode: item.serviceCode,
        serviceName: item.serviceName,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice)
      }));

      // Create payment amounts structure
      const amounts: PaymentAmounts = {
        totalPaymentAmount: total,
        totalPaid: 0, // Will be updated when actual payments are made
        totalOwed: total,
        
        // Canadian Healthcare Payment Types - all zero initially
        popAmount: 0,
        popfpAmount: 0,
        dpaAmount: 0,
        dpafpAmount: 0,
        
        // Coordination of Benefits
        cob1Amount: 0,
        cob2Amount: 0,
        cob3Amount: 0,
        
        // Insurance Payments
        insurance1stAmount: 0,
        insurance2ndAmount: 0,
        insurance3rdAmount: 0,
        
        // Other Amounts
        refundAmount: 0,
        salesRefundAmount: 0,
        writeoffAmount: 0,
        noInsurFpAmount: 0,
        badDebtAmount: 0
      };

      // Create payment request
      const paymentData: CreatePaymentRequest = {
        orderNumber: formData.orderNumber || undefined,
        clientId: Number(formData.clientId),
        clientName: formData.clientName,
        clinicName: clinic.name,
        paymentMethod: formData.paymentMethod as PaymentMethod,
        paymentType: formData.paymentType as PaymentType,
        amounts,
        notes: formData.notes || undefined,
        referringNo: formData.referringNo || undefined
      };

      // Submit payment
      await createPayment(paymentData);

      // Navigate back to payments list
      router.push(generateLink('clinic', 'payments', clinicSlug));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const { total } = calculateTotals();

  if (!clinic) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Clinic Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">The specified clinic could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Payments
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Payment</h1>
          <p className="text-sm text-gray-600 mt-1">{clinic.name}</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="clientId">Client ID *</Label>
                <Input
                  id="clientId"
                  type="number"
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', Number(e.target.value) || '')}
                  placeholder="Enter client ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="orderNumber">Order Number (Optional)</Label>
              <Input
                id="orderNumber"
                value={formData.orderNumber}
                onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                placeholder="Enter related order number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={20} />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                    <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
                    <SelectItem value={PaymentMethod.DEBIT}>Debit</SelectItem>
                    <SelectItem value={PaymentMethod.CHEQUE}>Cheque</SelectItem>
                    <SelectItem value={PaymentMethod.INSURANCE}>Insurance</SelectItem>
                    <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                    <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentType">Payment Type *</Label>
                <Select value={formData.paymentType} onValueChange={(value) => handleInputChange('paymentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentType.POP}>Patient Out of Pocket (POP)</SelectItem>
                    <SelectItem value={PaymentType.POPFP}>POP Final Payment</SelectItem>
                    <SelectItem value={PaymentType.DPA}>Direct Payment Authorization (DPA)</SelectItem>
                    <SelectItem value={PaymentType.DPAFP}>DPA Final Payment</SelectItem>
                    <SelectItem value={PaymentType.COB_1}>Coordination of Benefits - Primary</SelectItem>
                    <SelectItem value={PaymentType.COB_2}>Coordination of Benefits - Secondary</SelectItem>
                    <SelectItem value={PaymentType.COB_3}>Coordination of Benefits - Tertiary</SelectItem>
                    <SelectItem value={PaymentType.INSURANCE_1ST}>1st Insurance Payment</SelectItem>
                    <SelectItem value={PaymentType.INSURANCE_2ND}>2nd Insurance Payment</SelectItem>
                    <SelectItem value={PaymentType.INSURANCE_3RD}>3rd Insurance Payment</SelectItem>
                    <SelectItem value={PaymentType.NO_INSUR_FP}>No Insurance Final Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="referringNo">Referring Number</Label>
                <Input
                  id="referringNo"
                  value={formData.referringNo}
                  onChange={(e) => handleInputChange('referringNo', e.target.value)}
                  placeholder="Enter referring number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={20} />
                Service Line Items
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.lineItems.map((item, index) => (
              <div key={item.id} className="grid gap-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Service Item {index + 1}</h4>
                  {formData.lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label htmlFor={`serviceCode-${index}`}>Service Code</Label>
                    <Input
                      id={`serviceCode-${index}`}
                      value={item.serviceCode}
                      onChange={(e) => handleLineItemChange(index, 'serviceCode', e.target.value)}
                      placeholder="SVC001"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`serviceName-${index}`}>Service Name *</Label>
                    <Input
                      id={`serviceName-${index}`}
                      value={item.serviceName}
                      onChange={(e) => handleLineItemChange(index, 'serviceName', e.target.value)}
                      placeholder="Enter service name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unitPrice-${index}`}>Unit Price *</Label>
                    <Input
                      id={`unitPrice-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    placeholder="Enter service description"
                    rows={2}
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">Total Price:</span>
                  <span className="font-medium">{PaymentApiService.formatCurrency(item.totalPrice)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{PaymentApiService.formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes or comments"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            {isLoading ? 'Creating Payment...' : 'Create Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
} 