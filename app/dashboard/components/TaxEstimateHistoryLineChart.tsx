'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_ANIMATION_PROPS } from '@/lib/constants/chart-ui';
import { TAX_ESTIMATE_ISR_HIGHLIGHT_LABELS } from '@/lib/constants/tax-estimate-field-labels';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/format';

export interface TaxEstimateHistoryChartPoint {
  mesLabel: string;
  isrNeto: number | null;
  ivaNeto: number;
}

interface TaxEstimateHistoryLineChartProps {
  chartData: TaxEstimateHistoryChartPoint[];
}

export default function TaxEstimateHistoryLineChart({ chartData }: TaxEstimateHistoryLineChartProps) {
  return (
    <div className="h-72 min-w-0 w-full">
      <ResponsiveContainer width="100%" height={288} minWidth={1}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="mesLabel" className="text-muted-foreground text-xs" />
          <YAxis
            className="text-muted-foreground text-xs"
            tickFormatter={(value: number) => formatCurrencyCompact(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value, name) => {
              if (value === null || value === undefined) {
                return ['—', String(name)];
              }
              return [formatCurrency(Number(value)), String(name)];
            }}
            labelFormatter={(label) => `Mes: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="isrNeto"
            name={TAX_ESTIMATE_ISR_HIGHLIGHT_LABELS.isr_neto_a_pagar}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
            {...CHART_ANIMATION_PROPS}
          />
          <Line
            type="monotone"
            dataKey="ivaNeto"
            name="IVA neto a pagar"
            stroke="hsl(var(--chart-2, 142 76% 36%))"
            strokeWidth={2}
            dot={{ r: 3 }}
            {...CHART_ANIMATION_PROPS}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
