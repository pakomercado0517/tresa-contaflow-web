import { CashFlowMetricsSection } from './CashFlowMetricsSection';
import { PendientesMetricsSection } from './PendientesMetricsSection';
import { DevengadoMetricsSection } from './DevengadoMetricsSection';
import {
  mergePendientesImpuestosDefaults,
  type ImpuestosMetrics,
  type PeriodMetricsResponse,
} from '@/lib/types/metrics';
import { splitImpuestosIngresosEgresos } from '@/lib/utils/split-impuestos-ingresos-egresos';

interface MetricsCardsProps {
  metrics?: PeriodMetricsResponse | null;
  profileId?: string;
  mes?: number;
  año?: number;
}

function buildQueryString(profileId?: string, mes?: number, año?: number): string {
  const params = new URLSearchParams();
  if (profileId) params.set('profileId', profileId);
  if (mes) params.set('mes', String(mes));
  if (año) params.set('año', String(año));
  const q = params.toString();
  return q ? `?${q}` : '';
}

function getImpuestosFlujo(imp: ImpuestosMetrics) {
  return {
    ivaTrasladado: imp.iva_trasladado?.cobrado ?? 0,
    retencionesIva: imp.retenciones_iva?.cobrado ?? 0,
    retencionesIsr: imp.retenciones_isr?.cobrado ?? 0,
    ivaAcreditable: imp.iva_acreditable?.pagado ?? 0,
  };
}

function getImpuestosDevengado(imp: ImpuestosMetrics) {
  return {
    ivaTrasladado: imp.iva_trasladado?.devengado ?? imp.iva_trasladado?.cobrado ?? 0,
    retencionesIva: imp.retenciones_iva?.devengado ?? imp.retenciones_iva?.cobrado ?? 0,
    retencionesIsr: imp.retenciones_isr?.devengado ?? imp.retenciones_isr?.cobrado ?? 0,
    ivaAcreditable: imp.iva_acreditable?.devengado ?? imp.iva_acreditable?.pagado ?? 0,
  };
}

export function MetricsCards({ metrics, profileId, mes, año }: MetricsCardsProps) {
  const flujo = metrics?.flujo ?? {
    ingresos_cobrados: 0,
    egresos_pagados: 0,
    flujo_neto: 0,
    ingresos_cobrados_sin_conciliar: 0,
    egresos_pagados_sin_conciliar: 0,
  };
  const devengado = metrics?.devengado ?? {
    ingresos_devengados: 0,
    egresos_devengados: 0,
    resultado_devengado: 0,
  };
  const pendientes = metrics?.pendientes ?? { por_cobrar: 0, por_pagar: 0 };
  const pendientesImpuestosCobrar = mergePendientesImpuestosDefaults(
    pendientes.por_cobrar_impuestos
  );
  const pendientesImpuestosPagar = mergePendientesImpuestosDefaults(
    pendientes.por_pagar_impuestos
  );

  const query = buildQueryString(profileId, mes, año);
  const imp = metrics?.impuestos ?? {
    iva_trasladado: {},
    iva_acreditable: {},
    retenciones_iva: {},
    retenciones_isr: {},
  };
  const flujoImpSplit = splitImpuestosIngresosEgresos(getImpuestosFlujo(imp));
  const devengadoImpSplit = splitImpuestosIngresosEgresos(getImpuestosDevengado(imp));

  return (
    <div data-tour="metrics-cards" className="w-full space-y-8">
      <CashFlowMetricsSection
        flujo={flujo}
        ingresosImpuestos={flujoImpSplit.ingresos}
        egresosImpuestos={flujoImpSplit.egresos}
      />
      <PendientesMetricsSection
        pendientes={pendientes}
        porCobrarImpuestos={pendientesImpuestosCobrar}
        porPagarImpuestos={pendientesImpuestosPagar}
        invoicesHref={`/dashboard/invoices${query}`}
        expensesHref={`/dashboard/expenses${query}`}
      />
      <DevengadoMetricsSection
        devengado={devengado}
        ingresosImpuestos={devengadoImpSplit.ingresos}
        egresosImpuestos={devengadoImpSplit.egresos}
      />
    </div>
  );
}
