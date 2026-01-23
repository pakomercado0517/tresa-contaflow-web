// Tipos TypeScript para el catálogo SAT
// Basado en la documentación: docs/api-information/sat.md

export interface SATProductServiceAttributes {
  id: string; // Clave del SAT (ej: "80141600")
  descripcion: string; // Descripción del producto/servicio
  incluir_iva_trasladado: "Sí" | "No" | "Opcional";
  incluir_ieps_trasladado: "Sí" | "No" | "Opcional";
  complemento_que_debe_incluir: string | null;
  fecha_inicio_vigencia: string; // ISO 8601
  fecha_fin_vigencia: string | null; // ISO 8601 o null
  estimulo_franja_fronteriza: string;
  palabras_similares: string | null;
  created_at: string;
  updated_at: string;
}

export interface SATProductServiceSearchParams {
  query?: string;
  incluir_iva_trasladado?: "Sí" | "No" | "Opcional";
  incluir_ieps_trasladado?: "Sí" | "No" | "Opcional";
  limit?: number; // 1-100
  offset?: number;
}

export interface SATProductServiceSearchResponse {
  items: SATProductServiceAttributes[];
  total: number;
  limit: number;
  offset: number;
}

export interface SATSimilarityResponse {
  items: SATProductServiceAttributes[];
  total: number;
  planInfo?: SATPlanInfo;
}

export interface SATSuggestionsResponse {
  suggestions: SATProductServiceAttributes[];
  total: number;
}

export interface SATPlanInfo {
  maxResults: number | null;
  aiSearchesRemaining: number | null;
  aiSearchesLimit: number | null;
  aiSearchesUsed: number;
  hasAIExplanations: boolean;
  hasHistory: boolean;
  hasFavorites: boolean;
  hasAlerts: boolean;
  hasLearning: boolean;
  hasAdvancedRanking: boolean;
}

export interface SATStatsResponse {
  total: number;
  withIva: number;
  withIeps: number;
  active: number;
  planInfo: SATPlanInfo;
}

// Tipos para la integración con IA
export interface AISearchRequest {
  userQuery: string;
  preliminaryResults?: SATProductServiceAttributes[];
}

export interface AISearchResponse {
  searchTerms: string[];
  explanation: string;
  suggestedFilters?: {
    incluir_iva_trasladado?: "Sí" | "No" | "Opcional" | null;
    incluir_ieps_trasladado?: "Sí" | "No" | "Opcional" | null;
  };
  confidence: "high" | "medium" | "low";
}

export interface SATSearchResult {
  product: SATProductServiceAttributes;
  matchScore?: number; // Porcentaje de coincidencia (0-100)
  source: "similarity" | "ai-enhanced" | "search";
}

export interface SATSearchResults {
  results: SATSearchResult[];
  total: number;
  aiExplanation?: string;
  confidence?: "high" | "medium" | "low";
}
