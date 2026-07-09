'use client';

import Link from 'next/link';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProfileLimitMessage } from '@/lib/utils/subscription';
import type { Plan, Subscription } from '@/lib/types/subscription';

interface CreateProfileFormIntroProps {
  currentProfileCount: number;
  plan: Plan;
  subscription?: Subscription | null;
  canCreate: boolean;
  remainingProfiles: number;
  limit: number;
  recommendedPlan: Plan | null;
}

export function CreateProfileFormIntro({
  currentProfileCount,
  plan,
  subscription,
  canCreate,
  remainingProfiles,
  limit,
  recommendedPlan,
}: CreateProfileFormIntroProps) {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">
        {currentProfileCount === 0 ? 'Da de alta tu primer RFC' : 'Crear nuevo perfil RFC'}
      </h2>
      <p className="text-muted-foreground mb-3">
        {currentProfileCount === 0
          ? 'Ingresa los datos fiscales para comenzar a administrar tus facturas y clientes de forma eficiente.'
          : 'Agrega un nuevo perfil fiscal para gestionar múltiples empresas.'}
      </p>

      <div className="mb-4 flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {getProfileLimitMessage(plan, subscription)}
        </Badge>
        {limit !== Infinity && (
          <span className="text-muted-foreground text-xs">
            {currentProfileCount} / {limit} perfiles
          </span>
        )}
      </div>

      {!canCreate && (
        <div className="bg-destructive/10 border-destructive/20 mb-4 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="text-destructive mb-1 text-sm font-medium">Límite de perfiles alcanzado</p>
              <p className="text-muted-foreground mb-3 text-sm">
                Has alcanzado el límite de {limit} perfil
                {limit > 1 ? 'es' : ''} de tu plan actual.{' '}
                {recommendedPlan && 'Actualiza tu plan para crear más perfiles.'}
              </p>
              {recommendedPlan && (
                <Link href="/dashboard/setup/subscription">
                  <Button type="button" variant="outline" size="sm" className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Actualizar a {recommendedPlan}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {canCreate && remainingProfiles !== Infinity && remainingProfiles > 0 && (
        <div className="border-primary/20 bg-primary/5 mb-4 rounded-lg border p-3">
          <p className="text-muted-foreground text-sm">
            Te quedan{' '}
            <span className="text-foreground font-medium">
              {remainingProfiles} perfil{remainingProfiles > 1 ? 'es' : ''}
            </span>{' '}
            disponible{remainingProfiles > 1 ? 's' : ''} en tu plan actual.
          </p>
        </div>
      )}
    </div>
  );
}
