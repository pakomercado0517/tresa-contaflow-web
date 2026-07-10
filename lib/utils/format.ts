/**
 * Utilidades de formateo compartidas entre el dashboard y las páginas públicas
 */

import { APP_CALENDAR_TIMEZONE } from '@/lib/utils/app-calendar';

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

/** Opciones de fecha en calendario de negocio (evita mismatch SSR vs cliente). */
const DATE_SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: APP_CALENDAR_TIMEZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: APP_CALENDAR_TIMEZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

const DATE_LONG_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: APP_CALENDAR_TIMEZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

const DATE_NUMERIC_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: APP_CALENDAR_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

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
  return date.toLocaleDateString('es-MX', DATE_SHORT_OPTIONS);
};

/** Fecha con hora para listados */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', DATE_TIME_OPTIONS);
};

/** Fecha legible con mes completo */
export const formatDateLong = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-MX', DATE_LONG_OPTIONS);

/** Fecha numérica dd/mm/aaaa (reportes / tablas PDF) */
export const formatDateNumeric = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', DATE_NUMERIC_OPTIONS);
};

export function formatNullableDateTime(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return formatDateTime(dateString);
}
