"use client";

import React from "react";
import InvoiceTemplate from "@/components/ui/invoice/InvoiceTemplate";
import { 
  testPaymentData, 
  testClinicInfo, 
  testClientInfo,
  testOtherClinicInfo 
} from "@/lib/api/testPaymentData";

export default function TestInvoicePage() {
  return (
    <div className="space-y-12">
      {/* BodyBliss One Care Format Test */}
      <div>
        <h2 className="text-2xl font-bold mb-4">BodyBliss One Care Format Test</h2>
        <InvoiceTemplate
          payment={testPaymentData}
          clinicInfo={testClinicInfo}
          clientInfo={testClientInfo}
        />
      </div>

      {/* Other Clinic Format Test */}
      <div className="mt-12 pt-12 border-t">
        <h2 className="text-2xl font-bold mb-4">Other Clinic Format Test (Same Universal Format)</h2>
        <InvoiceTemplate
          payment={{
            ...testPaymentData,
            clinic: "Century Care",
            invoiceNumber: "CC-001234"
          }}
          clinicInfo={testOtherClinicInfo}
          clientInfo={testClientInfo}
        />
      </div>
    </div>
  );
}
