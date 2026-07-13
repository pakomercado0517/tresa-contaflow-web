import { Card, CardContent } from '@/components/ui/card';
import { SplitIngresosEgresosImpuestos } from '@/components/common/SplitIngresosEgresosImpuestos';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION } from '@/lib/constants/metrics-copy';
import type { DevengadoMetrics, PendientesImpuestosBreakdown } from '@/lib/types/metrics';

interface DevengadoMetricsSectionProps {
  devengado: DevengadoMetrics;
  ingresosImpuestos: PendientesImpuestosBreakdown;
  egresosImpuestos: PendientesImpuestosBreakdown;
}

export function DevengadoMetricsSection({
  devengado,
  ingresosImpuestos,
  egresosImpuestos,
}: DevengadoMetricsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
          <BarChart3 className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight uppercase">
            Información Contable (Devengado)
          </h2>
          <p className="text-muted-foreground text-sm">
            Métricas basadas en fecha de emisión de CFDI
          </p>
        </div>
      </div>
      <Card className="w-full border-blue-500/20 bg-[hsl(217,35%,14%)] shadow-sm">
        <CardContent className="p-6">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            <div className="min-w-0">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Ingresos devengados
              </p>
              <p className="text-2xl font-bold tabular-nums md:text-3xl">
                {formatCurrency(devengado.ingresos_devengados)}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">Suma total de facturas emitidas</p>
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                {DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Egresos devengados
              </p>
              <p className="text-2xl font-bold tabular-nums md:text-3xl">
                {formatCurrency(devengado.egresos_devengados)}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">Suma total de gastos recibidos</p>
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                {DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Resultado devengado
              </p>
              <p className="text-2xl font-bold text-blue-400 tabular-nums md:text-3xl">
                {formatCurrency(devengado.resultado_devengado)}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                (Utilidad antes de impuestos – estimada)
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                {DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION}
              </p>
            </div>
          </div>
          <SplitIngresosEgresosImpuestos
            ingresosTitle="Impuestos devengados — ingresos"
            egresosTitle="Impuestos devengados — egresos"
            ingresos={ingresosImpuestos}
            egresos={egresosImpuestos}
            ingresosLabels={{
              iva: 'IVA trasladado',
              retencionesIva: 'Retenciones IVA',
              retencionesIsr: 'Retenciones ISR',
            }}
            egresosLabels={{
              iva: 'IVA acreditable',
              retencionesIva: 'Retenciones IVA',
              retencionesIsr: 'Retenciones ISR',
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
