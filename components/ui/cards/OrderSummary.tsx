import * as React from "react";
import { ShoppingBag, Calendar, ChevronRight } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Order status type
 */
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "delivered";

/**
 * Order payment status type
 */
export type PaymentStatus = "paid" | "unpaid" | "partial" | "refunded";

/**
 * Order item interface
 */
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

/**
 * Order data interface
 */
export interface OrderData {
  id: string;
  orderNumber: string;
  clientName: string;
  clientId: string;
  date: string | Date;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items?: OrderItem[];
  total: number;
  notes?: string;
}

/**
 * Props for the OrderSummary component
 */
export interface OrderSummaryProps {
  /**
   * Order data to display
   */
  order: OrderData;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * If true, makes the entire card clickable
   */
  clickable?: boolean;
  
  /**
   * Callback when view details button is clicked
   */
  onViewDetails?: (order: OrderData) => void;
  
  /**
   * Whether to show order items
   */
  showItems?: boolean;
  
  /**
   * Whether to show the action button
   */
  showActionButton?: boolean;
}

/**
 * OrderSummary Component
 * 
 * Displays order information in a card format.
 * 
 * @example
 * ```tsx
 * <OrderSummary 
 *   order={order}
 *   onViewDetails={(order) => router.push(`/orders/${order.id}`)}
 * />
 * ```
 */
export function OrderSummary({
  order,
  className,
  clickable = false,
  onViewDetails,
  showItems = false,
  showActionButton = true,
}: OrderSummaryProps) {
  const handleCardClick = () => {
    if (clickable && onViewDetails) {
      onViewDetails(order);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(order);
    }
  };

  // Format date
  const formattedDate = order.date instanceof Date
    ? order.date.toLocaleDateString()
    : new Date(order.date).toLocaleDateString();

  // Status badge variants
  const statusVariants: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    delivered: "bg-purple-100 text-purple-800 border-purple-200",
  };

  // Payment status badge variants
  const paymentStatusVariants: Record<PaymentStatus, string> = {
    paid: "bg-green-100 text-green-800 border-green-200",
    unpaid: "bg-red-100 text-red-800 border-red-200",
    partial: "bg-amber-100 text-amber-800 border-amber-200",
    refunded: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-md", 
        clickable && "cursor-pointer",
        className
      )}
      onClick={clickable ? handleCardClick : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <CardTitle className="text-lg flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5 text-muted-foreground" />
              Order #{order.orderNumber}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {order.clientName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline"
              className={statusVariants[order.status]}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Badge 
              variant="outline"
              className={paymentStatusVariants[order.paymentStatus]}
            >
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div className="flex items-center text-sm">
            <Calendar size={16} className="mr-2 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
          <div className="text-lg font-semibold">
            ${order.total.toFixed(2)}
          </div>
        </div>
        
        {showItems && order.items && order.items.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Items</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span>{item.name}</span>
                    <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                  </div>
                  <div>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {order.notes && (
          <div className="mt-3 text-sm">
            <h4 className="font-medium mb-1">Notes</h4>
            <p className="text-muted-foreground">{order.notes}</p>
          </div>
        )}
      </CardContent>
      
      {showActionButton && onViewDetails && (
        <CardFooter className="pb-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleViewDetails}
          >
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
