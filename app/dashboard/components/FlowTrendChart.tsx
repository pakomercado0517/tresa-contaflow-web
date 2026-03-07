'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
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
import { getTrendDataClient, type TrendDataPoint } from '@/lib/api/invoices.client';
import type { TrendPeriodView } from '@/lib/api/invoices';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Filter } from 'lucide-react';
import { formatCurrencyCompact } from '@/lib/utils/format';

const MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const SERIES_OPTIONS = [
  { id: 'ingresos_cobrados' as const, label: 'Ingresos cobrados' },
  { id: 'egresos_pagados' as const, label: 'Egresos pagados' },
  { id: 'ingresos_devengados' as const, label: 'Ingresos devengados' },
  { id: 'egresos_devengados' as const, label: 'Egresos devengados' },
] as const;

type SeriesId = (typeof SERIES_OPTIONS)[number]['id'];

interface VisibleSeries {
  ingresos_cobrados: boolean;
  egresos_pagados: boolean;
  ingresos_devengados: boolean;
  egresos_devengados: boolean;
}

const DEFAULT_VISIBLE: VisibleSeries = {
  ingresos_cobrados: true,
  egresos_pagados: true,
  ingresos_devengados: true,
  egresos_devengados: true,
};

interface FlowTrendChartProps {
  initialData: TrendDataPoint[];
  profileId?: string;
  año?: number;
  mes?: number;
  regimenFiscal?: string;
}

export function FlowTrendChart({
  initialData,
  profileId,
  año,
  mes,
  regimenFiscal,
}: FlowTrendChartProps) {
  const [visibleSeries, setVisibleSeries] = useState<VisibleSeries>(DEFAULT_VISIBLE);
  const [periodView, setPeriodView] = useState<TrendPeriodView>('año-actual');
  const [fetchedData, setFetchedData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedYear = año ?? new Date().getFullYear();
  const selectedMonth = mes;
  const isMountedRef = useRef(true);
  const shouldUseInitialData = periodView === 'año-actual';

  // Datos mostrados: en "año-actual" usamos props; en otros modos, estado del fetch
  const data = shouldUseInitialData ? initialData : fetchedData;
  const displayLoading = !shouldUseInitialData && isLoading;

  useEffect(() => {
    if (shouldUseInitialData) return;

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) setIsLoading(true);
    }, 0);

    const runFetch = async () => {
      try {
        const newData = await getTrendDataClient(
          profileId,
          selectedYear,
          periodView,
          selectedMonth,
          regimenFiscal
        );
        if (!cancelled && isMountedRef.current) {
          setFetchedData(newData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error al cargar datos de tendencia:', error);
        if (!cancelled && isMountedRef.current) setIsLoading(false);
      }
    };

    runFetch();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [periodView, profileId, selectedYear, selectedMonth, regimenFiscal, shouldUseInitialData]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const currentYear = new Date().getFullYear();
  const chartData = data.map((item) => {
    const monthLabel = MONTHS_SHORT[item.mes - 1];
    const label = item.año === currentYear ? monthLabel : `${monthLabel} ${item.año}`;
    return {
      fecha: label,
      ingresos_cobrados: item.ingresos_cobrados,
      egresos_pagados: item.egresos_pagados,
      ingresos_devengados: item.ingresos_devengados,
      egresos_devengados: item.egresos_devengados,
    };
  });

  const hasData = data.some(
    (item) =>
      item.ingresos_cobrados > 0 ||
      item.egresos_pagados > 0 ||
      item.ingresos_devengados > 0 ||
      item.egresos_devengados > 0
  );

  const toggleSeries = (id: SeriesId) => {
    setVisibleSeries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const periodViewLabels: Record<TrendPeriodView, string> = {
    'año-actual': 'Año Actual',
    'últimos-12-meses': 'Últimos 12 Meses',
    'año-completo': 'Año Completo',
    'comparar-anterior': 'Comparar con Anterior',
  };

  const animationProps = {
    isAnimationActive: true,
    animationDuration: 450,
    animationEasing: 'ease-out' as const,
  };

  return (
    <Card data-tour="trend-chart" className="bg-card border-border w-full p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold">Tendencia de Flujo</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={periodView}
              onValueChange={(value) => setPeriodView(value as TrendPeriodView)}
            >
              <SelectTrigger className="w-45">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="año-actual">{periodViewLabels['año-actual']}</SelectItem>
                <SelectItem value="últimos-12-meses">
                  {periodViewLabels['últimos-12-meses']}
                </SelectItem>
                <SelectItem value="año-completo">{periodViewLabels['año-completo']}</SelectItem>
                {selectedYear === currentYear && (
                  <SelectItem value="comparar-anterior">
                    {periodViewLabels['comparar-anterior']}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Series visibles
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Activar / desactivar series</DropdownMenuLabel>
                {SERIES_OPTIONS.map(({ id, label }) => (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={visibleSeries[id]}
                    onCheckedChange={() => toggleSeries(id)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative h-80 min-w-0 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={320}>
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
                  {...animationProps}
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
                  {...animationProps}
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
                  {...animationProps}
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
                  {...animationProps}
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
                  <h3 className="text-foreground text-lg font-semibold">
                    No hay datos disponibles
                  </h3>
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
      </div>
    </Card>
  );
}
