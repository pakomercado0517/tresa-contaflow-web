import { Card } from "@/components/ui/card";
import { TrendingDown, DollarSign, FileText, ArrowLeftRight } from "lucide-react";
import type { MetricsResponse } from "@/lib/types/invoices";

interface MetricsCardsProps {
  metrics?: MetricsResponse["metrics"];
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const totalIngresos = metrics?.totalFacturado || 0;
  const totalGastos = metrics?.totalCompras || 0;
  const utilidadNeta = totalIngresos - totalGastos;
  const diferenciaIngresosGastos = totalIngresos - totalGastos;
  const margen = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ingresos totales</p>
            <p className="text-3xl font-bold">{formatCurrency(totalIngresos)}</p>
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
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Diferencia Ingresos - Gastos</p>
            <p className="text-3xl font-bold">
              {formatCurrency(diferenciaIngresosGastos)}
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

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

