/**
 * Utilidades de formateo compartidas entre el dashboard y las páginas públicas
 */

/**
 * Formatea un número como moneda MXN con 2 decimales
 * Usado en MetricsCards y páginas públicas
 */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

/**
 * Formatea un número como moneda MXN sin decimales
 * Usado en ejes de gráficas (FlowTrendChart, PublicFlowBarChart)
 */
export const formatCurrencyCompact = (amount: number): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
