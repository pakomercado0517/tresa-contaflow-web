import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SplitIngresosEgresosImpuestos } from '@/components/common/SplitIngresosEgresosImpuestos';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION } from '@/lib/constants/metrics-copy';
import type { FlujoMetrics, PendientesImpuestosBreakdown } from '@/lib/types/metrics';

interface CashFlowMetricsSectionProps {
  flujo: FlujoMetrics;
  ingresosImpuestos: PendientesImpuestosBreakdown;
  egresosImpuestos: PendientesImpuestosBreakdown;
}

export function CashFlowMetricsSection({
  flujo,
  ingresosImpuestos,
  egresosImpuestos,
}: CashFlowMetricsSectionProps) {
  const ingresosSinConciliar = flujo.ingresos_cobrados_sin_conciliar ?? 0;
  const egresosSinConciliar = flujo.egresos_pagados_sin_conciliar ?? 0;
  const flujoNeto = flujo.flujo_neto;
  const ingresosCobrados = flujo.ingresos_cobrados;
  const margenPorcentaje =
    ingresosCobrados > 0
      ? Math.min(100, Math.max(0, (flujoNeto / ingresosCobrados) * 100))
      : 0;
  const isFlujoNegativo = flujoNeto < 0;

  return (
    <section data-tour="metrics-cashflow" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <Wallet className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Flujo de Efectivo</h2>
            <p className="text-muted-foreground text-sm">
              Efectivo real que ha entrado y salido de las cuentas.
            </p>
          </div>
        </div>
      </div>
      <Card className="w-full border-primary/20 bg-[hsl(160,28%,15%)] shadow-sm">
        <CardContent className="p-6">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            <div className="min-w-0">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Ingresos cobrados
              </p>
              <p className="text-2xl font-bold tabular-nums md:text-3xl">
                {formatCurrency(flujo.ingresos_cobrados)}
              </p>
              {ingresosSinConciliar > 0 ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-300/90">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  Incluye {formatCurrency(ingresosSinConciliar)} de complementos sin conciliar (ya
                  incluido en este total)
                </p>
              ) : (
                <p className="text-muted-foreground mt-1 text-sm">Efectivo recibido por cobros</p>
              )}
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                {DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Egresos pagados
              </p>
              <p className="text-2xl font-bold tabular-nums md:text-3xl">
                {formatCurrency(flujo.egresos_pagados)}
              </p>
              {egresosSinConciliar > 0 ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-300/90">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  Incluye {formatCurrency(egresosSinConciliar)} de complementos sin conciliar (ya
                  incluido en este total)
                </p>
              ) : (
                <p className="text-muted-foreground mt-1 text-sm">Efectivo pagado por gastos</p>
              )}
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                {DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Flujo neto
              </p>
              <p
                className={`text-2xl font-bold tabular-nums md:text-3xl ${
                  isFlujoNegativo ? 'text-destructive' : ''
                }`}
              >
                {formatCurrency(flujoNeto)}
              </p>
              {ingresosCobrados > 0 ? (
                <div className="mt-4 space-y-2">
                  <Progress
                    value={margenPorcentaje}
                    className="h-2"
                    aria-label={`Margen operativo ${margenPorcentaje.toFixed(1)}%`}
                  />
                  <p className="text-muted-foreground text-xs">
                    Margen operativo del {margenPorcentaje.toFixed(1)}%
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground mt-1 text-sm">Ingresos menos egresos</p>
              )}
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                {DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION}
              </p>
            </div>
          </div>
          <SplitIngresosEgresosImpuestos
            ingresosTitle="Impuestos del flujo — cobros"
            egresosTitle="Impuestos del flujo — pagos"
            ingresos={ingresosImpuestos}
            egresos={egresosImpuestos}
            ingresosLabels={{
              iva: 'IVA trasladado cobrado',
              retencionesIva: 'Retenciones IVA cobradas',
              retencionesIsr: 'Retenciones ISR cobradas',
            }}
            egresosLabels={{
              iva: 'IVA acreditable pagado',
              retencionesIva: 'Retenciones IVA pagadas',
              retencionesIsr: 'Retenciones ISR pagadas',
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
