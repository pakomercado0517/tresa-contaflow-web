'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatReporteFacturasCurrency } from './reporte-facturas-format';
import type { ReporteFacturasData } from './reporte-facturas-types';

interface ReporteFacturasSummaryCardsProps {
  data: Pick<
    ReporteFacturasData,
    | 'regimenFiscalLabel'
    | 'totalRetencionesIva'
    | 'totalRetencionesIsr'
    | 'totalIngresos'
    | 'totalIvaTrasladado'
  >;
}

export function ReporteFacturasSummaryCards({ data }: ReporteFacturasSummaryCardsProps) {
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-gray-200 bg-gray-50/80">
          <CardContent className="p-4">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Régimen fiscal
            </p>
            <p className="mt-1 font-medium text-gray-900">{data.regimenFiscalLabel}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gray-50/80">
          <CardContent className="p-4">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Retenciones IVA
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatReporteFacturasCurrency(data.totalRetencionesIva)}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gray-50/80">
          <CardContent className="p-4">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Retenciones ISR
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatReporteFacturasCurrency(data.totalRetencionesIsr)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border border-emerald-200 bg-emerald-50/60">
          <CardContent className="p-4">
            <p className="text-xs font-semibold tracking-wide text-gray-700 uppercase">
              Total ingresos CFDI
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {formatReporteFacturasCurrency(data.totalIngresos)}
            </p>
            <p className="text-xs text-gray-600">MXN</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gray-50/80">
          <CardContent className="p-4">
            <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
              Total IVA trasladado
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatReporteFacturasCurrency(data.totalIvaTrasladado)}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
