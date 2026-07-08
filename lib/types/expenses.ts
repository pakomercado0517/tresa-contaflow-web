import type { EstadoPagoDetalle, UploadComplementSavedResponse } from './invoices';

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
  iva_amount?: number; // IVA trasladado (impuesto trasladado)
  retencion_iva_amount?: number;
  retencion_isr_amount?: number;
  is_paid?: boolean;
  payment_date?: string | null;
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
  estadoPago?: EstadoPagoDetalle | null;
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

export interface UploadExpenseDocumentResponse {
  message: string;
  data: Expense;
  validacion: ValidationState;
  tipo: 'gasto';
}

export type UploadExpenseResponse = UploadExpenseDocumentResponse | UploadComplementSavedResponse;

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

/** Request para POST /api/accrued-expenses (gastos manuales por período) */
export interface CreateAccruedExpenseRequest {
  profile_id: string;
  period_id: string;
  concept: string;
  subtotal: number;
  iva_amount?: number;
  fecha: string;
  type: 'manual';
  categoria?: string;
}

/** Request para PUT /api/accrued-expenses/:id */
export interface UpdateAccruedExpenseRequest {
  concept?: string;
  subtotal?: number;
  iva_amount?: number;
  is_paid?: boolean;
  payment_date?: string | null;
  categoria?: string | null;
}

export interface GetAccruedExpensesResponse {
  data: Expense[];
}

export interface CreateAccruedExpenseResponse {
  message: string;
  data: Expense;
}

export interface UpdateAccruedExpenseResponse {
  message: string;
  data: Expense;
}

export interface DeleteAccruedExpenseResponse {
  message: string;
}
