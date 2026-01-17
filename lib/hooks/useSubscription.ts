"use client";

import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/utils/logger";
import { getSubscriptionClient } from "@/lib/api/subscription.client";
import type { Subscription } from "@/lib/types/subscription";

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener y gestionar la suscripción del usuario
 * Incluye auto-refresh y manejo de errores
 */
export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSubscriptionClient();
      setSubscription(data);
    } catch (err) {
      logger.error("Error fetching subscription", err);
      setError(
        err instanceof Error ? err.message : "Error al obtener suscripción"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    isLoading,
    error,
    refetch: fetchSubscription,
  };
}

/**
 * Calcula los días restantes del período de prueba
 * Retorna null si no está en período de prueba
 */
export function getTrialDaysRemaining(
  subscription: Subscription | null
): number | null {
  if (!subscription || subscription.status !== "TRIALING") {
    return null;
  }

  if (!subscription.currentPeriodEnd) {
    return null;
  }

  const endDate = new Date(subscription.currentPeriodEnd);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Verifica si el usuario tiene acceso a una característica premium
 */
export function hasFeatureAccess(
  subscription: Subscription | null,
  feature: "pdf_export" | "excel_export" | "api_access" | "priority_support"
): boolean {
  if (!subscription) return false;

  const plan = subscription.plan;

  // FREE no tiene acceso a características premium
  if (plan === "FREE") return false;

  // Verificar si la suscripción está activa
  const isActive = ["ACTIVE", "TRIALING"].includes(subscription.status);
  if (!isActive) return false;

  switch (feature) {
    case "pdf_export":
      return ["BASIC", "PRO", "ENTERPRISE"].includes(plan);
    case "excel_export":
      return ["PRO", "ENTERPRISE"].includes(plan);
    case "api_access":
      return ["PRO", "ENTERPRISE"].includes(plan);
    case "priority_support":
      return ["PRO", "ENTERPRISE"].includes(plan);
    default:
      return false;
  }
}
