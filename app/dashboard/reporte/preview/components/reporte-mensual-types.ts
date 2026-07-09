import type { TaxEstimateResult } from '@/lib/types/tax-estimates';

export const REPORTE_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

/** Estado de resultados por régimen fiscal (una fila por régimen del perfil) */
export interface EstadoPorRegimen {
  nombreRegimen: string;
  ingresos: number;
  egresos: number;
  retencionesIva: number;
  retencionesIsr: number;
  impuestoTrasladado: number;
  utilidadNeta: number;
}

export interface ReporteTaxEstimateItem {
  regimen: string;
  nombreRegimen: string;
  tax_estimate: TaxEstimateResult | null;
}

export interface ReporteMensualData {
  profileName: string;
  rfc: string;
  mes: number;
  año: number;
  ingresosCobrados: number;
  egresosPagados: number;
  flujoNeto: number;
  facturasPorCobrar: number;
  facturasPorPagar: number;
  proyeccionSaldo: number;
  ingresosDevengados: number;
  egresosDevengados: number;
  utilidadOperativa: number;
  variacionIngresos?: number;
  variacionEgresos?: number;
  estadoPorRegimen?: EstadoPorRegimen[];
  logoUrl?: string | null;
  nombreComercial?: string | null;
  estimacionesFiscales?: ReporteTaxEstimateItem[];
}
