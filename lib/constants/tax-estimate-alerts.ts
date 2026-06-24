import type { TaxEstimateAlertSeverity } from '@/lib/types/tax-estimates';

export type TaxEstimateAlertCode =
  | 'E_REGIMEN_NO_SOPORTADO'
  | 'E_EJERCICIO_SIN_TARIFAS'
  | 'E_COEFICIENTE_UTILIDAD_FALTANTE'
  | 'W_COEFICIENTE_ENE_FEB_DEFAULT'
  | 'W_RESICO_LIMITE_ANUAL'
  | 'W_RESICO_PM_LIMITE_ANUAL'
  | 'W_RESICO_NO_DEDUCCIONES_ISR'
  | 'W_RESICO_PM_SIN_DEPRECIACION'
  | 'W_SIN_METRICAS'
  | 'W_SIN_METRICAS_ACUMULADAS'
  | 'W_CFDI_NC_CANCELACION';

export type TaxEstimateAlertAction = 'open_fiscal_settings' | null;

export interface TaxEstimateAlertCatalogEntry {
  expectedSeverity: TaxEstimateAlertSeverity;
  action: TaxEstimateAlertAction;
  title?: string;
}

export const TAX_ESTIMATE_ALERT_CATALOG: Record<
  TaxEstimateAlertCode,
  TaxEstimateAlertCatalogEntry
> = {
  E_REGIMEN_NO_SOPORTADO: {
    expectedSeverity: 'warning',
    action: null,
    title: 'Régimen sin estimación de ISR',
  },
  E_EJERCICIO_SIN_TARIFAS: {
    expectedSeverity: 'error',
    action: null,
    title: 'Sin tarifas para el ejercicio',
  },
  E_COEFICIENTE_UTILIDAD_FALTANTE: {
    expectedSeverity: 'error',
    action: 'open_fiscal_settings',
    title: 'Coeficiente de utilidad faltante',
  },
  W_COEFICIENTE_ENE_FEB_DEFAULT: {
    expectedSeverity: 'warning',
    action: 'open_fiscal_settings',
    title: 'Coeficiente de utilidad (ene.–feb.)',
  },
  W_RESICO_LIMITE_ANUAL: {
    expectedSeverity: 'warning',
    action: null,
    title: 'Límite anual RESICO (persona física)',
  },
  W_RESICO_PM_LIMITE_ANUAL: {
    expectedSeverity: 'warning',
    action: null,
    title: 'Límite anual RESICO (persona moral)',
  },
  W_RESICO_NO_DEDUCCIONES_ISR: {
    expectedSeverity: 'info',
    action: null,
    title: 'RESICO y deducciones',
  },
  W_RESICO_PM_SIN_DEPRECIACION: {
    expectedSeverity: 'warning',
    action: null,
    title: 'Depreciación RESICO PM',
  },
  W_SIN_METRICAS: {
    expectedSeverity: 'warning',
    action: null,
    title: 'Sin métricas del mes',
  },
  W_SIN_METRICAS_ACUMULADAS: {
    expectedSeverity: 'warning',
    action: null,
    title: 'Sin métricas acumuladas',
  },
  W_CFDI_NC_CANCELACION: {
    expectedSeverity: 'info',
    action: null,
    title: 'Notas de crédito o cancelaciones',
  },
};

const isTaxEstimateAlertCode = (code: string): code is TaxEstimateAlertCode =>
  Object.prototype.hasOwnProperty.call(TAX_ESTIMATE_ALERT_CATALOG, code);

export function getTaxEstimateAlertMeta(
  code: string
): TaxEstimateAlertCatalogEntry | undefined {
  if (!isTaxEstimateAlertCode(code)) {
    return undefined;
  }
  return TAX_ESTIMATE_ALERT_CATALOG[code];
}
