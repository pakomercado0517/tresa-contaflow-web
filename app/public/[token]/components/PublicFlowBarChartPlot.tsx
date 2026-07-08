'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrencyCompact } from '@/lib/utils/format';

export interface PublicFlowBarChartPoint {
  name: string;
  value: number;
  color: string;
}

interface PublicFlowBarChartPlotProps {
  chartData: PublicFlowBarChartPoint[];
}

export default function PublicFlowBarChartPlot({ chartData }: PublicFlowBarChartPlotProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={288}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#9ca3af"
          style={{ fontSize: '11px' }}
          tick={{ width: 90 }}
          interval={0}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: '11px' }}
          tickFormatter={(v) => formatCurrencyCompact(Number(v))}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
          }}
          formatter={(value) => [formatCurrencyCompact(Number(value)), 'Monto']}
          labelFormatter={(label) => String(label)}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={450}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
