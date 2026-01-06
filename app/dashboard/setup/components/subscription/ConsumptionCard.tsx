import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPlanDetails } from "@/lib/utils/plans";
import type { Subscription } from "@/lib/types/subscription";

interface ConsumptionCardProps {
  subscription: Subscription | null;
  currentProfilesCount: number;
}

export function ConsumptionCard({
  subscription,
  currentProfilesCount,
}: ConsumptionCardProps) {
  const plan = subscription?.plan || "FREE";
  const planDetails = getPlanDetails(plan);

  // TODO: Obtener datos reales de consumo de XML desde la API
  const xmlUsed = 850;
  const xmlLimit =
    planDetails.xmlLimit === "unlimited" ? Infinity : planDetails.xmlLimit;
  const xmlPercentage =
    xmlLimit === Infinity ? 0 : (xmlUsed / xmlLimit) * 100;

  const profilesLimit =
    planDetails.profilesLimit === "unlimited"
      ? Infinity
      : planDetails.profilesLimit;
  const profilesPercentage =
    profilesLimit === Infinity
      ? 0
      : (currentProfilesCount / profilesLimit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Consumo del Mes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Archivos XML subidos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Archivos XML subidos
            </span>
            <span className="font-medium">
              {xmlUsed} /{" "}
              {xmlLimit === Infinity ? "∞" : xmlLimit}
            </span>
          </div>
          <Progress
            value={xmlPercentage}
            className="h-2"
          />
        </div>

        {/* Perfiles de Facturación */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Perfiles de Facturación (RFCs)
            </span>
            <span className="font-medium">
              {currentProfilesCount} /{" "}
              {profilesLimit === Infinity ? "∞" : profilesLimit}
            </span>
          </div>
          <Progress value={profilesPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

