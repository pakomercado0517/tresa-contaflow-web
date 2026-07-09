import Link from "next/link";
import { Plus, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  canCreateProfile,
  getRemainingProfiles,
  getProfileLimitMessage,
  getProfileLimit,
  getRecommendedUpgradePlan,
} from "@/lib/utils/subscription";
import type { GetProfilesResponse } from "@/lib/types/profiles";
import type { GetSubscriptionResponse } from "@/lib/types/subscription";
import { ProfilesTable } from "./ProfilesTable";

export interface ProfilesSectionViewProps {
  profiles: GetProfilesResponse;
  subscription: GetSubscriptionResponse;
}

export function ProfilesSectionView({
  profiles,
  subscription,
}: ProfilesSectionViewProps) {
  const currentCount = profiles?.count || 0;
  const plan = subscription?.plan || "FREE";
  const profilesData = profiles?.data || [];
  const canCreate = canCreateProfile(currentCount, plan, subscription);
  const remaining = getRemainingProfiles(currentCount, plan, subscription);
  const limit = getProfileLimit(plan, subscription);
  const recommendedPlan = getRecommendedUpgradePlan(plan);

  const usagePercentage =
    limit === Infinity ? 0 : Math.min(100, (currentCount / limit) * 100);

  const warningLevel =
    limit === Infinity
      ? null
      : usagePercentage >= 100
        ? "error"
        : usagePercentage >= 90
          ? "warning"
          : usagePercentage >= 75
            ? "info"
            : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Perfiles RFC</h2>
          <p className="text-muted-foreground mt-1">
            Gestiona tus perfiles fiscales (RFCs)
          </p>
        </div>
        <Link href="/dashboard/setup/profiles/new">
          <Button disabled={!canCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Perfil
          </Button>
        </Link>
      </div>

      {limit !== Infinity ? (
        <Alert
          className={
            warningLevel === "error"
              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
              : warningLevel === "warning"
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                : warningLevel === "info"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                  : "border-border"
          }
        >
          <AlertCircle
            className={`h-4 w-4 ${
              warningLevel === "error"
                ? "text-red-600"
                : warningLevel === "warning"
                  ? "text-orange-600"
                  : warningLevel === "info"
                    ? "text-blue-600"
                    : "text-muted-foreground"
            }`}
          />
          <AlertTitle>Uso de Perfiles</AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {currentCount} / {limit} perfiles utilizados
              </span>
              <span className="font-medium">{Math.round(usagePercentage)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            {warningLevel === "error" && (
              <p className="text-sm font-medium">
                Has alcanzado el límite de tu plan.{" "}
                {recommendedPlan && (
                  <Link
                    href="/dashboard/setup?tab=subscription"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Actualiza a {recommendedPlan} <Sparkles className="h-4 w-4" />
                  </Link>
                )}
              </p>
            )}
            {warningLevel === "warning" && remaining !== null && remaining > 0 && (
              <p className="text-sm">
                Te quedan {remaining} perfil{remaining !== 1 ? "es" : ""} disponibles en tu plan
                actual.
                {recommendedPlan && (
                  <Link
                    href="/dashboard/setup?tab=subscription"
                    className="text-primary hover:underline ml-1 inline-flex items-center gap-1"
                  >
                    Considera actualizar tu plan <Sparkles className="h-4 w-4" />
                  </Link>
                )}
              </p>
            )}
            {warningLevel === "info" && remaining !== null && (
              <p className="text-sm text-muted-foreground">
                Te quedan {remaining} perfiles disponibles en tu plan actual.
              </p>
            )}
            {!warningLevel && remaining !== null && remaining > 0 && (
              <p className="text-sm text-muted-foreground">
                Te quedan {remaining} perfiles disponibles en tu plan actual.
              </p>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-border">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <AlertTitle>Uso de Perfiles</AlertTitle>
          <AlertDescription>
            <div className="flex items-center justify-between text-sm">
              <span>{currentCount} perfiles utilizados</span>
              <Badge variant="outline" className="ml-2">
                {getProfileLimitMessage(plan, subscription)}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <ProfilesTable
        profiles={profilesData}
        canCreate={canCreate}
        remaining={remaining}
        plan={plan}
        currentCount={currentCount}
        subscriptionStatus={subscription?.status || "ACTIVE"}
        subscription={subscription}
      />
    </div>
  );
}
