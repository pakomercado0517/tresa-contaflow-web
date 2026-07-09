'use client';

import { Calculator } from 'lucide-react';
import { TaxEstimatePanel } from '@/components/common/TaxEstimatePanel';
import { TAX_ESTIMATE_PANEL_COPY } from '@/lib/constants/tax-estimate-field-labels';
import type { ReporteTaxEstimateItem } from './reporte-mensual-types';

interface ReporteMensualEstimacionesFiscalesSectionProps {
  estimacionesFiscales: ReporteTaxEstimateItem[];
}

export function ReporteMensualEstimacionesFiscalesSection({
  estimacionesFiscales,
}: ReporteMensualEstimacionesFiscalesSectionProps) {
  if (estimacionesFiscales.length === 0) return null;

  return (
    <section className="px-6 pb-6" data-reporte-seccion-estimacion-fiscal>
      <div className="mb-4 pt-6">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
          <Calculator className="h-4 w-4" />
          {TAX_ESTIMATE_PANEL_COPY.title}
        </h3>
        <p className="text-xs text-gray-600">{TAX_ESTIMATE_PANEL_COPY.subtitle}</p>
      </div>
      <div className="space-y-8">
        {estimacionesFiscales.map((item) => (
          <div key={item.regimen} data-reporte-regimen>
            <TaxEstimatePanel
              panelKey={item.regimen}
              regimenLabel={item.nombreRegimen}
              estimate={item.tax_estimate}
              appearance="report"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
