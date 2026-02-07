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

export interface PendientesMetrics {
  por_cobrar: number;
  por_pagar: number;
}

export interface PeriodMetricsResponse {
  period: PeriodInfo;
  flujo: FlujoMetrics;
  devengado: DevengadoMetrics;
  impuestos: ImpuestosMetrics;
  pendientes: PendientesMetrics;
}
