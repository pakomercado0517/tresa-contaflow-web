export type ManualEntryIvaRateOption = '16' | '8' | 'otro';

export const MANUAL_ENTRY_IVA_RATE_OPTIONS: Array<{
  value: ManualEntryIvaRateOption;
  label: string;
}> = [
  { value: '16', label: '16%' },
  { value: '8', label: '8% (fronterizo)' },
  { value: 'otro', label: 'Otro' },
];

export function getIvaRateDecimal(option: ManualEntryIvaRateOption): number | null {
  if (option === '16') return 0.16;
  if (option === '8') return 0.08;
  return null;
}

export function calculateIvaAmountFromSubtotal(
  subtotal: number,
  option: ManualEntryIvaRateOption
): number {
  const rate = getIvaRateDecimal(option);
  if (rate === null) return 0;
  return Math.round(subtotal * rate * 100) / 100;
}

export function calculateAmountsFromTotal(
  total: number,
  option: ManualEntryIvaRateOption
): { subtotal: number; ivaAmount: number } {
  const rate = getIvaRateDecimal(option);
  if (rate === null) {
    return { subtotal: total, ivaAmount: 0 };
  }
  const subtotal = Math.round((total / (1 + rate)) * 100) / 100;
  const ivaAmount = Math.round((total - subtotal) * 100) / 100;
  return { subtotal, ivaAmount };
}

export function calculateSubtotalFromTotalAndIvaAmount(total: number, ivaAmount: number): number {
  return Math.max(Math.round((total - ivaAmount) * 100) / 100, 0);
}

export function getIvaRateForApi(
  option: ManualEntryIvaRateOption,
  subtotal: number,
  ivaAmount: number
): number {
  if (option === '16') return 16;
  if (option === '8') return 8;
  if (subtotal <= 0) return 0;
  return Math.round((ivaAmount / subtotal) * 10000) / 100;
}

export function inferIvaRateOption(storedRate: number | undefined): ManualEntryIvaRateOption {
  if (storedRate === 16) return '16';
  if (storedRate === 8) return '8';
  return 'otro';
}

export function resolveManualEntryIvaAmount(entry: {
  subtotal: number;
  iva?: number;
  iva_amount?: number;
}): number {
  if (typeof entry.iva_amount === 'number') return entry.iva_amount;
  if (entry.iva === 16) return calculateIvaAmountFromSubtotal(entry.subtotal, '16');
  if (entry.iva === 8) return calculateIvaAmountFromSubtotal(entry.subtotal, '8');
  if (typeof entry.iva === 'number') return entry.iva;
  return 0;
}

export function getManualEntryTotal(entry: {
  subtotal: number;
  iva?: number;
  iva_amount?: number;
}): number {
  return Math.round((entry.subtotal + resolveManualEntryIvaAmount(entry)) * 100) / 100;
}
