/**
 * Tipos para el endpoint de métricas /api/metrics
 * Documentación: docs/api-information/metrics.md
 */

export interface PeriodInfo {
  id: string;
  start: string;
  end: string;
}

export interface FlujoMetrics {
  ingresos_cobrados: number;
  egresos_pagados: number;
  flujo_neto: number;
  /** Parte de ingresos_cobrados por complementos sin factura PPD relacionada */
  ingresos_cobrados_sin_conciliar?: number;
  /** Parte de egresos_pagados por complementos sin gasto PPD relacionado */
  egresos_pagados_sin_conciliar?: number;
}

export interface DevengadoMetrics {
  ingresos_devengados: number;
  egresos_devengados: number;
  resultado_devengado: number;
}

export interface ImpuestosItem {
  cobrado?: number;
  devengado?: number;
  pagado?: number;
}

export interface ImpuestosMetrics {
  iva_trasladado: ImpuestosItem;
  iva_acreditable: ImpuestosItem;
  retenciones_iva: ImpuestosItem;
  retenciones_isr: ImpuestosItem;
}

/** Desglose fiscal asociado a saldos pendientes por cobrar o por pagar (CXC / CXP). */
export interface PendientesImpuestosBreakdown {
  iva: number;
  retenciones_iva: number;
  retenciones_isr: number;
}

export interface PendientesMetrics {
  por_cobrar: number;
  por_pagar: number;
  por_cobrar_impuestos?: PendientesImpuestosBreakdown;
  por_pagar_impuestos?: PendientesImpuestosBreakdown;
}

export function mergePendientesImpuestosDefaults(
  breakdown?: PendientesImpuestosBreakdown
): PendientesImpuestosBreakdown {
  return {
    iva: breakdown?.iva ?? 0,
    retenciones_iva: breakdown?.retenciones_iva ?? 0,
    retenciones_isr: breakdown?.retenciones_isr ?? 0,
  };
}

export interface NominaMetrics {
  total_pagada: number;
  percepciones: number;
  deducciones: number;
  cantidad_empleados: number;
}

export interface PeriodMetricsResponse {
  period: PeriodInfo;
  flujo: FlujoMetrics;
  devengado: DevengadoMetrics;
  impuestos: ImpuestosMetrics;
  pendientes: PendientesMetrics;
  nomina?: NominaMetrics;
}

export interface MetricsRangeBounds {
  mes_desde: number;
  año_desde: number;
  mes_hasta: number;
  año_hasta: number;
}

export interface MetricsByMonthItem extends PeriodMetricsResponse {
  mes: number;
  año: number;
}

export interface MetricsRangeResponse {
  range: MetricsRangeBounds;
  items: MetricsByMonthItem[];
}

export interface GetMetricsRangeParams {
  mesDesde: number;
  añoDesde: number;
  mesHasta: number;
  añoHasta: number;
  profileId?: string;
  regimenFiscal?: string;
}

export function metricsByMonthItemToPeriodMetrics(
  item: MetricsByMonthItem
): PeriodMetricsResponse {
  return {
    period: item.period,
    flujo: item.flujo,
    devengado: item.devengado,
    impuestos: item.impuestos,
    pendientes: item.pendientes,
    nomina: item.nomina,
  };
}

/** Respuesta por defecto cuando el backend devuelve 404 en modo rango */
export function createEmptyMetricsRangeResponse(
  bounds: MetricsRangeBounds
): MetricsRangeResponse {
  return { range: bounds, items: [] };
}

/** Respuesta por defecto cuando el backend devuelve 404 (ej. usuario sin suscripción o sin período) */
export const DEFAULT_PERIOD_METRICS: PeriodMetricsResponse = {
  period: { id: '', start: '', end: '' },
  flujo: {
    ingresos_cobrados: 0,
    egresos_pagados: 0,
    flujo_neto: 0,
    ingresos_cobrados_sin_conciliar: 0,
    egresos_pagados_sin_conciliar: 0,
  },
  devengado: { ingresos_devengados: 0, egresos_devengados: 0, resultado_devengado: 0 },
  impuestos: {
    iva_trasladado: {},
    iva_acreditable: {},
    retenciones_iva: {},
    retenciones_isr: {},
  },
  pendientes: {
    por_cobrar: 0,
    por_pagar: 0,
    por_cobrar_impuestos: { iva: 0, retenciones_iva: 0, retenciones_isr: 0 },
    por_pagar_impuestos: { iva: 0, retenciones_iva: 0, retenciones_isr: 0 },
  },
};
