import { Payment } from "@/lib/data/mockDataService";

// Sample payment data matching the BodyBliss format for testing
export const testPaymentData: Payment = {
  id: "test-payment-001",
  paymentDate: "2025-06-12",
  clientName: "DAVID MAK",
  clientId: "CLT001",
  invoiceNumber: "008947",
  orderNumber: "ORD001",
  paymentMethod: "VISA",
  amount: 720.00,
  subtotal: 720.00,
  taxAmount: 0,
  taxRate: 0.13,
  discountAmount: 0,
  netAmount: 720.00,
  status: "completed",
  clinic: "BodyBlissOneCare",
  clinicAddress: "1585 Markham Rd, Suite 401, Scarborough, ON M1B2W1",
  providerName: "Dr. Leung,J.",
  paymentReference: "REF001",
  invoiceDate: "2025-06-12",
  dueDate: "2025-06-12",
  lineItems: [
    {
      id: "item-001",
      serviceCode: "KB001",
      serviceName: "Knee Brace",
      description: "Knee Brace Support",
      quantity: 2,
      unitPrice: 360.00,
      totalPrice: 720.00,
      serviceDate: "2025-06-12",
      taxable: false
    }
  ],
  notes: "Payment processed successfully",
  paymentType: "Credit",
  insuranceInfo: undefined
};

// Sample clinic info for testing
export const testClinicInfo = {
  name: "BodyBlissOneCare",
  displayName: "BodyBliss One Care",
  address: "1585 Markham Rd, Suite 401",
  city: "Scarborough",
  province: "ON", 
  postalCode: "M1B2W1",
  phone: "416.479.4467",
  fax: "416.850.5370"
};

// Sample client info for testing
export const testClientInfo = {
  name: "DAVID MAK",
  address: "106 SEEDLING CRESCENT Stouffville Ontario L4A 4V5",
  city: "Stouffville",
  province: "Ontario",
  postalCode: "L4A 4V5"
};

// Test other clinic format
export const testOtherClinicInfo = {
  name: "Century Care",
  displayName: "Century Care Clinic",
  address: "123 Main Street",
  city: "Toronto",
  province: "ON",
  postalCode: "M5V 1A1",
  phone: "416.123.4567",
  fax: "416.123.4568"
};
