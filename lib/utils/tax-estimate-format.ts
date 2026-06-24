import type { TaxEstimateIsrDetailRow } from '@/lib/constants/tax-estimate-field-labels';
import type { TaxEstimateIsrBlock } from '@/lib/types/tax-estimates';
import { formatCurrency } from '@/lib/utils/format';

export function formatIsrDetailValue(
  row: TaxEstimateIsrDetailRow,
  isr: TaxEstimateIsrBlock
): string {
  const value = isr[row.key];
  if (row.format === 'text') {
    return String(value);
  }
  return formatCurrency(value as number);
}
