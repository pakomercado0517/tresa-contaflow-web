import type { TrendPeriodView } from '@/lib/api/invoices';

export const CHART_ANIMATION_PROPS = {
  isAnimationActive: true,
  animationDuration: 450,
  animationEasing: 'ease-out' as const,
};

/** Máximo de puntos en charts del dashboard bajo el breakpoint `md`. */
export const MOBILE_CHART_MAX_POINTS = 6;

export const FLOW_TREND_PERIOD_VIEW_LABELS: Record<TrendPeriodView, string> = {
  'últimos-3-meses': 'Últimos 3 Meses',
  'año-actual': 'Año Actual',
  'últimos-12-meses': 'Últimos 12 Meses',
  'año-completo': 'Año Completo',
  'comparar-anterior': 'Comparar con Anterior',
};
