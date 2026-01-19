import type { Plan, Subscription } from "@/lib/types/subscription";

/**
 * Obtiene el límite de perfiles según el plan
 * Si hay una suscripción con límites dinámicos, usa esos valores
 * De lo contrario, usa los límites hardcodeados como fallback
 */
export function getProfileLimit(
  plan: Plan,
  subscription?: Subscription | null
): number {
  // Priorizar límites dinámicos del backend si están disponibles
  if (subscription?.limits?.profiles !== undefined) {
    return subscription.limits.profiles ?? Infinity;
  }

  // Fallback a límites hardcodeados si no hay suscripción o límites dinámicos
  const limits: Record<Plan, number> = {
    FREE: 1,
    BASIC: 3,
    PRO: 10,
    ENTERPRISE: Infinity,
  };

  return limits[plan];
}

/**
 * Verifica si el usuario puede crear más perfiles
 * Si hay una suscripción con límites dinámicos, usa esos valores
 */
export function canCreateProfile(
  currentCount: number,
  plan: Plan,
  subscription?: Subscription | null
): boolean {
  const limit = getProfileLimit(plan, subscription);
  return limit === Infinity || currentCount < limit;
}

/**
 * Obtiene el número de perfiles restantes
 * Si hay una suscripción con límites dinámicos, usa esos valores
 */
export function getRemainingProfiles(
  currentCount: number,
  plan: Plan,
  subscription?: Subscription | null
): number {
  const limit = getProfileLimit(plan, subscription);
  if (limit === Infinity) {
    return Infinity;
  }
  return Math.max(0, limit - currentCount);
}

/**
 * Obtiene un mensaje descriptivo del límite del plan
 * Si hay una suscripción con límites dinámicos, usa esos valores
 */
export function getProfileLimitMessage(
  plan: Plan,
  subscription?: Subscription | null
): string {
  // Priorizar límites dinámicos del backend si están disponibles
  if (subscription?.limits?.profiles !== undefined) {
    const limit = subscription.limits.profiles;
    const planNames: Record<Plan, string> = {
      FREE: "Plan Gratuito",
      BASIC: "Plan Básico",
      PRO: "Plan Pro",
      ENTERPRISE: "Plan Enterprise",
    };
    if (limit === null) {
      return `${planNames[plan]}: Perfiles ilimitados`;
    }
    return `${planNames[plan]}: ${limit} ${limit === 1 ? "perfil" : "perfiles"}`;
  }

  // Fallback a mensajes hardcodeados
  const messages: Record<Plan, string> = {
    FREE: "Plan Gratuito: 1 perfil",
    BASIC: "Plan Básico: 3 perfiles",
    PRO: "Plan Pro: 10 perfiles",
    ENTERPRISE: "Plan Enterprise: Perfiles ilimitados",
  };

  return messages[plan];
}

/**
 * Obtiene el siguiente plan recomendado para más perfiles
 */
export function getRecommendedUpgradePlan(plan: Plan): Plan | null {
  const upgrades: Record<Plan, Plan | null> = {
    FREE: "BASIC",
    BASIC: "PRO",
    PRO: "ENTERPRISE",
    ENTERPRISE: null,
  };

  return upgrades[plan];
}

/**
 * Formatea la fecha de fin del trial de forma legible
 */
export function formatTrialEndDate(endDate: string): string {
  const date = new Date(endDate);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formatea una fecha de forma legible (formato corto)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Calcula el porcentaje de progreso del trial (0-100)
 */
export function getTrialProgress(
  startDate: string | null,
  endDate: string | null
): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const total = end - start;
  const elapsed = now - start;

  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/**
 * Determina el nivel de urgencia del trial según días restantes
 */
export function getTrialUrgencyLevel(daysRemaining: number | null): {
  level: "normal" | "warning" | "urgent";
  color: string;
} {
  if (daysRemaining === null) {
    return { level: "normal", color: "blue" };
  }

  if (daysRemaining <= 3) {
    return { level: "urgent", color: "red" };
  }

  if (daysRemaining <= 7) {
    return { level: "warning", color: "orange" };
  }

  return { level: "normal", color: "blue" };
}

/**
 * Obtiene el límite de facturas (invoices) por mes según el plan
 * Si hay una suscripción con límites dinámicos, usa esos valores
 */
export function getInvoicesLimit(
  plan: Plan,
  subscription?: Subscription | null
): number | null {
  // Priorizar límites dinámicos del backend si están disponibles
  if (subscription?.limits?.invoicesPerMonth !== undefined) {
    return subscription.limits.invoicesPerMonth;
  }

  // Fallback a límites hardcodeados si no hay suscripción o límites dinámicos
  const limits: Record<Plan, number | null> = {
    FREE: 25,
    BASIC: 300,
    PRO: null, // Ilimitado
    ENTERPRISE: 5000,
  };

  return limits[plan];
}

/**
 * Obtiene el límite de gastos (expenses) por mes según el plan
 * Si hay una suscripción con límites dinámicos, usa esos valores
 */
export function getExpensesLimit(
  plan: Plan,
  subscription?: Subscription | null
): number | null {
  // Priorizar límites dinámicos del backend si están disponibles
  if (subscription?.limits?.expensesPerMonth !== undefined) {
    return subscription.limits.expensesPerMonth;
  }

  // Fallback a límites hardcodeados si no hay suscripción o límites dinámicos
  const limits: Record<Plan, number | null> = {
    FREE: 25,
    BASIC: 300,
    PRO: null, // Ilimitado
    ENTERPRISE: null, // Ilimitado
  };

  return limits[plan];
}

/**
 * Verifica si el usuario puede subir más facturas según su plan y uso actual
 */
export function canUploadInvoices(
  currentCount: number,
  plan: Plan,
  subscription?: Subscription | null
): boolean {
  const limit = getInvoicesLimit(plan, subscription);
  if (limit === null) {
    return true; // Ilimitado
  }
  return currentCount < limit;
}

/**
 * Verifica si el usuario puede subir más gastos según su plan y uso actual
 */
export function canUploadExpenses(
  currentCount: number,
  plan: Plan,
  subscription?: Subscription | null
): boolean {
  const limit = getExpensesLimit(plan, subscription);
  if (limit === null) {
    return true; // Ilimitado
  }
  return currentCount < limit;
}

/**
 * Obtiene el número de facturas restantes que puede subir
 */
export function getRemainingInvoices(
  currentCount: number,
  plan: Plan,
  subscription?: Subscription | null
): number | null {
  const limit = getInvoicesLimit(plan, subscription);
  if (limit === null) {
    return null; // Ilimitado
  }
  return Math.max(0, limit - currentCount);
}

/**
 * Obtiene el número de gastos restantes que puede subir
 */
export function getRemainingExpenses(
  currentCount: number,
  plan: Plan,
  subscription?: Subscription | null
): number | null {
  const limit = getExpensesLimit(plan, subscription);
  if (limit === null) {
    return null; // Ilimitado
  }
  return Math.max(0, limit - currentCount);
}

