'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export interface PaymentMethodDataPoint {
  name: string;
  value: number;
  count?: number;
  percentage?: number;
}

interface PaymentMethodChartProps {
  data: PaymentMethodDataPoint[];
  title?: string;
  className?: string;
  height?: number;
  showCard?: boolean;
  formatCurrency?: (value: number) => string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
  formatCurrency = defaultFormatCurrency 
}: TooltipProps<number, string> & { formatCurrency?: (value: number) => string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PaymentMethodDataPoint;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {data.name}
        </p>
        <p className="text-sm font-semibold" style={{ color: payload[0].payload.fill }}>
          {formatCurrency(data.value)}
        </p>
        {data.count !== undefined && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {data.count} payments
          </p>
        )}
        {data.percentage !== undefined && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data.percentage.toFixed(1)}% of total
          </p>
        )}
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  if (percent < 0.05) return null; // Don't show labels for very small slices
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function PaymentMethodChart({
  data,
  title = 'Payment Methods',
  className = '',
  height = 300,
  showCard = true,
  formatCurrency = defaultFormatCurrency,
}: PaymentMethodChartProps) {
  // Add colors to data
  const dataWithColors = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={100}
          innerRadius={50}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  if (!showCard) {
    return <div className={className}>{chartContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length > 0 ? (
          chartContent
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No payment data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

