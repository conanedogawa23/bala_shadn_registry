import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUp, ArrowDown, ArrowRight, LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Stats card variants
 */
const statsCardVariants = cva("border", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground border-border",
      primary: "bg-primary/5 border-primary/20 text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      info: "bg-blue-500/5 border-blue-500/20 text-blue-700",
      success: "bg-green-500/5 border-green-500/20 text-green-700",
      warning: "bg-yellow-500/5 border-yellow-500/20 text-yellow-700",
      danger: "bg-red-500/5 border-red-500/20 text-red-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Icon container variants
 */
const iconContainerVariants = cva(
  "h-8 w-8 rounded-md flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/20 text-primary",
        secondary: "bg-secondary/50 text-secondary-foreground",
        info: "bg-blue-500/20 text-blue-500",
        success: "bg-green-500/20 text-green-500",
        warning: "bg-yellow-500/20 text-yellow-500",
        danger: "bg-red-500/20 text-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Trend indicator type
 */
export type TrendIndicator = "up" | "down" | "neutral";

/**
 * Props for the StatsCard component
 */
export interface StatsCardProps extends VariantProps<typeof statsCardVariants> {
  /**
   * Title of the stat
   */
  title: string;
  
  /**
   * Value to display
   */
  value: string | number;
  
  /**
   * Icon to display
   */
  icon?: LucideIcon | React.ReactNode;
  
  /**
   * Optional description or subtitle
   */
  description?: string;
  
  /**
   * Optional trend percentage or indicator
   */
  trend?: number | TrendIndicator;
  
  /**
   * Trend indicator (up/down/neutral)
   */
  trendIndicator?: TrendIndicator;
  
  /**
   * Flag to indicate if increase is good (green) or bad (red)
   */
  increaseIsGood?: boolean;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;

  /**
   * Time period for the stats (like "Last 7 days")
   */
  period?: string;

  /**
   * Optional change text description
   */
  changeText?: string;
}

/**
 * StatsCard Component
 * 
 * Displays a statistic with optional icon, trend indicator, and description.
 * 
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Orders"
 *   value="1,234"
 *   icon={ShoppingBag}
 *   trend={12.5}
 *   trendIndicator="up"
 *   variant="primary"
 * />
 * ```
 */
export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  trendIndicator: providedTrendIndicator = "neutral",
  increaseIsGood = true,
  variant = "default",
  className,
  footer,
  period,
  changeText,
}: StatsCardProps) {
  // Format display value if it's a number
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;
  
  // Determine trend and trendIndicator based on input type
  let numericTrend: number | undefined;
  let trendIndicator = providedTrendIndicator;
  
  if (trend !== undefined) {
    if (typeof trend === "string") {
      // If trend is a string, it's a TrendIndicator
      trendIndicator = trend;
      // Use 0 as a default numeric trend when only direction is provided
      numericTrend = 0;
    } else {
      // If trend is a number, use it as the numeric trend
      numericTrend = trend;
      // If trendIndicator wasn't explicitly set, derive it from the trend value
      if (providedTrendIndicator === "neutral" && trend !== 0) {
        trendIndicator = trend > 0 ? "up" : "down";
      }
    }
  }
  
  // Get trend icon based on indicator
  const TrendIcon = 
    trendIndicator === "up" ? ArrowUp :
    trendIndicator === "down" ? ArrowDown :
    ArrowRight;
  
  // Get trend color class
  const getChangeColorClass = () => {
    if (numericTrend !== undefined) {
      if (numericTrend > 0) {
        return increaseIsGood ? "text-green-600" : "text-red-600";
      }
      if (numericTrend < 0) {
        return increaseIsGood ? "text-red-600" : "text-green-600";
      }
    }
    return "text-muted-foreground";
  };

  // Create an ID for accessibility
  const titleId = `stats-title-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <Card className={cn(statsCardVariants({ variant }), className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <h3 className="font-medium text-sm" id={titleId}>
          {title}
        </h3>
        
        {icon && (
          <div className={iconContainerVariants({ variant })}>
            {React.isValidElement(icon) 
              ? icon 
              : icon && React.createElement(icon as React.ComponentType<{className?: string}>, { className: "h-5 w-5" })}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold" aria-labelledby={titleId}>
          {displayValue}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
      
      {(trend !== undefined || period || footer) && (
        <CardFooter className="px-4 py-3 border-t flex justify-between items-center">
          {numericTrend !== undefined && (
            <div className="flex items-center space-x-1" aria-live="polite">
              <span className={cn("flex items-center text-xs font-medium", getChangeColorClass())}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {typeof trend === 'number' ? Math.abs(trend).toFixed(1) + '%' : ''}
              </span>
              {changeText && (
                <span className="text-xs text-muted-foreground">{changeText}</span>
              )}
            </div>
          )}
          
          {period && (
            <div className="text-xs text-muted-foreground">{period}</div>
          )}
          
          {footer && !trend && !period && (
            <div className="w-full">{footer}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}