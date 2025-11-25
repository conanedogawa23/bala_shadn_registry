'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export interface ServicePerformanceDataPoint {
  name: string;
  revenue: number;
  orders: number;
  avgPrice?: number;
}

interface TopServicesChartProps {
  data: ServicePerformanceDataPoint[];
  title?: string;
  className?: string;
  height?: number;
  showCard?: boolean;
  formatCurrency?: (value: number) => string;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const defaultFormatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ 
  active, 
  payload, 
  label,
  formatCurrency = defaultFormatCurrency 
}: TooltipProps<number, string> & { formatCurrency?: (value: number) => string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ServicePerformanceDataPoint;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
          {data.name}
        </p>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
          {formatCurrency(data.revenue)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {data.orders} orders
        </p>
        {data.avgPrice !== undefined && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Avg: {formatCurrency(data.avgPrice)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function TopServicesChart({
  data,
  title = 'Top Services',
  className = '',
  height = 300,
  showCard = true,
  formatCurrency = defaultFormatCurrency,
}: TopServicesChartProps) {
  // Truncate long service names for display
  const processedData = data.slice(0, 5).map((item, index) => ({
    ...item,
    displayName: item.name.length > 25 ? `${item.name.slice(0, 22)}...` : item.name,
    color: COLORS[index % COLORS.length],
  }));

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={processedData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          width={120}
        />
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
        <Bar
          dataKey="revenue"
          radius={[0, 4, 4, 0]}
          maxBarSize={30}
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  if (!showCard) {
    return <div className={className}>{chartContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length > 0 ? (
          chartContent
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No service data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

