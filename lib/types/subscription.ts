export type Plan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PAST_DUE'
  | 'UNPAID'
  | 'TRIALING';

/**
 * Límites del plan (vienen del backend)
 * null significa ilimitado
 */
export interface PlanLimits {
  profiles: number | null; // Límite de RFCs emisores (null = ilimitado)
  invoicesPerMonth: number | null; // Límite de archivos XML al mes (null = ilimitado)
  expensesPerMonth: number | null; // Límite de gastos al mes (null = ilimitado)
  exportPDF: boolean; // Permite exportar PDF
  exportExcel: boolean; // Permite exportar Excel
  reports: 'basic' | 'complete' | 'advanced'; // Nivel de reportes
  support: 'none' | 'email' | 'priority'; // Tipo de soporte
  apiAccess: boolean; // Acceso a la API

  /** Buscador SAT: búsquedas básicas/mes (null = ilimitadas) */
  satBasicSearchesPerMonth?: number | null;
  /** Buscador SAT: búsquedas con IA/mes (null = ilimitadas) */
  satAISearchesPerMonth?: number | null;
  /** Buscador SAT: máx. resultados por búsqueda (null = sin límite) */
  satMaxResults?: number | null;
  satHasAIExplanations?: boolean;
  satHasHistory?: boolean;
  satHasFavorites?: boolean;
  satHasAlerts?: boolean;
  satHasLearning?: boolean;
  satHasAdvancedRanking?: boolean;
}

export interface Subscription {
  plan: Plan;
  status: SubscriptionStatus;
  planPrice: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  limits: PlanLimits; // Límites del plan actual (viene del backend)
}

export type GetSubscriptionResponse = Subscription;

export interface CreateCheckoutRequest {
  plan: 'BASIC' | 'PRO';
  promotionCode?: string;
  billing?: 'monthly' | 'annual'; // billing period requested by the client
}

export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
  message: string;
}

export interface CreatePortalSessionResponse {
  url: string;
  message: string;
}

/**
 * Plan disponible con información completa
 */
export interface AvailablePlan {
  id: Plan;
  name: Plan;
  price: number; // Precio según billing (mensual o anual)
  originalPrice: number | null; // Precio original anual (solo si billing=annual y plan no es FREE)
  billing: 'monthly' | 'annual';
  limits: PlanLimits;
  trialDays: number | null; // Días de periodo de prueba (solo BASIC y PRO)
}

/**
 * Response del endpoint GET /api/subscription/plans
 */
export interface GetAvailablePlansResponse {
  plans: AvailablePlan[];
  billing: 'monthly' | 'annual';
}

/**
 * Plan público para mostrar en la página de inicio
 * (endpoint publico: GET /api/subscription/public-plans)
 */
export interface PublicPlan {
  id: Plan;
  name: Plan;
  price: number; // Precio según billing (mensual o anual)
  originalPrice: number | null; // Precio original (descuento en anual)
  billing: 'monthly' | 'annual';
  limits: PlanLimits;
  trialDays: number | null; // Días de periodo de prueba
}

/**
 * Response del endpoint GET /api/subscription/public-plans (sin autenticación)
 */
export interface PublicPlansResponse {
  plans: PublicPlan[];
  billing: 'monthly' | 'annual';
}
