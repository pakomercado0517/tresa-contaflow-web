import type { TrendDataPoint, TrendPeriodView } from '@/lib/api/invoices';
import type { MetricsByMonthItem } from '@/lib/types/metrics';
import {
  getCurrentMonthYearInAppTimezone,
  getLast12CalendarMonthsAscending,
} from '@/lib/utils/app-calendar';

export interface TrendRangeBounds {
  mesDesde: number;
  añoDesde: number;
  mesHasta: number;
  añoHasta: number;
}

const MAX_RANGE_MONTHS = 24;

function countMonthsInclusive(
  mesDesde: number,
  añoDesde: number,
  mesHasta: number,
  añoHasta: number
): number {
  let count = 0;
  let mes = mesDesde;
  let año = añoDesde;
  for (;;) {
    count += 1;
    if (mes === mesHasta && año === añoHasta) {
      break;
    }
    mes += 1;
    if (mes > 12) {
      mes = 1;
      año += 1;
    }
    if (count > MAX_RANGE_MONTHS + 1) {
      throw new Error('metrics trend range exceeds maximum months');
    }
  }
  return count;
}

function resolveCutoffMonth(
  year: number,
  mesCorte: number | undefined,
  currentMonth: number,
  currentYear: number
): number {
  const clampedMesCorte = mesCorte !== undefined ? Math.min(12, Math.max(1, mesCorte)) : undefined;
  if (year === currentYear) {
    return Math.min(clampedMesCorte ?? currentMonth, currentMonth);
  }
  if (year < currentYear) {
    return 12;
  }
  return clampedMesCorte ?? 12;
}

export function getTrendRangeBounds(
  periodView: TrendPeriodView,
  año: number,
  mesCorte?: number
): TrendRangeBounds {
  const { mes: currentMonth, año: currentYear } = getCurrentMonthYearInAppTimezone();
  const year = año;
  const cutoff = resolveCutoffMonth(year, mesCorte, currentMonth, currentYear);

  let bounds: TrendRangeBounds;

  switch (periodView) {
    case 'año-actual':
      bounds = {
        mesDesde: 1,
        añoDesde: year,
        mesHasta: year < currentYear ? 12 : cutoff,
        añoHasta: year,
      };
      break;
    case 'año-completo':
      bounds = {
        mesDesde: 1,
        añoDesde: year,
        mesHasta: 12,
        añoHasta: year,
      };
      break;
    case 'últimos-12-meses': {
      const months = getLast12CalendarMonthsAscending(currentMonth, currentYear);
      const first = months[0];
      const last = months[months.length - 1];
      bounds = {
        mesDesde: first.mes,
        añoDesde: first.año,
        mesHasta: last.mes,
        añoHasta: last.año,
      };
      break;
    }
    case 'comparar-anterior':
      if (year === currentYear) {
        bounds = {
          mesDesde: 10,
          añoDesde: year - 1,
          mesHasta: cutoff,
          añoHasta: year,
        };
      } else {
        bounds = {
          mesDesde: 1,
          añoDesde: year,
          mesHasta: 12,
          añoHasta: year,
        };
      }
      break;
    default: {
      const _exhaustive: never = periodView;
      return _exhaustive;
    }
  }

  const monthCount = countMonthsInclusive(
    bounds.mesDesde,
    bounds.añoDesde,
    bounds.mesHasta,
    bounds.añoHasta
  );
  if (monthCount > MAX_RANGE_MONTHS) {
    throw new Error(`metrics trend range spans ${monthCount} months (max ${MAX_RANGE_MONTHS})`);
  }

  return bounds;
}

export function findMetricsItemForMonth(
  items: MetricsByMonthItem[],
  mes: number,
  año: number
): MetricsByMonthItem | undefined {
  return items.find((item) => item.mes === mes && item.año === año);
}

function metricsItemToTrendPoint(item: MetricsByMonthItem): TrendDataPoint {
  return {
    mes: item.mes,
    año: item.año,
    ingresos_cobrados: item.flujo.ingresos_cobrados,
    egresos_pagados: item.flujo.egresos_pagados,
    ingresos_devengados: item.devengado.ingresos_devengados,
    egresos_devengados: item.devengado.egresos_devengados,
  };
}

function emptyTrendPoint(mes: number, año: number): TrendDataPoint {
  return {
    mes,
    año,
    ingresos_cobrados: 0,
    egresos_pagados: 0,
    ingresos_devengados: 0,
    egresos_devengados: 0,
  };
}

export function mapRangeItemsToTrendDataPoints(items: MetricsByMonthItem[]): TrendDataPoint[] {
  return items.map(metricsItemToTrendPoint);
}

function buildPaddedYearSeries(
  items: MetricsByMonthItem[],
  year: number,
  monthsWithData: number
): TrendDataPoint[] {
  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    if (mes <= monthsWithData) {
      const item = findMetricsItemForMonth(items, mes, year);
      if (item) {
        return metricsItemToTrendPoint(item);
      }
    }
    return emptyTrendPoint(mes, year);
  });
}

export function buildTrendSeriesForView(
  items: MetricsByMonthItem[],
  periodView: TrendPeriodView,
  año: number,
  mesCorte?: number
): TrendDataPoint[] {
  const { mes: currentMonth, año: currentYear } = getCurrentMonthYearInAppTimezone();
  const year = año;
  const cutoff = resolveCutoffMonth(year, mesCorte, currentMonth, currentYear);
  const previousYear = year - 1;
  const previousYearMonths = [10, 11, 12];

  switch (periodView) {
    case 'últimos-12-meses':
      return mapRangeItemsToTrendDataPoints(items);

    case 'año-completo':
      return buildPaddedYearSeries(items, year, 12);

    case 'año-actual': {
      const monthsToShow =
        year < currentYear ? 12 : year === currentYear ? cutoff : cutoff;
      return buildPaddedYearSeries(items, year, monthsToShow);
    }

    case 'comparar-anterior': {
      if (year !== currentYear) {
        return buildPaddedYearSeries(items, year, 12);
      }
      const monthsToFetch = cutoff;
      const previousYearData = previousYearMonths.map((mes) => {
        const item = findMetricsItemForMonth(items, mes, previousYear);
        return item ? metricsItemToTrendPoint(item) : emptyTrendPoint(mes, previousYear);
      });
      const currentYearData = buildPaddedYearSeries(items, year, monthsToFetch);
      return [...previousYearData, ...currentYearData];
    }

    default: {
      const _exhaustive: never = periodView;
      return _exhaustive;
    }
  }
}
