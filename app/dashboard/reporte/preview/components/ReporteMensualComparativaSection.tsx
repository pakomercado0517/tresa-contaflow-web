'use client';

import { BarChart3 } from 'lucide-react';
import type { ReporteMensualData } from './reporte-mensual-types';
import { formatReporteCurrency } from './reporte-mensual-format';

interface ReporteMensualComparativaSectionProps {
  data: Pick<ReporteMensualData, 'ingresosCobrados' | 'egresosPagados'>;
}

export function ReporteMensualComparativaSection({ data }: ReporteMensualComparativaSectionProps) {
  return (
    <section className="px-6 pb-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
        <BarChart3 className="h-4 w-4" />
        Comparativa cobrado vs pagado
      </h3>
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          Cobros: {formatReporteCurrency(data.ingresosCobrados)}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-400" />
          Pagos: {formatReporteCurrency(data.egresosPagados)}
        </span>
      </div>
    </section>
  );
}
