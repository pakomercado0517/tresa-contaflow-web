import type { PendientesImpuestosBreakdown } from '@/lib/types/metrics';
import { SplitIngresosEgresosImpuestos } from '@/components/common/SplitIngresosEgresosImpuestos';

interface PendientesImpuestosMetricsProps {
  porCobrarImpuestos: PendientesImpuestosBreakdown;
  porPagarImpuestos: PendientesImpuestosBreakdown;
}

/**
 * Desglose de impuestos asociado a pendientes por cobrar / por pagar.
 */
export function PendientesImpuestosMetrics({
  porCobrarImpuestos,
  porPagarImpuestos,
}: PendientesImpuestosMetricsProps) {
  return (
    <SplitIngresosEgresosImpuestos
      ingresosTitle="Impuestos pendientes por cobrar"
      egresosTitle="Impuestos pendientes por pagar"
      ingresos={porCobrarImpuestos}
      egresos={porPagarImpuestos}
      ingresosLabels={{
        iva: 'IVA trasladado pendiente',
        retencionesIva: 'Retenciones IVA',
        retencionesIsr: 'Retenciones ISR',
      }}
      egresosLabels={{
        iva: 'IVA acreditable pendiente',
        retencionesIva: 'Retenciones IVA',
        retencionesIsr: 'Retenciones ISR',
      }}
    />
  );
}
