'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { getTrendDataClient, type TrendDataPoint } from '@/lib/api/invoices.client';
import {
  FLOW_TREND_PERIOD_VIEW_LABELS,
  MOBILE_CHART_MAX_POINTS,
} from '@/lib/constants/chart-ui';
import type { TrendPeriodView } from '@/lib/api/invoices';
import { Filter } from 'lucide-react';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { metricsTrendQueryKey } from '@/lib/query/query-keys';
import { MD_UP_QUERY, useIsMdUp } from '@/lib/hooks/use-media-query';
import { sliceTrendDataForMobileWindow } from '@/lib/utils/slice-trend-data-for-mobile';

const FlowTrendChartPlot = dynamic(() => import('./FlowTrendChartPlot'), {
  ssr: false,
  loading: () => (
    <div className="relative flex h-64 items-center justify-center md:h-80">
      <LoadingSpinner message="Cargando gráfica..." />
    </div>
  ),
});

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

const MOBILE_DEFAULT_VISIBLE: VisibleSeries = {
  ingresos_cobrados: true,
  egresos_pagados: true,
  ingresos_devengados: false,
  egresos_devengados: false,
};

function getInitialVisibleSeries(): VisibleSeries {
  if (typeof window === 'undefined') {
    return DEFAULT_VISIBLE;
  }
  return window.matchMedia(MD_UP_QUERY).matches ? DEFAULT_VISIBLE : MOBILE_DEFAULT_VISIBLE;
}

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
  const isMdUp = useIsMdUp();
  const [visibleSeries, setVisibleSeries] = useState<VisibleSeries>(getInitialVisibleSeries);
  const [periodView, setPeriodView] = useState<TrendPeriodView>('año-actual');
  const { mes: appBusinessMes, año: appBusinessAño } = getCurrentMonthYearInAppTimezone();
  const selectedYear = año ?? appBusinessAño;
  const selectedMonth = mes ?? appBusinessMes;
  const shouldUseInitialData = periodView === 'año-actual';

  const {
    data: fetchedData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: metricsTrendQueryKey(profileId, selectedYear, periodView, selectedMonth, regimenFiscal),
    queryFn: () =>
      getTrendDataClient(profileId, selectedYear, periodView, selectedMonth, regimenFiscal),
    enabled: !shouldUseInitialData,
    staleTime: 2 * 60 * 1000,
  });

  const data = shouldUseInitialData ? initialData : (fetchedData ?? []);
  const displayLoading = !shouldUseInitialData && (isLoading || isFetching);

  const mobileCutoffAño = selectedYear > appBusinessAño ? appBusinessAño : selectedYear;
  const mobileCutoffMes =
    selectedYear > appBusinessAño
      ? appBusinessMes
      : selectedYear === appBusinessAño
        ? Math.min(selectedMonth, appBusinessMes)
        : selectedMonth;

  const dataForPlot = isMdUp
    ? data
    : sliceTrendDataForMobileWindow(
        data,
        mobileCutoffMes,
        mobileCutoffAño,
        MOBILE_CHART_MAX_POINTS
      );

  const chartData = dataForPlot.map((item) => {
    const monthLabel = MONTHS_SHORT[item.mes - 1];
    const label = item.año === appBusinessAño ? monthLabel : `${monthLabel} ${item.año}`;
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

  return (
    <Card data-tour="trend-chart" className="bg-card border-border w-full p-4 md:p-6">
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
                <SelectItem value="año-actual">{FLOW_TREND_PERIOD_VIEW_LABELS['año-actual']}</SelectItem>
                <SelectItem value="últimos-12-meses">
                  {FLOW_TREND_PERIOD_VIEW_LABELS['últimos-12-meses']}
                </SelectItem>
                <SelectItem value="año-completo">{FLOW_TREND_PERIOD_VIEW_LABELS['año-completo']}</SelectItem>
                {selectedYear === appBusinessAño && (
                  <SelectItem value="comparar-anterior">
                    {FLOW_TREND_PERIOD_VIEW_LABELS['comparar-anterior']}
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

        <FlowTrendChartPlot
          chartData={chartData}
          visibleSeries={visibleSeries}
          hasData={hasData}
          displayLoading={displayLoading}
          compact={!isMdUp}
        />
      </div>
    </Card>
  );
}
