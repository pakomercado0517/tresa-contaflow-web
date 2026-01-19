export interface Expense {
  id: string;
  profile_id: string;
  tipo_origen: 'XML' | 'MANUAL';
  fecha: string;
  mes: number;
  año: number;
  total: number;
  subtotal: number;
  iva: number;
  concepto: string | null;
  categoria: string | null;
  uuid: string | null;
  tipo: 'PUE' | 'PPD' | 'COMPLEMENTO_PAGO' | null;
  rfc_emisor: string | null;
  nombre_emisor: string | null;
  rfc_receptor: string | null;
  nombre_receptor: string | null;
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

export interface GetExpensesResponse {
  data: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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

export interface UploadExpenseResponse {
  message: string;
  data: Expense;
  validacion: ValidationState;
  tipo: 'gasto';
}

export interface CreateExpenseRequest {
  profileId: string;
  fecha: string;
  total: number;
  subtotal: number;
  iva: number;
  concepto?: string;
  categoria?: string;
}

export interface CreateExpenseResponse {
  message: string;
  data: Expense;
}

export interface DeleteExpenseResponse {
  message: string;
}
