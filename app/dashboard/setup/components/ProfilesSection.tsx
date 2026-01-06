import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProfiles } from "@/lib/api/profiles";
import { getSubscription } from "@/lib/api/subscription";
import {
  canCreateProfile,
  getRemainingProfiles,
  getProfileLimitMessage,
} from "@/lib/utils/subscription";
import { ProfilesTable } from "./ProfilesTable";
import type { Plan } from "@/lib/types/subscription";

export async function ProfilesSection() {
  // No usar .catch() aquí porque captura los errores de redirect()
  // Si hay un 401, serverApiClient redirigirá automáticamente a /auth/login
  const [subscription, profiles] = await Promise.all([
    getSubscription(),
    getProfiles(),
  ]);

  const currentCount = profiles?.count || 0;
  const plan = subscription?.plan || "FREE";
  const profilesData = profiles?.data || [];
  const canCreate = canCreateProfile(currentCount, plan);
  const remaining = getRemainingProfiles(currentCount, plan);

  return (
    <div className="space-y-6">
      {/* Header con información del plan */}
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

      {/* Información del plan - Compacta */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {getProfileLimitMessage(plan)}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {currentCount} de {plan === "ENTERPRISE" ? "∞" : remaining + currentCount} perfiles utilizados
          </p>
        </div>
        {!canCreate && (
          <Link href="/dashboard/setup?tab=subscription">
            <Button variant="outline" size="sm">
              Actualizar Plan
            </Button>
          </Link>
        )}
      </div>

      {/* Tabla de perfiles */}
      <ProfilesTable
        profiles={profilesData}
        canCreate={canCreate}
        remaining={remaining}
        plan={plan}
        currentCount={currentCount}
        subscriptionStatus={subscription?.status || "ACTIVE"}
      />
    </div>
  );
}
