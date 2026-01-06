import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import type { MetricsResponse } from "@/lib/types/invoices";

interface MetricsCardsProps {
  metrics?: MetricsResponse["metrics"];
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const totalIngresos = metrics?.totalFacturado || 0;
  const totalGastos = metrics?.totalCompras || 0;
  const utilidadNeta = totalIngresos - totalGastos;
  const margen = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;
  const facturasPendientes = metrics?.totalFacturas || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ingresos totales</p>
            <p className="text-3xl font-bold">{formatCurrency(totalIngresos)}</p>
            <div className="flex items-center gap-1 text-sm text-primary">
              <TrendingUp className="h-4 w-4" />
              <span>+5%</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Gastos totales</p>
            <p className="text-3xl font-bold">{formatCurrency(totalGastos)}</p>
            <div className="flex items-center gap-1 text-sm text-destructive">
              <TrendingDown className="h-4 w-4" />
              <span>-10%</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-destructive" />
          </div>
        </div>
      </Card>

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

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Facturas Pendientes</p>
            <p className="text-3xl font-bold">{facturasPendientes}</p>
            <p className="text-sm text-muted-foreground">
              Regulares / Atendidas
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>
    </div>
  );
}

