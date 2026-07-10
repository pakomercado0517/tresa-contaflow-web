export interface FilaGastoReporte {
  fecha: string;
  folio: string;
  uuidCorto?: string;
  rfcEmisor: string;
  subtotal: number;
  impuestos: number;
  total: number;
}

export interface FilaComplementoReporte {
  linkId: string;
  fechaEmision: string;
  uuidCorto: string;
  rfcContraparte: string;
  totalPagado: number;
  conciliacionLabel: string;
  perfilNombre?: string;
  perfilRfc?: string;
}

export interface ReporteGastosData {
  profileName: string;
  rfc: string;
  reportId: string;
  generatedDate: string;
  generatedTime: string;
  mes: number;
  año: number;
  periodoLabel: string;
  regimenFiscalLabel: string;
  estadoCfdi: string;
  totalEgresos: number;
  totalIva: number;
  totalRetencionesIva: number;
  totalRetencionesIsr: number;
  filas: FilaGastoReporte[];
  filasComplementos: FilaComplementoReporte[];
  showComplementProfileColumn?: boolean;
  /** URL del logo del despacho (branding) */
  logoUrl?: string | null;
  /** Nombre comercial del despacho (branding) */
  nombreComercial?: string | null;
}
