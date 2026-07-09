"use client";

import { useQuery } from "@tanstack/react-query";
import type { Subscription } from "@/lib/types/subscription";
import { subscriptionQueryOptions } from "@/lib/query/subscription-query";

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener y gestionar la suscripción del usuario (caché compartida vía React Query)
 */
export function useSubscription(): UseSubscriptionReturn {
  const { data, isLoading, error, refetch } = useQuery(subscriptionQueryOptions());

  return {
    subscription: data ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Error al obtener suscripción") : null,
    refetch: async () => {
      await refetch();
    },
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
 * Prioriza los límites dinámicos del backend si están disponibles
 */
export function hasFeatureAccess(
  subscription: Subscription | null,
  feature: "pdf_export" | "excel_export" | "api_access" | "priority_support"
): boolean {
  if (!subscription) return false;

  // Verificar si la suscripción está activa
  const isActive = ["ACTIVE", "TRIALING"].includes(subscription.status);
  if (!isActive) return false;

  // Priorizar límites dinámicos del backend si están disponibles
  if (subscription.limits) {
    switch (feature) {
      case "pdf_export":
        return subscription.limits.exportPDF;
      case "excel_export":
        return subscription.limits.exportExcel;
      case "api_access":
        return subscription.limits.apiAccess;
      case "priority_support":
        return subscription.limits.support === "priority";
      default:
        return false;
    }
  }

  // Fallback a lógica basada en plan si no hay límites dinámicos
  const plan = subscription.plan;

  // FREE no tiene acceso a características premium
  if (plan === "FREE") return false;

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
