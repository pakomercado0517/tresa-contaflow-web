import { Card } from "@/components/ui/card";
import { TrendingDown, DollarSign, FileText, TrendingUp, CheckCircle2 } from "lucide-react";
import type { MetricsResponse } from "@/lib/types/invoices";

interface MetricsCardsProps {
  metrics?: MetricsResponse["metrics"];
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const totalFacturado = metrics?.totalFacturado || 0;
  const totalPagado = metrics?.totalPagado || 0;
  const totalGastos = metrics?.totalCompras || 0;
  // Utilidad neta viene del backend (totalPagadoMenosCompras contiene el cálculo de totalPagado - totalCompras)
  const utilidadNeta = metrics?.totalPagadoMenosCompras ?? (totalPagado - totalGastos);
  const margen = totalFacturado > 0 ? (utilidadNeta / totalFacturado) * 100 : 0;
  const totalFacturas = metrics?.totalFacturas || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div data-tour="metrics-cards" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

      {/* Gastos totales */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Gastos totales</p>
            <p className="text-3xl font-bold">{formatCurrency(totalGastos)}</p>
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
    </div>
  );
}

