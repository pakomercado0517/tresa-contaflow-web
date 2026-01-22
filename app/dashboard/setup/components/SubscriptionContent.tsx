import dynamic from "next/dynamic";
import { CurrentPlanCard } from "./subscription/CurrentPlanCard";
import { ConsumptionCard } from "./subscription/ConsumptionCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import type { Subscription } from "@/lib/types/subscription";
import type { SATPlanInfo } from "@/lib/types/sat";

// Lazy load AvailablePlans (componente grande con Stripe)
const AvailablePlans = dynamic(() => import("./subscription/AvailablePlans").then((mod) => ({ default: mod.AvailablePlans })), {
  loading: () => (
    <div className="h-96 w-full animate-pulse rounded-lg bg-muted flex items-center justify-center">
      <LoadingSpinner message="Cargando planes..." />
    </div>
  ),
  ssr: true, // Se puede renderizar en servidor, pero lazy load para reducir bundle inicial
});

interface SubscriptionContentProps {
  subscription: Subscription | null;
  currentProfilesCount: number;
  xmlUsed: number;
  satPlanInfo?: SATPlanInfo | null;
}

export function SubscriptionContent({
  subscription,
  currentProfilesCount,
  xmlUsed,
  satPlanInfo,
}: SubscriptionContentProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Gestión de Suscripciones</h2>
        <p className="text-muted-foreground mt-2">
          Visualiza tu consumo, gestiona tu plan y accede a opciones de
          facturación.
        </p>
      </div>

      {/* Top Section: Current Plan and Consumption */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CurrentPlanCard subscription={subscription} />
        <ConsumptionCard
          subscription={subscription}
          currentProfilesCount={currentProfilesCount}
          xmlUsed={xmlUsed}
          satPlanInfo={satPlanInfo}
        />
      </div>

      {/* Bottom Section: Available Plans */}
      <AvailablePlans currentPlan={subscription?.plan || "FREE"} />
    </div>
  );
}

