"use client";

import { TrialBanner } from "@/components/subscription/TrialBanner";
import { useSubscription } from "@/lib/hooks/useSubscription";

/**
 * Wrapper component que obtiene la suscripción y muestra el TrialBanner
 * Solo se muestra si el usuario está en periodo de prueba
 */
export function TrialBannerWrapper() {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return null; // No mostrar nada mientras carga
  }

  if (!subscription || subscription.status !== "TRIALING") {
    return null; // Solo mostrar si está en trial
  }

  return <TrialBanner subscription={subscription} />;
}
