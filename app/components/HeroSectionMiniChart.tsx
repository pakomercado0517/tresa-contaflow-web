'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const HERO_CHART_DATA = [
  { mes: 'Ene', ingresos: 120, egresos: 80 },
  { mes: 'Feb', ingresos: 145, egresos: 90 },
  { mes: 'Mar', ingresos: 130, egresos: 85 },
  { mes: 'Abr', ingresos: 165, egresos: 95 },
  { mes: 'May', ingresos: 180, egresos: 100 },
];

const CHART_COLORS = {
  primary: 'hsl(142, 76%, 36%)',
  muted: 'hsl(0, 0%, 45%)',
};

export default function HeroSectionMiniChart() {
  return (
    <ResponsiveContainer width="100%" height={192} minWidth={1}>
      <BarChart
        data={HERO_CHART_DATA}
        margin={{ top: 8, right: 4, left: -16, bottom: 0 }}
        barGap={4}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fill: 'hsl(0,0%,63.9%)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide domain={[0, (max: number) => Math.max(max, 200)]} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(0,0%,7%)',
            border: '1px solid hsl(0,0%,14.9%)',
            borderRadius: '8px',
            fontSize: 12,
          }}
          formatter={(value, name) => [value != null ? `$${value}K MXN` : '', name ?? '']}
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.mes ? `${payload[0].payload.mes}` : ''
          }
          cursor={{ fill: 'hsl(0,0%,14.9%)' }}
        />
        <Bar
          dataKey="ingresos"
          fill={CHART_COLORS.primary}
          radius={[4, 4, 0, 0]}
          name="Ingresos"
          isAnimationActive
          animationDuration={800}
        />
        <Bar
          dataKey="egresos"
          fill={CHART_COLORS.muted}
          radius={[4, 4, 0, 0]}
          name="Egresos"
          isAnimationActive
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
