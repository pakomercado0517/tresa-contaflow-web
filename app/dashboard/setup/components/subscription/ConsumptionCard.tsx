import { BarChart3, FileText, Users, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Subscription } from '@/lib/types/subscription';
import type { SATPlanInfo } from '@/lib/types/sat';

interface ConsumptionCardProps {
  subscription: Subscription | null;
  currentProfilesCount: number;
  /** Total de facturas + gastos procesados este mes (solo informativo, ya sin límite) */
  xmlUsed: number;
  satPlanInfo?: SATPlanInfo | null;
}

export function ConsumptionCard({
  subscription,
  currentProfilesCount,
  xmlUsed,
  satPlanInfo,
}: ConsumptionCardProps) {
  const profilesLimit = subscription?.limits?.profiles ?? 1;
  const profilesLimitValue = profilesLimit === null ? Infinity : profilesLimit;
  const profilesPercentage =
    profilesLimitValue === Infinity
      ? 0
      : Math.min(100, (currentProfilesCount / profilesLimitValue) * 100);
  const profilesNearLimit = profilesLimitValue !== Infinity && profilesPercentage >= 80;

  // Búsquedas SAT con IA
  const satAISearchesUsed = satPlanInfo?.aiSearchesUsed ?? 0;
  const satAISearchesLimit = satPlanInfo?.aiSearchesLimit ?? null;
  const satAISearchesLimitValue = satAISearchesLimit === null ? Infinity : satAISearchesLimit;
  const satAISearchesPercentage =
    satAISearchesLimitValue === Infinity
      ? 0
      : Math.min(100, (satAISearchesUsed / satAISearchesLimitValue) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Consumo del Mes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Documentos procesados — informativo, sin límite */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
              <FileText className="text-primary h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Documentos procesados</p>
              <p className="text-muted-foreground text-xs">Facturas y gastos este mes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{xmlUsed.toLocaleString('es-MX')}</span>
            <Badge variant="secondary" className="text-xs">
              Sin límite
            </Badge>
          </div>
        </div>

        {/* Perfiles activos — con barra de progreso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">Perfiles de facturación (RFCs)</span>
            </div>
            <span className={`font-medium ${profilesNearLimit ? 'text-amber-500' : ''}`}>
              {currentProfilesCount}
              {' / '}
              {profilesLimitValue === Infinity ? '∞' : profilesLimitValue}
            </span>
          </div>
          <Progress
            value={profilesPercentage}
            className={`h-2 ${profilesNearLimit ? '[&>div]:bg-amber-500' : ''}`}
          />
          {profilesNearLimit && profilesLimitValue !== Infinity && (
            <p className="text-xs text-amber-500">
              {profilesLimitValue - currentProfilesCount === 0
                ? 'Límite alcanzado. Actualiza tu plan para agregar más.'
                : `Solo te queda ${profilesLimitValue - currentProfilesCount} perfil disponible.`}
            </p>
          )}
        </div>

        {/* Búsquedas SAT con IA — solo si tiene límite */}
        {satPlanInfo && satAISearchesLimit !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Bot className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Búsquedas SAT con IA</span>
              </div>
              <span
                className={`font-medium ${satAISearchesPercentage >= 80 ? 'text-amber-500' : ''}`}
              >
                {satAISearchesUsed} / {satAISearchesLimit}
              </span>
            </div>
            <Progress
              value={satAISearchesPercentage}
              className={`h-2 ${satAISearchesPercentage >= 80 ? '[&>div]:bg-amber-500' : ''}`}
            />
            {satPlanInfo.aiSearchesRemaining !== null && satPlanInfo.aiSearchesRemaining <= 10 && (
              <p className="text-xs text-amber-500">
                {satPlanInfo.aiSearchesRemaining === 0
                  ? 'Sin búsquedas IA disponibles este mes.'
                  : `Solo te quedan ${satPlanInfo.aiSearchesRemaining} búsquedas IA disponibles.`}
              </p>
            )}
          </div>
        )}

        {/* Búsquedas SAT IA ilimitadas — badge informativo */}
        {satPlanInfo && satAISearchesLimit === null && (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
                <Bot className="text-primary h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Búsquedas SAT con IA</p>
                <p className="text-muted-foreground text-xs">Usadas este mes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{satAISearchesUsed.toLocaleString('es-MX')}</span>
              <Badge variant="secondary" className="text-xs">
                Sin límite
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
