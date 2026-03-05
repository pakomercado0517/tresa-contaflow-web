'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, Check, ArrowUpRight, FileText, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { MetricStat } from '@/components/common/MetricStat';
import type { PublicReportMetrics } from '@/lib/types/public-reports';

interface PublicMetricsCardsProps {
  metrics: PublicReportMetrics | null;
}

export function PublicMetricsCards({ metrics }: PublicMetricsCardsProps) {
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

  return (
    <div className="w-full space-y-8">
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
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Ingresos cobrados */}
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
              {ingresosSinConciliar > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-300/90">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  Incluye {formatCurrency(ingresosSinConciliar)} de complementos sin conciliar
                </p>
              )}
            </CardContent>
          </Card>

          {/* Egresos pagados */}
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
              {egresosSinConciliar > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-300/90">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  Incluye {formatCurrency(egresosSinConciliar)} de complementos sin conciliar
                </p>
              )}
            </CardContent>
          </Card>

          {/* Flujo neto */}
          <Card className="border-primary/20 bg-[hsl(160,28%,15%)] shadow-sm">
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
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="border-amber-500/20 bg-[hsl(38,35%,14%)] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <MetricStat
                  label="Ingresos por cobrar"
                  value={pendientes.por_cobrar}
                  description="Facturas pendientes de cobro"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-[hsl(38,35%,14%)] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-destructive/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                  <ArrowUpRight className="text-destructive h-4 w-4" />
                </div>
                <MetricStat
                  label="Egresos por pagar"
                  value={pendientes.por_pagar}
                  description="Gastos autorizados pendientes"
                />
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
        <Card className="w-full border-blue-500/20 bg-[hsl(217,35%,14%)] shadow-sm">
          <CardContent className="p-6">
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <MetricStat
                label="Ingresos devengados"
                value={devengado.ingresos_devengados}
                description="Suma total de facturas emitidas"
              />
              <MetricStat
                label="Egresos devengados"
                value={devengado.egresos_devengados}
                description="Suma total de gastos recibidos"
              />
              <MetricStat
                label="Resultado devengado"
                value={devengado.resultado_devengado}
                description="Utilidad antes de impuestos – estimada"
                valueClassName="text-blue-400"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
