import { Info } from 'lucide-react';
import { MetricStat } from '@/components/common/MetricStat';
import {
  TAX_ESTIMATE_ISR_DETAIL_ROWS,
  TAX_ESTIMATE_ISR_HIGHLIGHT_LABELS,
  TAX_ESTIMATE_PANEL_COPY,
} from '@/lib/constants/tax-estimate-field-labels';
import type { TaxEstimateIsrBlock, TaxEstimateResult } from '@/lib/types/tax-estimates';
import { formatIsrDetailValue } from '@/lib/utils/tax-estimate-format';
import { getIsrNetoSubNote, shouldShowIsrBlock } from '@/lib/utils/tax-estimate-labels';

interface TaxEstimateIsrSectionProps {
  estimate: TaxEstimateResult;
}

function IsrDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function IsrDetailGrid({ isr }: { isr: TaxEstimateIsrBlock }) {
  return (
    <div className="border-border space-y-2 border-t pt-4">
      {TAX_ESTIMATE_ISR_DETAIL_ROWS.map((row) => (
        <IsrDetailRow
          key={row.key}
          label={row.label}
          value={formatIsrDetailValue(row, isr)}
        />
      ))}
    </div>
  );
}

export function TaxEstimateIsrSection({ estimate }: TaxEstimateIsrSectionProps) {
  const isrSubNote = getIsrNetoSubNote(estimate.regimen, estimate.tipo_persona);
  const showIsr = shouldShowIsrBlock(estimate.supported, estimate.isr);

  return (
    <div className="space-y-4">
      <h3 className="text-foreground text-sm font-semibold">
        {TAX_ESTIMATE_PANEL_COPY.isrSectionTitle}
      </h3>
      {showIsr && estimate.isr ? (
        <div className="space-y-4">
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
            <MetricStat
              label={TAX_ESTIMATE_ISR_HIGHLIGHT_LABELS.isr_neto_a_pagar}
              value={estimate.isr.isr_neto_a_pagar}
              subNote={isrSubNote}
            />
            <MetricStat
              label={TAX_ESTIMATE_ISR_HIGHLIGHT_LABELS.saldo_a_favor}
              value={estimate.isr.saldo_a_favor}
              valueClassName="text-blue-400"
            />
          </div>
          <details className="group">
            <summary className="text-primary cursor-pointer text-sm font-medium hover:underline">
              {TAX_ESTIMATE_PANEL_COPY.isrDetailsToggle}
            </summary>
            <div className="pt-3">
              <IsrDetailGrid isr={estimate.isr} />
            </div>
          </details>
        </div>
      ) : (
        <div className="border-border bg-muted/20 flex items-start gap-3 rounded-lg border p-4">
          <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-muted-foreground text-sm">
            {estimate.supported
              ? TAX_ESTIMATE_PANEL_COPY.isrEmptySupported
              : TAX_ESTIMATE_PANEL_COPY.isrEmptyUnsupported}
          </p>
        </div>
      )}
    </div>
  );
}
