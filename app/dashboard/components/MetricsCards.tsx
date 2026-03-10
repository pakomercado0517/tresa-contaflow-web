import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, FileText, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import type { ImpuestosMetrics, PeriodMetricsResponse } from '@/lib/types/metrics';

interface MetricsCardsProps {
  metrics?: PeriodMetricsResponse | null;
  profileId?: string;
  mes?: number;
  año?: number;
}

function buildQueryString(profileId?: string, mes?: number, año?: number): string {
  const params = new URLSearchParams();
  if (profileId) params.set('profileId', profileId);
  if (mes) params.set('mes', String(mes));
  if (año) params.set('año', String(año));
  const q = params.toString();
  return q ? `?${q}` : '';
}

function getImpuestosFlujo(imp: ImpuestosMetrics): {
  ivaTrasladado: number;
  retencionesIva: number;
  retencionesIsr: number;
  ivaAcreditable: number;
} {
  return {
    ivaTrasladado: imp.iva_trasladado?.cobrado ?? 0,
    retencionesIva: imp.retenciones_iva?.cobrado ?? 0,
    retencionesIsr: imp.retenciones_isr?.cobrado ?? 0,
    ivaAcreditable: imp.iva_acreditable?.pagado ?? 0,
  };
}

function getImpuestosDevengado(imp: ImpuestosMetrics): {
  ivaTrasladado: number;
  retencionesIva: number;
  retencionesIsr: number;
  ivaAcreditable: number;
} {
  return {
    ivaTrasladado:
      imp.iva_trasladado?.devengado ?? imp.iva_trasladado?.cobrado ?? 0,
    retencionesIva:
      imp.retenciones_iva?.devengado ?? imp.retenciones_iva?.cobrado ?? 0,
    retencionesIsr:
      imp.retenciones_isr?.devengado ?? imp.retenciones_isr?.cobrado ?? 0,
    ivaAcreditable:
      imp.iva_acreditable?.devengado ?? imp.iva_acreditable?.pagado ?? 0,
  };
}

export function MetricsCards({ metrics, profileId, mes, año }: MetricsCardsProps) {
  const flujo = metrics?.flujo ?? {
    ingresos_cobrados: 0,
    egresos_pagados: 0,
    flujo_neto: 0,
    ingresos_cobrados_sin_conciliar: 0,
    egresos_pagados_sin_conciliar: 0,
  };
  const ingresosSinConciliar = flujo.ingresos_cobrados_sin_conciliar ?? 0;
  const egresosSinConciliar = flujo.egresos_pagados_sin_conciliar ?? 0;
  const devengado = metrics?.devengado ?? {
    ingresos_devengados: 0,
    egresos_devengados: 0,
    resultado_devengado: 0,
  };
  const pendientes = metrics?.pendientes ?? { por_cobrar: 0, por_pagar: 0 };

  const flujoNeto = flujo.flujo_neto;
  const ingresosCobrados = flujo.ingresos_cobrados;
  const margenPorcentaje =
    ingresosCobrados > 0 ? Math.min(100, Math.max(0, (flujoNeto / ingresosCobrados) * 100)) : 0;
  const isFlujoNegativo = flujoNeto < 0;

  const invoicesQuery = buildQueryString(profileId, mes, año);
  const expensesQuery = buildQueryString(profileId, mes, año);

  const imp = metrics?.impuestos ?? {
    iva_trasladado: {},
    iva_acreditable: {},
    retenciones_iva: {},
    retenciones_isr: {},
  };
  const impuestosFlujo = getImpuestosFlujo(imp);
  const impuestosDevengado = getImpuestosDevengado(imp);

  return (
    <div data-tour="metrics-cards" className="w-full space-y-8">
      {/* 1. Flujo de Efectivo */}
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
                  <p className="text-muted-foreground mt-1 text-sm">
                    Efectivo recibido por cobros
                  </p>
                )}
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
                  <p className="text-muted-foreground mt-1 text-sm">
                    Efectivo pagado por gastos
                  </p>
                )}
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
                    <Progress value={margenPorcentaje} className="h-2" />
                    <p className="text-muted-foreground text-xs">
                      Margen operativo del {margenPorcentaje.toFixed(1)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-1 text-sm">
                    Ingresos menos egresos
                  </p>
                )}
              </div>
            </div>
            <div className="border-border/50 mt-6 border-t pt-6">
              <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
                Impuestos del flujo (cobrado / pagado)
              </p>
              <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">IVA trasladado cobrado</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(impuestosFlujo.ivaTrasladado)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Retenciones IVA cobradas</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(impuestosFlujo.retencionesIva)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Retenciones ISR cobradas</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(impuestosFlujo.retencionesIsr)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">IVA acreditable pagado</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(impuestosFlujo.ivaAcreditable)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Pendientes de Realización */}
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
                <p className="text-muted-foreground mt-1 text-sm">
                  Facturas pendientes de cobro
                </p>
                <Link
                  href={`/dashboard/invoices${invoicesQuery}`}
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
                <p className="text-muted-foreground mt-1 text-sm">
                  Gastos autorizados pendientes
                </p>
                <Link
                  href={`/dashboard/expenses${expensesQuery}`}
                  className="text-primary mt-2 inline-block text-sm font-medium hover:underline"
                >
                  Ver CXP
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Información Contable (Devengado) */}
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
                <p className="text-muted-foreground mt-1 text-sm">
                  Suma total de facturas emitidas
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
              </div>
            </div>
            <div className="border-border/50 mt-6 border-t pt-6">
              <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
                Impuestos devengados
              </p>
              <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">IVA trasladado</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(impuestosDevengado.ivaTrasladado)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Retenciones IVA</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(impuestosDevengado.retencionesIva)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Retenciones ISR</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(impuestosDevengado.retencionesIsr)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">IVA acreditable</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(impuestosDevengado.ivaAcreditable)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
