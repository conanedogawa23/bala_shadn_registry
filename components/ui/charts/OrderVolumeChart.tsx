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
import { Activity } from 'lucide-react';

export interface OrderVolumeDataPoint {
  month: string;
  orders: number;
  completed?: number;
  pending?: number;
}

interface OrderVolumeChartProps {
  data: OrderVolumeDataPoint[];
  title?: string;
  className?: string;
  height?: number;
  showCard?: boolean;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as OrderVolumeDataPoint;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{label}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
          {data.orders} orders
        </p>
        {data.completed !== undefined && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {data.completed} completed
          </p>
        )}
        {data.pending !== undefined && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {data.pending} pending
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function OrderVolumeChart({
  data,
  title = 'Order Volume',
  className = '',
  height = 300,
  showCard = true,
}: OrderVolumeChartProps) {
  // Calculate the max value for better Y-axis scaling
  const maxOrders = Math.max(...data.map(d => d.orders), 1);
  
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="orderBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
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
          domain={[0, Math.ceil(maxOrders * 1.1)]}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
        <Bar
          dataKey="orders"
          fill="url(#orderBarGradient)"
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`url(#orderBarGradient)`}
              opacity={0.8 + (index / data.length) * 0.2}
            />
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
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length > 0 ? (
          chartContent
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No order data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

