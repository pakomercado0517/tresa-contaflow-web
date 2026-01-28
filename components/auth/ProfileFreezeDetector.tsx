'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useProfileFreezeDetector } from '@/lib/hooks/useProfileFreezeDetector';
import { ProfileFreezeModal } from '@/components/common/ProfileFreezeModal';
import type { GetProfilesResponse } from '@/lib/types/profiles';
import type { Profile } from '@/lib/types/profiles';
import type { Plan } from '@/lib/types/subscription';

/**
 * Componente que detecta automáticamente cuando hay perfiles excedentes
 * y muestra el modal de congelamiento
 *
 * Se debe colocar en el layout de /dashboard
 */
export function ProfileFreezeDetector() {
  const queryClient = useQueryClient();

  // Obtener perfiles
  const { data: profilesData } = useQuery<GetProfilesResponse>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await apiClient<GetProfilesResponse>('/api/profiles', {
        requireAuth: true,
      });
      return response;
    },
  });

  // Obtener plan actual
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await apiClient<{
        plan: Plan;
        status: string;
        cancelAtPeriodEnd: boolean;
        limits: { profiles: number };
      }>('/api/subscription', {
        requireAuth: true,
      });
      return response;
    },
  });

  const profiles: Profile[] = profilesData?.data ?? [];
  // Usar el plan vigente (no anticipar cambios futuros)
  const plan = subscriptionData?.plan || 'FREE';

  // Detectar si necesita freeze
  const { shouldShowModal, planLimit } = useProfileFreezeDetector({
    profiles,
    plan,
    enabled: true,
  });

  // Mientras exista exceso, el modal debe permanecer abierto.
  const handleModalClose = useCallback(() => {
    // no-op: solo se cerrara cuando shouldShowModal sea false
  }, []);

  const handleFreezeSuccess = useCallback(() => {
    // Invalidar queries para refrescar datos
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
  }, [queryClient]);

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
