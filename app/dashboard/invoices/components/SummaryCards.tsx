'use client';

import { FileText, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyCompact } from '@/lib/utils/format';

interface SummaryCardsProps {
  totalCount: number;
  pendingPaymentCount: number;
  totalIncome: number;
}

export function SummaryCards({ totalCount, pendingPaymentCount, totalIncome }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total de Facturas */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-4">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground mb-1 text-sm">TOTAL DE FACTURAS</p>
              <p className="text-3xl font-bold text-blue-500">{totalCount.toLocaleString()}</p>
              <div className="mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-500">Período actual</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facturas Pendientes de Pago */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-orange-500/10 p-4">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground mb-1 text-sm">PENDIENTES DE PAGO</p>
              <p className="text-3xl font-bold text-orange-500">
                {pendingPaymentCount.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-orange-500">Requieren seguimiento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingresos del Período */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-full p-4">
              <DollarSign className="text-primary h-8 w-8" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground mb-1 text-sm">INGRESOS DEL PERIODO</p>
              <p className="text-3xl font-bold">{formatCurrencyCompact(totalIncome)}</p>
              <p className="text-muted-foreground mt-1 text-xs">MXN (Pesos Mexicanos)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
