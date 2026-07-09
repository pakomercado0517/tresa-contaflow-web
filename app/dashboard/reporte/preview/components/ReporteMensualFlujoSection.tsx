'use client';

import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReporteMensualData } from './reporte-mensual-types';
import { formatReporteCurrency, formatReportePercent } from './reporte-mensual-format';

interface ReporteMensualFlujoSectionProps {
  data: Pick<
    ReporteMensualData,
    'ingresosCobrados' | 'egresosPagados' | 'flujoNeto' | 'variacionIngresos' | 'variacionEgresos'
  >;
}

export function ReporteMensualFlujoSection({ data }: ReporteMensualFlujoSectionProps) {
  return (
    <section className="px-6 pb-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
        <BarChart3 className="h-4 w-4" />
        Resumen de flujo (caja)
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4">
            <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
              Ingresos cobrados
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatReporteCurrency(data.ingresosCobrados)}
            </p>
            {data.variacionIngresos != null && (
              <p
                className={cn(
                  'mt-1 flex items-center gap-1 text-sm',
                  data.variacionIngresos >= 0 ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {data.variacionIngresos >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {formatReportePercent(data.variacionIngresos)} vs mes ant.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4">
            <p className="text-xs font-semibold tracking-wide text-amber-600 uppercase">
              Egresos pagados
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatReporteCurrency(data.egresosPagados)}
            </p>
            {data.variacionEgresos != null && (
              <p
                className={cn(
                  'mt-1 flex items-center gap-1 text-sm',
                  data.variacionEgresos <= 0 ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {data.variacionEgresos <= 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                {formatReportePercent(data.variacionEgresos)} vs mes ant.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-emerald-200 bg-emerald-50/60">
          <CardContent className="p-4">
            <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
              Flujo neto
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {formatReporteCurrency(data.flujoNeto)}
            </p>
            <p className="mt-1 text-sm text-gray-600">Liquidez disponible</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
