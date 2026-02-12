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
  pendientes: { por_cobrar: 0, por_pagar: 0 },
};
