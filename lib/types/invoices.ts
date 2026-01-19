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
    pendientePagar: number;
    totalFacturas: number;
    totalGastos: number;
    facturasPUE: number;
    facturasPPD: number;
    facturasPagadasCompletamente: number;
    facturasParcialmentePagadas: number;
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

export interface UploadInvoiceResponse {
  message: string;
  data: Invoice;
  validacion: ValidationState;
  tipo: 'factura' | 'gasto';
}

export interface DeleteInvoiceResponse {
  message: string;
}
