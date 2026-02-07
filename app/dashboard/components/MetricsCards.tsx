import { Card } from '@/components/ui/card';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  Receipt,
  BarChart3,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { PeriodMetricsResponse } from '@/lib/types/metrics';

interface MetricsCardsProps {
  metrics?: PeriodMetricsResponse | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function MetricsCards({ metrics }: MetricsCardsProps) {
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
  const isFlujoNegativo = flujoNeto < 0;

  return (
    <div data-tour="metrics-cards" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Ingresos cobrados */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Ingresos cobrados</p>
            <p className="text-3xl font-bold">{formatCurrency(flujo.ingresos_cobrados)}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </Card>

      {/* Egresos pagados */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Egresos pagados</p>
            <p className="text-3xl font-bold">{formatCurrency(flujo.egresos_pagados)}</p>
          </div>
          <div className="bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-lg">
            <TrendingDown className="text-destructive h-6 w-6" />
          </div>
        </div>
      </Card>

      {/* Flujo neto */}
      <Card
        className={`p-6 ${
          isFlujoNegativo
            ? 'border-2 border-red-500/30 bg-red-50/50 dark:bg-red-950/20'
            : 'bg-card border-border'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p
              className={`text-sm ${
                isFlujoNegativo
                  ? 'font-medium text-red-700 dark:text-red-400'
                  : 'text-muted-foreground'
              }`}
            >
              Flujo neto
            </p>
            <p
              className={`text-3xl font-bold ${
                isFlujoNegativo ? 'text-red-600 dark:text-red-500' : ''
              }`}
            >
              {formatCurrency(flujoNeto)}
            </p>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              isFlujoNegativo
                ? 'border border-red-500/30 bg-red-500/20'
                : 'bg-primary/10'
            }`}
          >
            {isFlujoNegativo ? (
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            ) : (
              <TrendingUp className="text-primary h-6 w-6" />
            )}
          </div>
        </div>
      </Card>

      {/* Ingresos devengados */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Ingresos devengados</p>
            <p className="text-3xl font-bold">{formatCurrency(devengado.ingresos_devengados)}</p>
          </div>
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
            <FileText className="text-primary h-6 w-6" />
          </div>
        </div>
      </Card>

      {/* Egresos devengados */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Egresos devengados</p>
            <p className="text-3xl font-bold">{formatCurrency(devengado.egresos_devengados)}</p>
          </div>
          <div className="bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-lg">
            <Receipt className="text-destructive h-6 w-6" />
          </div>
        </div>
      </Card>

      {/* Resultado devengado */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Resultado devengado</p>
            <p className="text-3xl font-bold">{formatCurrency(devengado.resultado_devengado)}</p>
          </div>
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
            <BarChart3 className="text-primary h-6 w-6" />
          </div>
        </div>
      </Card>

      {/* Por cobrar */}
      <Card className="border-2 border-orange-500/30 bg-orange-50/50 p-6 dark:bg-orange-950/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Por cobrar</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">
              {formatCurrency(pendientes.por_cobrar)}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/20">
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </Card>

      {/* Por pagar */}
      <Card className="border-2 border-red-500/30 bg-red-50/50 p-6 dark:bg-red-950/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Por pagar</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-500">
              {formatCurrency(pendientes.por_pagar)}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Card>
    </div>
  );
}
