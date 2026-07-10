import type { TaxEstimateIsrBlock } from '@/lib/types/tax-estimates';

export const TAX_ESTIMATE_PANEL_COPY = {
  title: 'Estimación fiscal informativa',
  subtitle:
    'ISR e IVA orientativos según tus CFDI y configuración del ejercicio.',
  sectionTitle: 'Estimación fiscal',
  sectionEyebrow: 'Impuestos',
  sectionDescription:
    'ISR e IVA netos del periodo según régimen. Orientativo; no sustituye tu declaración ante el SAT.',
  isrSectionTitle: 'ISR (estimado)',
  ivaSectionTitle: 'IVA (mes, flujo)',
  isrDetailsToggle: 'Ver desglose de ISR',
  isrEmptySupported:
    'No hay desglose de ISR para este periodo.',
  isrEmptyUnsupported:
    'La estimación de ISR no está disponible para este régimen en esta versión. Revisa el bloque de IVA y las alertas.',
  emptyTitle: 'Sin estimación para este periodo',
  emptyDescription:
    'No hay estimación fiscal disponible para esta actividad en el mes consultado.',
  fiscalSettingsLinkLabel: 'Configurar datos fiscales',
} as const;

export const TAX_ESTIMATE_REPORT_FOOTER_NOTE =
  'Las estimaciones fiscales incluidas en este reporte son orientativas y no sustituyen la presentación de declaraciones ante el SAT ni asesoría fiscal profesional.';

export const TAX_ESTIMATE_ISR_HIGHLIGHT_LABELS = {
  isr_neto_a_pagar: 'ISR neto a pagar',
  saldo_a_favor: 'Saldo a favor ISR',
} as const;

export type TaxEstimateIsrDetailKey = Exclude<keyof TaxEstimateIsrBlock, never>;

export interface TaxEstimateIsrDetailRow {
  key: TaxEstimateIsrDetailKey;
  label: string;
  format: 'currency' | 'text';
}

export const TAX_ESTIMATE_ISR_DETAIL_ROWS: TaxEstimateIsrDetailRow[] = [
  { key: 'ingresos_base', label: 'Ingresos base', format: 'currency' },
  { key: 'deducciones_aplicadas', label: 'Deducciones aplicadas', format: 'currency' },
  { key: 'base_gravable', label: 'Base gravable', format: 'currency' },
  { key: 'tasa_o_tarifa', label: 'Tasa o tarifa', format: 'text' },
  { key: 'isr_causado', label: 'ISR causado', format: 'currency' },
  { key: 'menos_retenciones', label: 'Menos retenciones', format: 'currency' },
  {
    key: 'menos_pagos_provisionales_anteriores',
    label: 'Menos pagos provisionales anteriores',
    format: 'currency',
  },
];

export const TAX_ESTIMATE_IVA_LABELS = {
  iva_neto_a_pagar: 'IVA neto a pagar',
  saldo_a_favor: 'Saldo a favor IVA',
  iva_trasladado_cobrado: 'IVA trasladado cobrado',
  iva_acreditable_pagado: 'IVA acreditable pagado',
  iva_retenido: 'IVA retenido',
  ivaNetoDescription:
    'Trasladado cobrado menos acreditable pagado, retenciones y saldo a favor configurado.',
} as const;
