export type TaxEstimateTipoPersona = 'FISICA' | 'MORAL';

export type TaxEstimateAlertSeverity = 'info' | 'warning' | 'error';

export interface TaxEstimateAlert {
  code: string;
  severity: TaxEstimateAlertSeverity;
  message: string;
}

export interface TaxEstimateIsrBlock {
  ingresos_base: number;
  deducciones_aplicadas: number;
  base_gravable: number;
  tasa_o_tarifa: string;
  isr_causado: number;
  menos_retenciones: number;
  menos_pagos_provisionales_anteriores: number;
  isr_neto_a_pagar: number;
  saldo_a_favor: number;
}

export interface TaxEstimateIvaBlock {
  iva_trasladado_cobrado: number;
  iva_acreditable_pagado: number;
  iva_retenido: number;
  iva_neto_a_pagar: number;
  saldo_a_favor: number;
}

export interface TaxEstimateResult {
  regimen: string;
  tipo_persona: TaxEstimateTipoPersona;
  ejercicio: number;
  mes: number;
  supported: boolean;
  disclaimer: string;
  isr: TaxEstimateIsrBlock | null;
  iva: TaxEstimateIvaBlock;
  alerts: TaxEstimateAlert[];
}

export interface TaxEstimatePeriodMeta {
  id: string;
  start: string;
  end: string;
}

export interface TaxEstimateListMeta {
  profile_id: string;
  ejercicio: number;
  mes: number;
  period: TaxEstimatePeriodMeta;
  persisted_count: number;
  persist_skipped: boolean;
}

export interface TaxEstimateRegimenItem {
  regimen: string;
  tax_estimate: TaxEstimateResult | null;
}

export interface TaxEstimateListResponse {
  success: boolean;
  meta: TaxEstimateListMeta;
  estimates: TaxEstimateRegimenItem[];
}

export interface TaxEstimateSnapshot {
  id: string;
  profile_id: string;
  regimen: string;
  ejercicio: number;
  mes: number;
  tipo_persona: TaxEstimateTipoPersona;
  period_id: string | null;
  payload: TaxEstimateResult;
  computed_at: string;
  created_at: string;
  updated_at: string;
}

export interface TaxEstimateHistoryMeta {
  profile_id: string;
  ejercicio: number;
  regimen?: string;
}

export interface TaxEstimateHistoryResponse {
  success: boolean;
  meta: TaxEstimateHistoryMeta;
  snapshots: TaxEstimateSnapshot[];
}

export interface GetTaxEstimatesParams {
  profileId: string;
  mes: number;
  año: number;
  regimenFiscal?: string;
  persist?: boolean;
}

export interface GetTaxEstimateByPeriodParams {
  periodId: string;
  regimenFiscal?: string;
  persist?: boolean;
}

export interface GetTaxEstimateHistoryParams {
  profileId: string;
  ejercicio: number;
  regimenFiscal?: string;
}

export type TaxEstimateErrorCode =
  | 'REGIMEN_NOT_IN_PROFILE'
  | 'PROFILE_NOT_FOUND'
  | 'PERIOD_NOT_FOUND';

export interface TaxEstimateApiErrorBody {
  error: string;
  code?: TaxEstimateErrorCode;
  field?: string;
  message?: string;
  errors?: string[];
}
