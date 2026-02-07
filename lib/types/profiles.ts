export interface Profile {
  id: string;
  user_id: string;
  nombre: string;
  rfc: string;
  tipo_persona: 'FISICA' | 'MORAL';
  regimenes_fiscales: string[];
  validaciones_habilitadas: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  frozen?: boolean;
  frozen_reason?: 'plan_limit' | 'user_suspension' | 'payment_issue' | null;
  frozen_at?: string | null;
}

export interface GetProfilesResponse {
  data: Profile[];
  count: number;
}

export interface GetProfileResponse {
  data: Profile;
}

export interface CreateProfileRequest {
  nombre: string;
  rfc: string;
  tipo_persona: 'FISICA' | 'MORAL';
  regimenes_fiscales?: string[];
  validaciones_habilitadas?: {
    validarRFCIngresos?: boolean;
    validarRFCGastos?: boolean;
    validarRegimenFiscal?: boolean;
    validarUUIDDuplicado?: boolean;
    bloquearSiRFCNoCoincide?: boolean;
    bloquearSiRegimenNoCoincide?: boolean;
  };
}

export interface CreateProfileResponse {
  message: string;
  data: Profile;
}

export interface UpdateProfileRequest {
  nombre?: string;
  rfc?: string;
  tipo_persona?: 'FISICA' | 'MORAL';
  regimenes_fiscales?: string[];
  validaciones_habilitadas?: {
    validarRFCIngresos?: boolean;
    validarRFCGastos?: boolean;
    validarRegimenFiscal?: boolean;
    validarUUIDDuplicado?: boolean;
    bloquearSiRFCNoCoincide?: boolean;
    bloquearSiRegimenNoCoincide?: boolean;
  };
}

export interface UpdateProfileResponse {
  message: string;
  data: Profile;
}

export interface DeleteProfileResponse {
  message: string;
}
