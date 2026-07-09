'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import type { ImpuestosMetrics } from '@/lib/types/metrics';
import type { PublicReportMetrics } from '@/lib/types/public-reports';
import { TrendingUp } from 'lucide-react';

const PublicFlowBarChartPlot = dynamic(() => import('./PublicFlowBarChartPlot'), {
  ssr: false,
  loading: () => <div className="bg-muted/30 h-full w-full animate-pulse rounded-lg" />,
});

interface PublicFlowBarChartProps {
  metrics: PublicReportMetrics | null;
}

const BAR_DATA_CONFIG = [
  { key: 'ingresos_cobrados', label: 'Ingresos cobrados', color: '#22c55e' },
  { key: 'egresos_pagados', label: 'Egresos pagados', color: '#ef4444' },
  { key: 'ingresos_devengados', label: 'Ingresos devengados', color: '#14b8a6' },
  { key: 'egresos_devengados', label: 'Egresos devengados', color: '#f97316' },
  { key: 'iva_trasladado', label: 'IVA trasladado', color: '#8b5cf6' },
  { key: 'retenciones_iva', label: 'Ret. IVA', color: '#6366f1' },
  { key: 'retenciones_isr', label: 'Ret. ISR', color: '#0ea5e9' },
  { key: 'iva_acreditable', label: 'IVA acreditable', color: '#06b6d4' },
] as const;

function getImpuestosDevengado(imp?: ImpuestosMetrics | null) {
  const i = imp ?? { iva_trasladado: {}, iva_acreditable: {}, retenciones_iva: {}, retenciones_isr: {} };
  return {
    iva_trasladado: i.iva_trasladado?.devengado ?? i.iva_trasladado?.cobrado ?? 0,
    retenciones_iva: i.retenciones_iva?.devengado ?? i.retenciones_iva?.cobrado ?? 0,
    retenciones_isr: i.retenciones_isr?.devengado ?? i.retenciones_isr?.cobrado ?? 0,
    iva_acreditable: i.iva_acreditable?.devengado ?? i.iva_acreditable?.pagado ?? 0,
  };
}

export function PublicFlowBarChart({ metrics }: PublicFlowBarChartProps) {
  const flujo = metrics?.flujo ?? { ingresos_cobrados: 0, egresos_pagados: 0, flujo_neto: 0 };
  const devengado = metrics?.devengado ?? {
    ingresos_devengados: 0,
    egresos_devengados: 0,
    resultado_devengado: 0,
  };
  const impuestos = getImpuestosDevengado(metrics?.impuestos);

  const chartData = BAR_DATA_CONFIG.map(({ key, label, color }) => {
    let value = 0;
    if (key === 'ingresos_cobrados') value = flujo.ingresos_cobrados;
    else if (key === 'egresos_pagados') value = flujo.egresos_pagados;
    else if (key === 'ingresos_devengados') value = devengado.ingresos_devengados;
    else if (key === 'egresos_devengados') value = devengado.egresos_devengados;
    else if (key === 'iva_trasladado') value = impuestos.iva_trasladado;
    else if (key === 'retenciones_iva') value = impuestos.retenciones_iva;
    else if (key === 'retenciones_isr') value = impuestos.retenciones_isr;
    else if (key === 'iva_acreditable') value = impuestos.iva_acreditable;
    return { name: label, value, color };
  });

  const hasData = chartData.some((d) => d.value > 0);

  return (
    <Card className="border-border bg-card w-full p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 flex h-9 w-9 items-center justify-center rounded-lg">
            <TrendingUp className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Resumen del Periodo</h3>
            <p className="text-muted-foreground text-sm">
              Comparativo de flujo e información devengada
            </p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4">
          {BAR_DATA_CONFIG.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground text-xs">{label}</span>
            </div>
          ))}
        </div>

        <div className="relative h-72 min-w-0 w-full">
          {hasData ? (
            <PublicFlowBarChartPlot chartData={chartData} />
          ) : (
            <div className="bg-muted/30 flex h-full items-center justify-center rounded-lg">
              <div className="space-y-2 text-center">
                <TrendingUp className="text-muted-foreground/40 mx-auto h-10 w-10" />
                <p className="text-muted-foreground text-sm">
                  Sin datos para mostrar en este periodo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
