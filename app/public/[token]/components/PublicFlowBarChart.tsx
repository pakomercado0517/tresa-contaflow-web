'use client';

import { Card } from '@/components/ui/card';
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
import type { PublicReportMetrics } from '@/lib/types/public-reports';
import { TrendingUp } from 'lucide-react';

interface PublicFlowBarChartProps {
  metrics: PublicReportMetrics | null;
}

const BAR_DATA_CONFIG = [
  { key: 'ingresos_cobrados', label: 'Ingresos cobrados', color: '#22c55e' },
  { key: 'egresos_pagados', label: 'Egresos pagados', color: '#ef4444' },
  { key: 'ingresos_devengados', label: 'Ingresos devengados', color: '#14b8a6' },
  { key: 'egresos_devengados', label: 'Egresos devengados', color: '#f97316' },
] as const;

export function PublicFlowBarChart({ metrics }: PublicFlowBarChartProps) {
  const flujo = metrics?.flujo ?? { ingresos_cobrados: 0, egresos_pagados: 0, flujo_neto: 0 };
  const devengado = metrics?.devengado ?? {
    ingresos_devengados: 0,
    egresos_devengados: 0,
    resultado_devengado: 0,
  };

  const chartData = BAR_DATA_CONFIG.map(({ key, label, color }) => ({
    name: label,
    value:
      key === 'ingresos_cobrados'
        ? flujo.ingresos_cobrados
        : key === 'egresos_pagados'
          ? flujo.egresos_pagados
          : key === 'ingresos_devengados'
            ? devengado.ingresos_devengados
            : devengado.egresos_devengados,
    color,
  }));

  const hasData = chartData.some((d) => d.value > 0);

  return (
    <Card className="border-border bg-card w-full p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 flex h-9 w-9 items-center justify-center rounded-lg">
            <TrendingUp className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Resumen del Periodo</h3>
            <p className="text-muted-foreground text-sm">
              Comparativo de flujo e información devengada
            </p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4">
          {BAR_DATA_CONFIG.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground text-xs">{label}</span>
            </div>
          ))}
        </div>

        <div className="relative h-72 min-w-0 w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={288}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                barCategoryGap="30%"
              >
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
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={450}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="bg-muted/30 flex h-full items-center justify-center rounded-lg">
              <div className="space-y-2 text-center">
                <TrendingUp className="text-muted-foreground/40 mx-auto h-10 w-10" />
                <p className="text-muted-foreground text-sm">
                  Sin datos para mostrar en este periodo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
