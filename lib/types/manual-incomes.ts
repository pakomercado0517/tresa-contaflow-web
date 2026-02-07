/**
 * Tipos para la API de ingresos manuales /api/manual-incomes
 * Documentación: docs/api-information/manual-incomes.md
 */

export interface ManualIncome {
  id: string;
  profile_id: string;
  period_id: string;
  concept: string;
  subtotal: number;
  iva_amount: number;
  fecha: string;
  is_paid: boolean;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    nombre: string;
    rfc: string;
  };
  period?: {
    id: string;
    start_date: string;
    end_date: string;
    name: string | null;
  };
}

export interface CreateManualIncomeRequest {
  profile_id: string;
  period_id: string;
  concept: string;
  subtotal: number;
  iva_amount?: number;
  fecha: string;
  notes?: string;
}

export interface UpdateManualIncomeRequest {
  concept?: string;
  subtotal?: number;
  iva_amount?: number;
  is_paid?: boolean;
  payment_date?: string | null;
  notes?: string | null;
}

export interface GetManualIncomesResponse {
  data: ManualIncome[];
}

export interface GetManualIncomeResponse {
  data: ManualIncome;
}

export interface CreateManualIncomeResponse {
  message: string;
  data: ManualIncome;
}

export interface UpdateManualIncomeResponse {
  message: string;
  data: ManualIncome;
}
