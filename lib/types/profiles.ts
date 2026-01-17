export interface Profile {
  id: string;
  user_id: string;
  nombre: string;
  rfc: string;
  tipo_persona: "FISICA" | "MORAL";
  regimen_fiscal: string | null;
  validaciones_habilitadas: Record<string, unknown>;
  created_at: string;
  updated_at: string;
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
  tipo_persona: "FISICA" | "MORAL";
  regimen_fiscal?: string;
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
  tipo_persona?: "FISICA" | "MORAL";
  regimen_fiscal?: string;
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
