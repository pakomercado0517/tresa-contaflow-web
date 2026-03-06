import type { Profile } from '@/lib/types/profiles';
import type { Plan } from '@/lib/types/subscription';

interface UseProfileFreezeDetectorProps {
  profiles: Profile[];
  plan: Plan;
  enabled?: boolean;
}

interface FreezeDetectionResult {
  shouldShowModal: boolean;
  excessCount: number;
  activeCount: number;
  planLimit: number;
}

/**
 * Hook para detectar si hay perfiles que necesitan congelarse
 * Se dispara cuando cambia el plan o los perfiles
 */
export function useProfileFreezeDetector({
  profiles,
  plan,
  enabled = true,
}: UseProfileFreezeDetectorProps): FreezeDetectionResult {
  const planLimits: Record<Plan, number> = {
    FREE: 1,
    BASIC: 5,
    PRO: 20,
    ENTERPRISE: Infinity,
  };

  if (!enabled || !profiles || !plan) {
    return {
      shouldShowModal: false,
      excessCount: 0,
      activeCount: 0,
      planLimit: 1,
    };
  }

  const limit = planLimits[plan] || 1;
  const activeProfiles = profiles.filter((p) => !p.frozen);
  const activeCount = activeProfiles.length;
  const excessCount = Math.max(0, activeCount - limit);

  // Solo mostrar modal si hay exceso Y hay perfiles activos
  const shouldShow = excessCount > 0 && activeCount > 0;

  return {
    shouldShowModal: shouldShow,
    excessCount,
    activeCount,
    planLimit: limit,
  };
}
