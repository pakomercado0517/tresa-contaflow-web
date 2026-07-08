'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const DEMO_CHART_DATA = [
  { mes: 'Ene', utilidad: 40 },
  { mes: 'Feb', utilidad: 55 },
  { mes: 'Mar', utilidad: 45 },
  { mes: 'Abr', utilidad: 70 },
  { mes: 'May', utilidad: 80 },
  { mes: 'Jun', utilidad: 95 },
];

const CHART_PRIMARY = 'hsl(142, 76%, 36%)';

export default function DashboardPreviewAreaChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={DEMO_CHART_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="demoUtilidadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.35} />
            <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fill: 'hsl(0,0%,63.9%)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide domain={[0, (max: number) => Math.max(max, 100)]} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(0,0%,7%)',
            border: '1px solid hsl(0,0%,14.9%)',
            borderRadius: '8px',
            fontSize: 12,
          }}
          formatter={(value) => [value != null ? `$${value}K MXN` : '', 'Utilidad']}
          labelFormatter={(label) => label}
          cursor={{ fill: 'hsl(0,0%,14.9%)' }}
        />
        <Area
          type="monotone"
          dataKey="utilidad"
          stroke={CHART_PRIMARY}
          strokeWidth={2}
          fill="url(#demoUtilidadGradient)"
          isAnimationActive
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
