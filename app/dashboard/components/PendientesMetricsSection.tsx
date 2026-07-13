import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PendientesImpuestosMetrics } from '@/components/common/PendientesImpuestosMetrics';
import { FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION } from '@/lib/constants/metrics-copy';
import type {
  PendientesImpuestosBreakdown,
  PendientesMetrics,
} from '@/lib/types/metrics';

interface PendientesMetricsSectionProps {
  pendientes: PendientesMetrics;
  porCobrarImpuestos: PendientesImpuestosBreakdown;
  porPagarImpuestos: PendientesImpuestosBreakdown;
  invoicesHref: string;
  expensesHref: string;
}

export function PendientesMetricsSection({
  pendientes,
  porCobrarImpuestos,
  porPagarImpuestos,
  invoicesHref,
  expensesHref,
}: PendientesMetricsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
          <FileText className="h-5 w-5 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Pendientes de Realización</h2>
        <Badge variant="secondary" className="bg-amber-500/15 font-medium text-amber-600">
          Por conciliar
        </Badge>
      </div>
      <Card className="w-full border-amber-500/20 bg-[hsl(38,35%,14%)] shadow-sm">
        <CardContent className="p-6">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <div className="min-w-0">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Ingresos por cobrar
              </p>
              <p className="text-2xl font-bold tabular-nums md:text-3xl">
                {formatCurrency(pendientes.por_cobrar)}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">Facturas pendientes de cobro</p>
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                {DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION}
              </p>
              <Link
                href={invoicesHref}
                className="text-primary mt-2 inline-block text-sm font-medium hover:underline"
              >
                Ver CXC
              </Link>
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Egresos por pagar
              </p>
              <p className="text-2xl font-bold tabular-nums md:text-3xl">
                {formatCurrency(pendientes.por_pagar)}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">Gastos autorizados pendientes</p>
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                {DASHBOARD_MAIN_METRIC_SUBTOTAL_CAPTION}
              </p>
              <Link
                href={expensesHref}
                className="text-primary mt-2 inline-block text-sm font-medium hover:underline"
              >
                Ver CXP
              </Link>
            </div>
          </div>
          <PendientesImpuestosMetrics
            porCobrarImpuestos={porCobrarImpuestos}
            porPagarImpuestos={porPagarImpuestos}
          />
        </CardContent>
      </Card>
    </section>
  );
}
