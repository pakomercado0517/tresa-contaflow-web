import { formatCurrency } from '@/lib/utils/format';
import type { PendientesImpuestosBreakdown } from '@/lib/types/metrics';

export interface ImpuestosTripleLabels {
  iva: string;
  retencionesIva: string;
  retencionesIsr: string;
}

interface SplitIngresosEgresosImpuestosProps {
  ingresosTitle: string;
  egresosTitle: string;
  ingresos: PendientesImpuestosBreakdown;
  egresos: PendientesImpuestosBreakdown;
  ingresosLabels: ImpuestosTripleLabels;
  egresosLabels: ImpuestosTripleLabels;
}

function ImpuestosTripleGrid({
  labels,
  impuestos,
}: {
  labels: ImpuestosTripleLabels;
  impuestos: PendientesImpuestosBreakdown;
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{labels.iva}</p>
        <p className="text-lg font-semibold tabular-nums">{formatCurrency(impuestos.iva)}</p>
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{labels.retencionesIva}</p>
        <p className="text-lg font-semibold tabular-nums">
          {formatCurrency(impuestos.retenciones_iva)}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{labels.retencionesIsr}</p>
        <p className="text-lg font-semibold tabular-nums">
          {formatCurrency(impuestos.retenciones_isr)}
        </p>
      </div>
    </div>
  );
}

/**
 * Dos bloques (ingresos / egresos) con el mismo layout que pendientes de realización.
 */
export function SplitIngresosEgresosImpuestos({
  ingresosTitle,
  egresosTitle,
  ingresos,
  egresos,
  ingresosLabels,
  egresosLabels,
}: SplitIngresosEgresosImpuestosProps) {
  return (
    <div className="border-border/50 mt-6 space-y-6 border-t pt-6">
      <div>
        <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
          {ingresosTitle}
        </p>
        <ImpuestosTripleGrid labels={ingresosLabels} impuestos={ingresos} />
      </div>
      <div>
        <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
          {egresosTitle}
        </p>
        <ImpuestosTripleGrid labels={egresosLabels} impuestos={egresos} />
      </div>
    </div>
  );
}
