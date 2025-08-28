import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { EyeIcon, PackageCheckIcon, PrinterIcon } from "lucide-react"

/**
 * Represents the status of an order
 */
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded"

/**
 * Represents an individual item in an order
 */
export interface OrderItem {
  /** Unique identifier for the item */
  id: string
  /** Name of the product */
  name: string
  /** Number of units ordered */
  quantity: number
  /** Price per unit */
  price: number
}

/**
 * Props for the OrderSummary component
 */
export interface OrderSummaryProps {
  /** Unique identifier for the order */
  orderId: string
  /** Date when the order was placed */
  orderDate: Date
  /** Name of the customer who placed the order */
  customerName: string
  /** Email address of the customer */
  customerEmail?: string
  /** Current status of the order */
  status: OrderStatus
  /** Array of items included in the order */
  items: OrderItem[]
  /** Optional additional CSS classes */
  className?: string
  /** Handler for viewing order details */
  onViewDetails?: (orderId: string) => void
  /** Handler for processing the order */
  onProcess?: (orderId: string) => void
}

/**
/**
 * Maps order status to appropriate badge styling
 */
function getStatusBadgeVariant(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "completed":
      return "outline"; // Change from "success" to "outline"
    case "cancelled":
      return "destructive";
    case "refunded":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Maps order status to human-readable text
 */
const getStatusText = (status: OrderStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

/**
 * A component displaying a summary of an order with key information and actions
 * 
 * @example
 * ```tsx
 * <OrderSummary
 *   orderId="ORD-123456"
 *   orderDate={new Date("2023-09-15")}
 *   customerName="Jane Doe"
 *   customerEmail="jane@example.com"
 *   status="processing"
 *   items={[
 *     { id: "1", name: "Product A", quantity: 2, price: 25.99 },
 *     { id: "2", name: "Product B", quantity: 1, price: 35.50 }
 *   ]}
 *   onViewDetails={(id) => router.push(`/orders/${id}`)}
 *   onProcess={(id) => markAsProcessed(id)}
 * />
 * ```
 */
export function OrderSummary({
  orderId,
  orderDate,
  customerName,
  customerEmail,
  status,
  items,
  className,
  onViewDetails,
  onProcess,
}: OrderSummaryProps) {
  // Calculate order totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const total = subtotal

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold" id={`order-${orderId}`}>Order #{orderId}</h3>
            <Badge variant={getStatusBadgeVariant(status) as "default" | "secondary" | "destructive" | "outline"}>
              {getStatusText(status)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {formatDate(orderDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">{customerName}</p>
          {customerEmail && (
            <p className="text-sm text-muted-foreground">{customerEmail}</p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Order Summary</h4>
            <div className="rounded-md border p-2 bg-muted/30">
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Items</span>
                <span>{itemCount} items</span>
              </div>
              <Separator className="my-1" />
              
              {/* Show first 2 items + summary if more */}
              <div className="space-y-1 py-1 my-1">
                {items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                {items.length > 2 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>+{items.length - 2} more items</span>
                  </div>
                )}
              </div>
              
              <Separator className="my-1" />
              
              <div className="flex justify-between font-medium py-1">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails?.(orderId)}
          aria-describedby={`order-${orderId}`}
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          View Details
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            aria-label={`Print order ${orderId}`}
          >
            <PrinterIcon className="h-4 w-4" />
          </Button>
          {status === "pending" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onProcess?.(orderId)}
              aria-describedby={`order-${orderId}`}
            >
              <PackageCheckIcon className="h-4 w-4 mr-2" />
              Process Order
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

