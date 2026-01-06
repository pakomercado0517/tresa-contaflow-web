import { CurrentPlanCard } from "./subscription/CurrentPlanCard";
import { ConsumptionCard } from "./subscription/ConsumptionCard";
import { AvailablePlans } from "./subscription/AvailablePlans";
import type { Subscription } from "@/lib/types/subscription";

interface SubscriptionContentProps {
  subscription: Subscription | null;
  currentProfilesCount: number;
}

export function SubscriptionContent({
  subscription,
  currentProfilesCount,
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
        />
      </div>

      {/* Bottom Section: Available Plans */}
      <AvailablePlans currentPlan={subscription?.plan || "FREE"} />
    </div>
  );
}

