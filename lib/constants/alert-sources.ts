export const ALERT_SOURCE_LABELS = {
  taxEstimate: 'Estimación fiscal',
  satSearch: 'Búsqueda SAT',
  planLimit: 'Límite del plan',
} as const;

export type AlertSourceLabelKey = keyof typeof ALERT_SOURCE_LABELS;
