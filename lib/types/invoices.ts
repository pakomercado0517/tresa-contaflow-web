import type { ComplementoPago } from '@/lib/types/payment-complements';

export type EstadoPago = 'PAGADO' | 'PAGO_PARCIAL' | 'NO_PAGADO';

export interface EstadoPagoDetalle {
  estado: EstadoPago;
  totalFactura: number;
  totalPagado: number;
  saldoPendiente: number;
  porcentajePagado: number;
  completamentePagado: boolean;
  ultimoSaldoInsoluto: number | null;
  tieneComplementos: boolean;
  tienePagosManuales: boolean;
}

export interface Invoice {
  id: string;
  profile_id: string;
  uuid: string;
  fecha: string;
  mes: number;
  año: number;
  total: number;
  subtotal: number;
  iva: number;
  iva_amount?: number; // IVA trasladado (impuesto trasladado)
  retencion_iva_amount?: number;
  retencion_isr_amount?: number;
  tipo: 'PUE' | 'PPD' | 'COMPLEMENTO_PAGO';
  rfc_emisor: string;
  nombre_emisor: string;
  regimen_fiscal_emisor: string | null;
  rfc_receptor: string;
  nombre_receptor: string;
  regimen_fiscal_receptor: string | null;
  concepto: string | null;
  pagos: Array<{
    fechaPago: string;
    formaPago: string;
    monedaPago: string;
    monto: number;
    numOperacion?: string;
  }>;
  complemento_pago: {
    fechaPago: string;
    formaPago: string;
    monedaPago: string;
    tipoCambio: number;
    monto: number;
    numOperacion?: string;
    facturasRelacionadas: Array<{
      uuid: string;
      monedaDR: string;
      tipoCambioDR: number;
      metodoPagoDR: string;
      numParcialidad: number;
      impSaldoAnt: number;
      impPagado: number;
      impSaldoInsoluto: number;
    }>;
  } | null;
  validacion: {
    rfcVerificado: boolean;
    regimenFiscalVerificado: boolean;
    uuidDuplicado: boolean;
    advertencias: string[];
    errores: string[];
    valido: boolean;
  };
  estadoPago?: EstadoPagoDetalle | null;
  profile?: {
    id: string;
    nombre: string;
    rfc: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GetInvoicesResponse {
  data: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MetricsResponse {
  filters: {
    profileId: string | null;
    mes: number | null;
    año: number | null;
  };
  metrics: {
    totalFacturado: number;
    totalPagado: number;
    totalCompras: number;
    totalComprasPagadas: number;
    totalPagadoMenosCompras: number;
    pendientePagar: number;
    gastosPendientes: number;
    totalFacturas: number;
    totalGastos: number;
    facturasPUE: number;
    facturasPPD: number;
    facturasPagadasCompletamente: number;
    facturasParcialmentePagadas: number;
    facturasPendientesPago: number;
    gastosPUE: number;
    gastosPPD: number;
    gastosPagadosCompletamente: number;
    gastosParcialmentePagados: number;
  };
}

export interface ValidationState {
  rfcVerificado: boolean;
  regimenFiscalVerificado: boolean;
  uuidDuplicado: boolean;
  advertencias: string[];
  errores: string[];
  valido: boolean;
}

export interface UploadInvoiceDocumentResponse {
  message: string;
  data: Invoice;
  validacion: ValidationState;
  tipo: 'factura' | 'gasto';
}

export interface PaymentComplementMatchingSummary {
  applied?: number;
  skipped?: number;
  warnings?: string[];
}

export interface UploadComplementSavedResponse {
  saved: true;
  complementId: string;
  message?: string;
  data: ComplementoPago;
  validacion: ValidationState;
  matching?: PaymentComplementMatchingSummary;
}

export type UploadInvoiceResponse = UploadInvoiceDocumentResponse | UploadComplementSavedResponse;

export function isUploadComplementSavedResponse(
  response: unknown
): response is UploadComplementSavedResponse {
  if (typeof response !== 'object' || response === null) return false;
  const record = response as UploadComplementSavedResponse;
  return record.saved === true && typeof record.complementId === 'string';
}

export interface DeleteInvoiceResponse {
  message: string;
}
