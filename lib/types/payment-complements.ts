export type ComplementRole = 'INGRESO' | 'EGRESO';

export interface PaymentComplementProfileSummary {
  id: string;
  nombre: string;
  rfc: string;
}

export interface PaymentComplementListItem {
  link_id: string;
  profile_id: string;
  profile: PaymentComplementProfileSummary;
  role: ComplementRole;
  id: string;
  uuid: string;
  fecha_emision: string;
  rfc_emisor: string;
  rfc_receptor: string;
  total_pagado: number;
  cantidad_facturas_relacionadas: number;
  cantidad_items_conciliados: number;
  cantidad_items_sin_conciliar: number;
  fechas_pago: string[];
}

export interface PaymentComplementItemRow {
  id: string;
  factura_uuid: string;
  fecha_pago: string;
  forma_pago: string;
  moneda_pago: string;
  tipo_cambio_pago: number;
  monto_pago: number;
  num_operacion: string | null;
  num_parcialidad: number;
  imp_pagado: number;
  imp_saldo_ant: number;
  imp_saldo_insoluto: number;
  conciliado: boolean;
  documento_relacionado_tipo: 'invoice' | 'expense' | null;
  documento_relacionado_id: string | null;
}

export interface ComplementoPagoFacturaRelacionada {
  uuid: string;
  monedaDR: string;
  tipoCambioDR: number;
  metodoPagoDR: string;
  numParcialidad: number;
  impSaldoAnt: number;
  impPagado: number;
  impSaldoInsoluto: number;
}

export interface ComplementoPagoPagoItem {
  fechaPago: string;
  formaPago: string;
  monedaPago: string;
  tipoCambio?: number;
  monto: number;
  numOperacion?: string | null;
  facturasRelacionadas: ComplementoPagoFacturaRelacionada[];
}

export interface ComplementoPago {
  pagos: ComplementoPagoPagoItem[];
}

export interface PaymentComplementDetail extends PaymentComplementListItem {
  complemento_data: ComplementoPago;
  items: PaymentComplementItemRow[];
}

export interface PaymentComplementsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListPaymentComplementsResponse {
  data: PaymentComplementListItem[];
  pagination: PaymentComplementsPagination;
}

export interface GetPaymentComplementResponse {
  data: PaymentComplementDetail;
}
