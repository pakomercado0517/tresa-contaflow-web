/**
 * Utilidades de formateo compartidas entre el dashboard y las páginas públicas
 */

const MXN_CURRENCY_FORMATTER = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MXN_CURRENCY_COMPACT_FORMATTER = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formatea un número como moneda MXN con 2 decimales
 * Usado en MetricsCards y páginas públicas
 */
export const formatCurrency = (amount: number): string => MXN_CURRENCY_FORMATTER.format(amount);

/**
 * Formatea un número como moneda MXN sin decimales
 * Usado en ejes de gráficas (FlowTrendChart, PublicFlowBarChart)
 */
export const formatCurrencyCompact = (amount: number): string =>
  MXN_CURRENCY_COMPACT_FORMATTER.format(amount);

/** Fecha corta para tablas (ej. 7 jul 2026) */
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** Fecha con hora para listados */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Fecha legible con mes completo */
export const formatDateLong = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export function formatNullableDateTime(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return formatDateTime(dateString);
}
