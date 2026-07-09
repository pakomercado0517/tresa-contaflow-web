import type { TrendPeriodView } from '@/lib/api/invoices';

export const CHART_ANIMATION_PROPS = {
  isAnimationActive: true,
  animationDuration: 450,
  animationEasing: 'ease-out' as const,
};

export const FLOW_TREND_PERIOD_VIEW_LABELS: Record<TrendPeriodView, string> = {
  'año-actual': 'Año Actual',
  'últimos-12-meses': 'Últimos 12 Meses',
  'año-completo': 'Año Completo',
  'comparar-anterior': 'Comparar con Anterior',
};
