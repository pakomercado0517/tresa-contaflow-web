'use client';

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { CHART_ANIMATION_PROPS } from '@/lib/constants/chart-ui';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrencyCompact } from '@/lib/utils/format';

export interface FlowTrendChartPlotSeriesVisibility {
  ingresos_cobrados: boolean;
  egresos_pagados: boolean;
  ingresos_devengados: boolean;
  egresos_devengados: boolean;
}

export interface FlowTrendChartPlotPoint {
  fecha: string;
  ingresos_cobrados: number;
  egresos_pagados: number;
  ingresos_devengados: number;
  egresos_devengados: number;
}

interface FlowTrendChartPlotProps {
  chartData: FlowTrendChartPlotPoint[];
  visibleSeries: FlowTrendChartPlotSeriesVisibility;
  hasData: boolean;
  displayLoading: boolean;
}

export default function FlowTrendChartPlot({
  chartData,
  visibleSeries,
  hasData,
  displayLoading,
}: FlowTrendChartPlotProps) {
  return (
    <div className="relative h-80 min-w-0 w-full">
      <ResponsiveContainer width="100%" height={320} minWidth={1}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIngresosCobrados" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorIngresosDevengados" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEgresosPagados" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEgresosDevengados" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="fecha" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            formatter={(value, name) => [formatCurrencyCompact(Number(value ?? 0)), name]}
            labelFormatter={(label) => label}
          />
          {visibleSeries.ingresos_cobrados && (
            <Area
              type="monotone"
              dataKey="ingresos_cobrados"
              name="Ingresos cobrados"
              stroke="#22c55e"
              strokeWidth={2.5}
              fill="url(#colorIngresosCobrados)"
              {...CHART_ANIMATION_PROPS}
            />
          )}
          {visibleSeries.egresos_pagados && (
            <Line
              type="monotone"
              dataKey="egresos_pagados"
              name="Egresos pagados"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              {...CHART_ANIMATION_PROPS}
            />
          )}
          {visibleSeries.ingresos_devengados && (
            <Area
              type="monotone"
              dataKey="ingresos_devengados"
              name="Ingresos devengados"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#colorIngresosDevengados)"
              {...CHART_ANIMATION_PROPS}
            />
          )}
          {visibleSeries.egresos_devengados && (
            <Line
              type="monotone"
              dataKey="egresos_devengados"
              name="Egresos devengados"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3 }}
              {...CHART_ANIMATION_PROPS}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {!hasData && (
        <div className="bg-background/30 absolute inset-0 flex items-center justify-center rounded-lg">
          <div className="bg-card border-border mx-4 max-w-sm rounded-lg border-2 p-6 shadow-xl">
            <div className="space-y-3 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-foreground text-lg font-semibold">No hay datos disponibles</h3>
              <p className="text-muted-foreground text-sm">
                Sube tus primeras facturas y gastos para ver la tendencia de flujo.
              </p>
            </div>
          </div>
        </div>
      )}

      {displayLoading && (
        <div className="bg-background/60 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
          <LoadingSpinner message="Actualizando..." />
        </div>
      )}
    </div>
  );
}
