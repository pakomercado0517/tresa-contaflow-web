"use client";

import { CheckCircle2, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardsProps {
  validCount: number;
  errorCount: number;
  totalIncome: number;
}

export function SummaryCards({ validCount, errorCount, totalIncome }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Facturas Válidas */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">FACTURAS VÁLIDAS</p>
              <p className="text-3xl font-bold text-green-500">{validCount.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+12% vs mes anterior</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facturas con Error */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-red-500/10 p-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">FACTURAS CON ERROR</p>
              <p className="text-3xl font-bold text-red-500">{errorCount.toLocaleString()}</p>
              <p className="text-xs text-red-500 mt-1">! Requieren atención</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingresos del Período */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">INGRESOS DEL PERIODO</p>
              <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-muted-foreground mt-1">MXN (Pesos Mexicanos)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

