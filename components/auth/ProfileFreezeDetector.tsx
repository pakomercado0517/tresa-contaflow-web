'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProfileFreezeDetector } from '@/lib/hooks/useProfileFreezeDetector';
import { ProfileFreezeModal } from '@/components/common/ProfileFreezeModal';
import type { Profile } from '@/lib/types/profiles';
import { profilesQueryOptions } from '@/lib/query/profiles-query';
import { subscriptionQueryOptions } from '@/lib/query/subscription-query';
import { profilesQueryKey, subscriptionQueryKey } from '@/lib/query/query-keys';

/**
 * Componente que detecta automáticamente cuando hay perfiles excedentes
 * y muestra el modal de congelamiento
 *
 * Se debe colocar en el layout de /dashboard
 */
export function ProfileFreezeDetector() {
  const queryClient = useQueryClient();

  // Obtener perfiles
  const { data: profilesData, isSuccess: isProfilesReady } = useQuery(profilesQueryOptions());

  const { data: subscriptionData, isSuccess: isSubscriptionReady } =
    useQuery(subscriptionQueryOptions());

  const profiles: Profile[] = profilesData?.data ?? [];
  // Usar el plan vigente solo cuando esté listo
  const plan = subscriptionData?.plan;

  // Detectar si necesita freeze
  const isDataReady = isProfilesReady && isSubscriptionReady && Boolean(plan);

  const { shouldShowModal, planLimit } = useProfileFreezeDetector({
    profiles,
    plan: plan ?? 'FREE',
    enabled: isDataReady,
  });

  // Mientras exista exceso, el modal debe permanecer abierto.
  const handleModalClose = useCallback(() => {
    // no-op: solo se cerrara cuando shouldShowModal sea false
  }, []);

  const handleFreezeSuccess = useCallback(() => {
    // Invalidar queries para refrescar datos
    queryClient.invalidateQueries({ queryKey: profilesQueryKey });
    queryClient.invalidateQueries({ queryKey: subscriptionQueryKey });
  }, [queryClient]);

  if (!isDataReady) {
    return null;
  }

  return (
    <ProfileFreezeModal
      isOpen={shouldShowModal}
      profiles={profiles}
      planLimit={planLimit}
      onClose={handleModalClose}
      onSuccess={handleFreezeSuccess}
    />
  );
}
