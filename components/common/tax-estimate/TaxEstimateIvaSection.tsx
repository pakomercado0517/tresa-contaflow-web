import { MetricStat } from '@/components/common/MetricStat';
import {
  TAX_ESTIMATE_IVA_LABELS,
  TAX_ESTIMATE_PANEL_COPY,
} from '@/lib/constants/tax-estimate-field-labels';
import type { TaxEstimateIvaBlock } from '@/lib/types/tax-estimates';

interface TaxEstimateIvaSectionProps {
  iva: TaxEstimateIvaBlock;
}

export function TaxEstimateIvaSection({ iva }: TaxEstimateIvaSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-foreground text-sm font-semibold">
        {TAX_ESTIMATE_PANEL_COPY.ivaSectionTitle}
      </h3>
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
        <MetricStat
          label={TAX_ESTIMATE_IVA_LABELS.iva_neto_a_pagar}
          value={iva.iva_neto_a_pagar}
          description={TAX_ESTIMATE_IVA_LABELS.ivaNetoDescription}
        />
        <MetricStat
          label={TAX_ESTIMATE_IVA_LABELS.saldo_a_favor}
          value={iva.saldo_a_favor}
          valueClassName="text-blue-400"
        />
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricStat
          label={TAX_ESTIMATE_IVA_LABELS.iva_trasladado_cobrado}
          value={iva.iva_trasladado_cobrado}
        />
        <MetricStat
          label={TAX_ESTIMATE_IVA_LABELS.iva_acreditable_pagado}
          value={iva.iva_acreditable_pagado}
        />
        <MetricStat label={TAX_ESTIMATE_IVA_LABELS.iva_retenido} value={iva.iva_retenido} />
      </div>
    </div>
  );
}
