import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Subscription } from "@/lib/types/subscription";

interface ConsumptionCardProps {
  subscription: Subscription | null;
  currentProfilesCount: number;
  xmlUsed: number;
}

/**
 * Calcula el límite total de XML (facturas + gastos) basado en los límites del plan
 */
function getTotalXmlLimit(
  invoicesLimit: number | null,
  expensesLimit: number | null
): number | null {
  // Si ambos son null, el límite total es ilimitado
  if (invoicesLimit === null && expensesLimit === null) {
    return null;
  }

  // Si uno es null (ilimitado) y el otro no, el total es ilimitado
  if (invoicesLimit === null || expensesLimit === null) {
    return null;
  }

  // Si ambos tienen límites, sumarlos
  return invoicesLimit + expensesLimit;
}

export function ConsumptionCard({
  subscription,
  currentProfilesCount,
  xmlUsed,
}: ConsumptionCardProps) {
  // Usar límites dinámicos del backend si están disponibles
  // null significa ilimitado, solo usar valores por defecto si no hay suscripción
  const profilesLimit = subscription?.limits?.profiles ?? 1;
  // Para XML: null = ilimitado, solo usar valores por defecto si no hay suscripción
  const invoicesLimit = subscription?.limits?.invoicesPerMonth ?? (subscription ? null : 25);
  const expensesLimit = subscription?.limits?.expensesPerMonth ?? (subscription ? null : 25);
  const totalXmlLimit = getTotalXmlLimit(invoicesLimit, expensesLimit);

  // Calcular porcentajes
  const xmlLimitValue =
    totalXmlLimit === null ? Infinity : totalXmlLimit;
  const xmlPercentage =
    xmlLimitValue === Infinity ? 0 : (xmlUsed / xmlLimitValue) * 100;

  const profilesLimitValue = profilesLimit === null ? Infinity : profilesLimit;
  const profilesPercentage =
    profilesLimitValue === Infinity
      ? 0
      : (currentProfilesCount / profilesLimitValue) * 100;

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
              {xmlLimitValue === Infinity ? "∞" : xmlLimitValue}
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
              {profilesLimitValue === Infinity ? "∞" : profilesLimitValue}
            </span>
          </div>
          <Progress value={profilesPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

