'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  orders?: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
  className?: string;
  height?: number;
  showCard?: boolean;
  formatCurrency?: (value: number) => string;
}

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
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{label}</p>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
          {formatCurrency(payload[0].value as number)}
        </p>
        {payload[0].payload.orders !== undefined && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {payload[0].payload.orders} orders
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function RevenueChart({
  data,
  title = 'Revenue Trend',
  className = '',
  height = 300,
  showCard = true,
  formatCurrency = defaultFormatCurrency,
}: RevenueChartProps) {
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  if (!showCard) {
    return <div className={className}>{chartContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length > 0 ? (
          chartContent
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No revenue data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

