'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReconciliationBadgeProps {
  cantidadItemsSinConciliar: number;
  cantidadFacturasRelacionadas: number;
}

export function ReconciliationBadge({
  cantidadItemsSinConciliar,
  cantidadFacturasRelacionadas,
}: ReconciliationBadgeProps) {
  const hasUnreconciled = cantidadItemsSinConciliar > 0;

  return (
    <div className="flex flex-col items-start gap-1">
      {hasUnreconciled ? (
        <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mr-1 h-3 w-3" />
          {cantidadItemsSinConciliar} sin conciliar
        </Badge>
      ) : (
        <Badge variant="outline" className="border-green-500/50 text-green-700 dark:text-green-400">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Conciliado
        </Badge>
      )}
      <span className="text-muted-foreground text-xs">
        {cantidadFacturasRelacionadas} factura
        {cantidadFacturasRelacionadas === 1 ? '' : 's'} UUID
      </span>
    </div>
  );
}
