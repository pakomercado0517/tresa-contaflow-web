export interface ProfileFiscalSettings {
  id: string;
  profile_id: string;
  ejercicio: number;
  coeficiente_utilidad: number | null;
  coeficiente_utilidad_ejercicio_anterior: number | null;
  isr_pagos_provisionales_acum: number;
  saldo_a_favor_isr: number;
  saldo_a_favor_iva: number;
  perdidas_fiscales_pendientes: number;
  ptu_pagada_acum: number;
  created_at: string;
  updated_at: string;
}

export interface GetFiscalSettingsResponse {
  data: ProfileFiscalSettings | null;
}

export interface UpdateFiscalSettingsRequest {
  ejercicio: number;
  coeficiente_utilidad?: number | null;
  coeficiente_utilidad_ejercicio_anterior?: number | null;
  isr_pagos_provisionales_acum?: number;
  saldo_a_favor_isr?: number;
  saldo_a_favor_iva?: number;
  perdidas_fiscales_pendientes?: number;
  ptu_pagada_acum?: number;
}

export interface UpdateFiscalSettingsResponse {
  message: string;
  data: ProfileFiscalSettings;
}
