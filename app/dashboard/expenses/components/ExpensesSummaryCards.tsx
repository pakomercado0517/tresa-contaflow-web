"use client";

import { Wallet, FileText, Edit, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentMonthYearInAppTimezone } from "@/lib/utils/app-calendar";

interface ExpensesSummaryCardsProps {
  totalExpenses: number;
  xmlProcessed: number;
  validXmlPercentage: number;
  manualExpenses: number;
  selectedMonth?: number;
}

export function ExpensesSummaryCards({
  totalExpenses,
  xmlProcessed,
  validXmlPercentage,
  manualExpenses,
  selectedMonth,
}: ExpensesSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    // Validar que amount sea un número válido
    const validAmount = isNaN(amount) || !isFinite(amount) ? 0 : amount;
    
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(validAmount);
  };

  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Usar el mes seleccionado o el mes actual (calendario de negocio CDMX)
  const monthIndex = selectedMonth
    ? selectedMonth - 1
    : getCurrentMonthYearInAppTimezone().mes - 1;
  const monthName = MONTHS[monthIndex];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Gastos */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                Total Gastos ({monthName})
              </p>
              <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+5% vs mes anterior</span>
              </div>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XMLs Procesados */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">XMLs Procesados</p>
              <p className="text-3xl font-bold">{xmlProcessed.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">
                  {validXmlPercentage.toFixed(0)}% Validados SAT
                </span>
              </div>
            </div>
            <div className="rounded-full bg-green-500/10 p-3">
              <FileText className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos Manuales */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Gastos Manuales</p>
              <p className="text-3xl font-bold">{manualExpenses.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">Pendientes de factura</p>
            </div>
            <div className="rounded-full bg-orange-500/10 p-3">
              <Edit className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

