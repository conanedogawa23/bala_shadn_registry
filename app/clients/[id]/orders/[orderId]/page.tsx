"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

interface OrderProduct {
  description: string;
  quantity: number;
  price: number;
  amount: number;
  serviceDate: string;
}

interface OrderDetails {
  orderNumber: string;
  date: string;
  customerName: string;
  referringMD: string;
  address: string;
  items: OrderProduct[];
  total: number;
  amountDue: number;
  dispenseDate: string | null;
  paymentMethod: string;
}

export default function OrderInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, this would fetch data from an API
    const fetchOrderDetails = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock data based on the screenshot
        setOrderDetails({
          orderNumber: orderId || "91243654",
          date: "January 24, 2013",
          customerName: "HEALTH BIOFORM",
          referringMD: "NONE",
          address: "6033 Shawson drive Mississauga Ontario L5T 1H8",
          items: [
            {
              description: "Custom Made Orthotics",
              quantity: 1,
              price: 90.00,
              amount: 90.00,
              serviceDate: "1/24/20"
            }
          ],
          total: 90.00,
          amountDue: 90.00,
          dispenseDate: null,
          paymentMethod: "Cheque"
        });
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <p className="text-center text-gray-500">Loading order details...</p>
      </div>
    );
  }
  
  if (!orderDetails) {
    return (
      <div className="container mx-auto py-12 px-4">
        <p className="text-center text-gray-500">Order not found</p>
        <div className="flex justify-center mt-4">
          <Button onClick={handleBack}>Back to Client</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation and Print Controls - Hidden during print */}
      <div className="flex justify-between mb-8 print:hidden">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Client
        </Button>
        
        <Button 
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer size={16} />
          Print Invoice
        </Button>
      </div>
      
      {/* Invoice Content */}
      <Card className="shadow-md border-0 max-w-4xl mx-auto print:shadow-none print:border print:border-gray-200">
        <CardContent className="p-8">
          {/* Company Header */}
          <div className="flex flex-col items-center mb-8 border-b pb-4">
            <h1 className="text-4xl font-bold text-gray-700" style={{ color: themeColors.primary }}>
              bodybliss
            </h1>
            <p className="text-sm text-gray-600 mt-1">A3-220 Duncan Mill Road Toronto, Ontario M3B3J5</p>
            <p className="text-sm text-gray-600">Tel # 416-224-9900 Fax 416-849-0363</p>
          </div>
          
          {/* Order Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold uppercase">ORDER</h2>
          </div>
          
          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-2">
            <div>
              <p className="font-semibold">Order No. {orderDetails.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Date: {orderDetails.date}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-2">
            <div>
              <p className="font-semibold">Customer Name: {orderDetails.customerName}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Referring MD: {orderDetails.referringMD}</p>
            </div>
          </div>
          
          <div className="mb-6 border-b pb-2">
            <p className="font-semibold">Address: {orderDetails.address}</p>
          </div>
          
          {/* Item Details */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead className="border-b-2 border-t-2 border-gray-800">
                <tr className="text-left">
                  <th className="py-2 px-4 font-semibold">ITEM DESCRIPTION</th>
                  <th className="py-2 px-4 font-semibold text-center">QTY</th>
                  <th className="py-2 px-4 font-semibold text-right">PRICE</th>
                  <th className="py-2 px-4 font-semibold text-right">AMOUNT</th>
                  <th className="py-2 px-4 font-semibold text-center">SERVICE DATE</th>
                </tr>
              </thead>
              <tbody className="border-b-2 border-gray-800">
                {orderDetails.items.map((item, index) => (
                  <tr key={index} className="border-dashed border-b border-gray-400">
                    <td className="py-4 px-4">{item.description}</td>
                    <td className="py-4 px-4 text-center">{item.quantity}</td>
                    <td className="py-4 px-4 text-right">${item.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right">${item.amount.toFixed(2)}</td>
                    <td className="py-4 px-4 text-center">{item.serviceDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="text-right">
              <p className="font-bold mb-1">Total: ${orderDetails.total.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="mb-8">
            <div className="mb-1">
              <p><span className="font-semibold">Amount:</span> ${orderDetails.total.toFixed(2)}</p>
            </div>
            <div className="mb-1">
              <p><span className="font-semibold">Amount Due:</span> ${orderDetails.amountDue.toFixed(2)}</p>
            </div>
            {orderDetails.dispenseDate && (
              <div className="mb-1">
                <p><span className="font-semibold">Dispense Date:</span> {orderDetails.dispenseDate}</p>
              </div>
            )}
            <div className="mb-1">
              <p><span className="font-semibold">Payment Method:</span> {orderDetails.paymentMethod}</p>
            </div>
          </div>
          
          {/* Legal Text */}
          <div className="text-sm text-gray-700 mb-8">
            <p className="mb-2">
              I certify and affirm that I am ordering the above item(s) from Body Bliss. I am also aware that I am responsible for the above item(s) and would forward to Body Bliss my payment in the event that my insurer does not allow any assignment of benefits.
            </p>
            <p>
              I also authorize Body Bliss to provide any or all medical information needed by my insurer or any third party payor to help in processing my insurance claim. This purchase order may be signed by the policyholder, the client, or the guardian and will have the same authority whether in its original or photocopy form.
            </p>
          </div>
          
          {/* Signature Line */}
          <div className="mt-16 pt-8 border-t border-dashed border-gray-400">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">Customer Signature</p>
              </div>
              <div>
                <p className="font-semibold">Date</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 0.5cm;
          }
          body {
            font-size: 12pt;
          }
          .print\\:hidden {
            display: none !important;
          }
          .card {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
} 