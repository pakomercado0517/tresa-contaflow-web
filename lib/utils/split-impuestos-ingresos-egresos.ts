import type { PendientesImpuestosBreakdown } from '@/lib/types/metrics';

export interface ImpuestosCuatroMontos {
  ivaTrasladado: number;
  retencionesIva: number;
  retencionesIsr: number;
  ivaAcreditable: number;
}

/**
 * Separa totales fiscales del período en bloque ingresos (trasladado + retenciones cobradas/devengadas)
 * y bloque egresos (acreditable pagado/devengado). Las retenciones en egresos quedan en 0 salvo que el API las exponga aparte.
 */
export function splitImpuestosIngresosEgresos(
  imp: ImpuestosCuatroMontos
): {
  ingresos: PendientesImpuestosBreakdown;
  egresos: PendientesImpuestosBreakdown;
} {
  return {
    ingresos: {
      iva: imp.ivaTrasladado,
      retenciones_iva: imp.retencionesIva,
      retenciones_isr: imp.retencionesIsr,
    },
    egresos: {
      iva: imp.ivaAcreditable,
      retenciones_iva: 0,
      retenciones_isr: 0,
    },
  };
}
