'use client';

import { Wallet } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { ReporteMensualData } from './reporte-mensual-types';
import { formatReporteCurrency } from './reporte-mensual-format';

interface ReporteMensualTesoreriaSectionProps {
  data: Pick<
    ReporteMensualData,
    'facturasPorCobrar' | 'facturasPorPagar' | 'proyeccionSaldo'
  >;
}

export function ReporteMensualTesoreriaSection({ data }: ReporteMensualTesoreriaSectionProps) {
  const maxTesorería = Math.max(data.facturasPorCobrar, data.facturasPorPagar, 1);
  const progressCobrar = maxTesorería > 0 ? (data.facturasPorCobrar / maxTesorería) * 100 : 0;
  const progressPagar = maxTesorería > 0 ? (data.facturasPorPagar / maxTesorería) * 100 : 0;

  return (
    <section className="px-6 pb-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
        <Wallet className="h-4 w-4" />
        Tesorería pendiente
      </h3>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-600">Facturas por cobrar</span>
          <div className="flex flex-1 items-center gap-4 sm:max-w-xs">
            <Progress
              value={Math.min(progressCobrar, 100)}
              className="h-2 flex-1 bg-emerald-100 [&>div]:bg-emerald-600"
            />
            <span className="w-28 shrink-0 text-right font-medium text-gray-900">
              {formatReporteCurrency(data.facturasPorCobrar)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-600">Facturas por pagar</span>
          <div className="flex flex-1 items-center gap-4 sm:max-w-xs">
            <Progress
              value={Math.min(progressPagar, 100)}
              className="h-2 flex-1 bg-red-100 [&>div]:bg-red-500"
            />
            <span className="w-28 shrink-0 text-right font-medium text-gray-900">
              {formatReporteCurrency(data.facturasPorPagar)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-600">Proyección saldo bancario</span>
          <span className="w-28 shrink-0 text-right font-medium text-gray-900">
            {formatReporteCurrency(data.proyeccionSaldo)}
          </span>
        </div>
      </div>
    </section>
  );
}
