import type { TaxEstimateIsrBlock, TaxEstimateTipoPersona } from '@/lib/types/tax-estimates';

const ISR_ACUMULADO_YTD_NOTE =
  'Saldo acumulado orientativo del ejercicio hasta este mes; no necesariamente corresponde al pago incremental del mes.';

const ISR_RESICO_PF_MES_NOTE =
  'ISR estimado del mes con base en ingresos cobrados (RESICO persona física).';

export function getIsrNetoSubNote(
  regimen: string,
  tipoPersona: TaxEstimateTipoPersona
): string | undefined {
  if (regimen === '626' && tipoPersona === 'FISICA') {
    return ISR_RESICO_PF_MES_NOTE;
  }
  if (regimen === '626' && tipoPersona === 'MORAL') {
    return ISR_ACUMULADO_YTD_NOTE;
  }
  if (regimen === '612' && tipoPersona === 'FISICA') {
    return ISR_ACUMULADO_YTD_NOTE;
  }
  if (regimen === '601' && tipoPersona === 'MORAL') {
    return ISR_ACUMULADO_YTD_NOTE;
  }
  return undefined;
}

export function shouldShowIsrBlock(
  supported: boolean,
  isr: TaxEstimateIsrBlock | null
): boolean {
  return supported && isr !== null;
}

export function formatTipoPersonaLabel(tipoPersona: TaxEstimateTipoPersona): string {
  return tipoPersona === 'FISICA' ? 'Persona física' : 'Persona moral';
}
