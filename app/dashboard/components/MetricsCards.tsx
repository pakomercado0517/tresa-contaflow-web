import { Card } from "@/components/ui/card";
import { TrendingDown, DollarSign, FileText, TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { MetricsResponse } from "@/lib/types/invoices";

interface MetricsCardsProps {
  metrics?: MetricsResponse["metrics"];
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const totalFacturado = metrics?.totalFacturado || 0;
  const totalPagado = metrics?.totalPagado || 0;
  const totalGastos = metrics?.totalCompras || 0;
  const totalComprasPagadas = metrics?.totalComprasPagadas || 0;
  // Utilidad neta viene del backend (totalPagadoMenosCompras contiene el cálculo de totalPagado - totalComprasPagadas)
  const utilidadNeta = metrics?.totalPagadoMenosCompras ?? (totalPagado - totalComprasPagadas);
  const margen = totalFacturado > 0 ? (utilidadNeta / totalFacturado) * 100 : 0;
  const totalFacturas = metrics?.totalFacturas || 0;
  
  // Calcular pendientes
  const ingresosPendientes = metrics?.pendientePagar || 0;
  const gastosPendientes = totalGastos - totalComprasPagadas;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div data-tour="metrics-cards" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Facturado */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Facturado</p>
            <p className="text-3xl font-bold">{formatCurrency(totalFacturado)}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      {/* Total Pagado */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Pagado</p>
            <p className="text-3xl font-bold">{formatCurrency(totalPagado)}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </Card>

      {/* Gastos pagados */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Gastos pagados</p>
            <p className="text-3xl font-bold">{formatCurrency(totalComprasPagadas)}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-destructive" />
          </div>
        </div>
      </Card>

      {/* Utilidad neta */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Utilidad neta</p>
            <p className="text-3xl font-bold">{formatCurrency(utilidadNeta)}</p>
            <p className="text-sm text-muted-foreground">
              Margen {margen.toFixed(0)}%
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      {/* Total de facturas */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total de facturas</p>
            <p className="text-3xl font-bold">{totalFacturas}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      {/* Gastos pendientes por pagar */}
      <Card className="p-6 border-2 border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Gastos pendientes</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-500">{formatCurrency(gastosPendientes)}</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              Por pagar
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Card>

      {/* Ingresos pendientes por pagar - Ocupa 2 espacios en lg+ */}
      <Card className="p-6 border-2 border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20 md:col-span-2 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Ingresos pendientes</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">{formatCurrency(ingresosPendientes)}</p>
            <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
              Por cobrar
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </Card>
    </div>
  );
}

