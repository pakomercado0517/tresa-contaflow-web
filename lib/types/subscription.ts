export type Plan = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "EXPIRED"
  | "PAST_DUE"
  | "UNPAID"
  | "TRIALING";

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
  reports: "basic" | "complete" | "advanced"; // Nivel de reportes
  support: "none" | "email" | "priority"; // Tipo de soporte
  apiAccess: boolean; // Acceso a la API
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
  plan: "BASIC" | "PRO";
  promotionCode?: string;
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
  billing: "monthly" | "annual";
  limits: PlanLimits;
  trialDays: number | null; // Días de periodo de prueba (solo BASIC y PRO)
}

/**
 * Response del endpoint GET /api/subscription/plans
 */
export interface GetAvailablePlansResponse {
  plans: AvailablePlan[];
  billing: "monthly" | "annual";
}

