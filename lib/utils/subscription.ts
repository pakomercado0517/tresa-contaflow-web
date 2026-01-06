import type { Plan } from "@/lib/types/subscription";

/**
 * Obtiene el límite de perfiles según el plan
 */
export function getProfileLimit(plan: Plan): number {
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
 */
export function canCreateProfile(
  currentCount: number,
  plan: Plan
): boolean {
  const limit = getProfileLimit(plan);
  return currentCount < limit;
}

/**
 * Obtiene el número de perfiles restantes
 */
export function getRemainingProfiles(
  currentCount: number,
  plan: Plan
): number {
  const limit = getProfileLimit(plan);
  if (limit === Infinity) {
    return Infinity;
  }
  return Math.max(0, limit - currentCount);
}

/**
 * Obtiene un mensaje descriptivo del límite del plan
 */
export function getProfileLimitMessage(plan: Plan): string {
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

