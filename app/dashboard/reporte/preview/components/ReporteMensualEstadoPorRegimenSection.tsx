'use client';

import { BarChart3 } from 'lucide-react';
import { PRODUCT_FEATURES } from '@/lib/constants/product-features';
import type { EstadoPorRegimen } from './reporte-mensual-types';
import { formatReporteCurrency } from './reporte-mensual-format';

interface ReporteMensualEstadoPorRegimenSectionProps {
  estadoPorRegimen: EstadoPorRegimen[];
}

function RegimenResultCard({ regimen }: { regimen: EstadoPorRegimen }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/50">
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-2.5">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
        <h4 className="text-sm font-bold text-gray-900">{regimen.nombreRegimen}</h4>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ingresos (cobrados / devengados)</span>
          <span className="font-medium text-gray-900">{formatReporteCurrency(regimen.ingresos)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Egresos (pagados / deducidos)</span>
          <span className="font-medium text-red-600">({formatReporteCurrency(regimen.egresos)})</span>
        </div>
        {PRODUCT_FEATURES.taxEstimate ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Retenciones de terceros (IVA)</span>
              <span className="font-medium text-gray-900">
                {formatReporteCurrency(regimen.retencionesIva)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Retenciones de terceros (ISR)</span>
              <span className="font-medium text-gray-900">
                {formatReporteCurrency(regimen.retencionesIsr)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Impuesto trasladado</span>
              <span className="font-medium text-gray-900">
                {formatReporteCurrency(regimen.impuestoTrasladado)}
              </span>
            </div>
          </>
        ) : null}
        <div className="flex justify-between border-t border-gray-200 pt-3">
          <span className="font-bold text-emerald-700">Utilidad neta del régimen</span>
          <span className="text-lg font-bold text-emerald-700">
            {formatReporteCurrency(regimen.utilidadNeta)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ReporteMensualEstadoPorRegimenSection({
  estadoPorRegimen,
}: ReporteMensualEstadoPorRegimenSectionProps) {
  if (estadoPorRegimen.length === 0) return null;

  return (
    <section className="px-6 pb-6" data-reporte-seccion-regimenes>
      <div className="space-y-6">
        {estadoPorRegimen.map((regimen, index) => (
          <div key={regimen.nombreRegimen} data-reporte-regimen>
            {index === 0 && (
              <div className="mb-4 pt-10">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
                  <BarChart3 className="h-4 w-4" />
                  Estado de resultados por régimen
                </h3>
                <span className="mb-4 block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  Basado en fecha de emisión CFDI
                </span>
              </div>
            )}
            <RegimenResultCard regimen={regimen} />
          </div>
        ))}
      </div>
    </section>
  );
}
