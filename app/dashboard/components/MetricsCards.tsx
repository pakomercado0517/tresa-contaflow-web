import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, Check, ArrowUpRight, FileText, BarChart3 } from 'lucide-react';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';

interface MetricsCardsProps {
  metrics?: PeriodMetricsResponse | null;
  profileId?: string;
  mes?: number;
  año?: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

function buildQueryString(profileId?: string, mes?: number, año?: number): string {
  const params = new URLSearchParams();
  if (profileId) params.set('profileId', profileId);
  if (mes) params.set('mes', String(mes));
  if (año) params.set('año', String(año));
  const q = params.toString();
  return q ? `?${q}` : '';
}

export function MetricsCards({ metrics, profileId, mes, año }: MetricsCardsProps) {
  const flujo = metrics?.flujo ?? {
    ingresos_cobrados: 0,
    egresos_pagados: 0,
    flujo_neto: 0,
  };
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

  return (
    <div data-tour="metrics-cards" className="space-y-8">
      {/* 1. Flujo de Efectivo */}
      <section className="space-y-4">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/20 bg-[hsl(160,28%,15%)] shadow-sm">
            <CardContent className="relative pt-6">
              <div className="absolute top-4 right-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Ingresos cobrados
              </p>
              <p className="text-2xl font-bold tabular-nums md:text-3xl">
                {formatCurrency(flujo.ingresos_cobrados)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-[hsl(160,28%,15%)] shadow-sm">
            <CardContent className="relative pt-6">
              <div className="absolute top-4 right-4">
                <div className="bg-destructive/20 flex h-8 w-8 items-center justify-center rounded-md">
                  <ArrowUpRight className="text-destructive h-4 w-4" />
                </div>
              </div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Egresos pagados
              </p>
              <p className="text-2xl font-bold tabular-nums md:text-3xl">
                {formatCurrency(flujo.egresos_pagados)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-[hsl(160,28%,15%)] shadow-sm lg:col-span-1">
            <CardContent className="relative pt-6">
              <div className="absolute top-4 right-4">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    isFlujoNegativo ? 'bg-destructive/20' : 'bg-primary/20'
                  }`}
                >
                  <Wallet
                    className={`h-4 w-4 ${isFlujoNegativo ? 'text-destructive' : 'text-primary'}`}
                  />
                </div>
              </div>
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
              {ingresosCobrados > 0 && (
                <div className="mt-4 space-y-2">
                  <Progress value={margenPorcentaje} className="h-2" />
                  <p className="text-muted-foreground text-xs">
                    Margen operativo del {margenPorcentaje.toFixed(1)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-amber-500/20 bg-[hsl(38,35%,14%)] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                    Ingresos por cobrar
                  </p>
                  <p className="text-2xl font-bold tabular-nums md:text-3xl">
                    {formatCurrency(pendientes.por_cobrar)}
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">Facturas pendientes de cobro</p>
                  <Link
                    href={`/dashboard/invoices${invoicesQuery}`}
                    className="text-primary mt-2 inline-block text-sm font-medium hover:underline"
                  >
                    Ver CXC
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-[hsl(38,35%,14%)] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="bg-destructive/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                  <ArrowUpRight className="text-destructive h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                    Egresos por pagar
                  </p>
                  <p className="text-2xl font-bold tabular-nums md:text-3xl">
                    {formatCurrency(pendientes.por_pagar)}
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
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
        </div>
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
        <Card className="border-blue-500/20 bg-[hsl(217,35%,14%)] shadow-sm">
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
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
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                  Egresos devengados
                </p>
                <p className="text-2xl font-bold tabular-nums md:text-3xl">
                  {formatCurrency(devengado.egresos_devengados)}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">Suma total de gastos recibidos</p>
              </div>
              <div>
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
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
