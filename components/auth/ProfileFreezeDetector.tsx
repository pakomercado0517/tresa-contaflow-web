'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useProfileFreezeDetector } from '@/lib/hooks/useProfileFreezeDetector';
import { ProfileFreezeModal } from '@/components/common/ProfileFreezeModal';
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
  const [showModal, setShowModal] = useState(false);

  // Obtener perfiles
  const { data: profilesData } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await apiClient<{ data: Profile[] }>('/api/profiles', {
        requireAuth: true,
      });
      return response.data;
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

  const profiles = profilesData || [];
  // Usar el plan vigente (no anticipar cambios futuros)
  const plan = subscriptionData?.plan || 'FREE';

  // Detectar si necesita freeze
  const { shouldShowModal, planLimit } = useProfileFreezeDetector({
    profiles,
    plan,
    enabled: true,
  });

  // Mostrar modal cuando se detecta exceso
  useEffect(() => {
    if (shouldShowModal && !showModal) {
      setShowModal(true);
    }
  }, [shouldShowModal, showModal]);

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleFreezeSuccess = () => {
    // Invalidar queries para refrescar datos
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['subscription'] });

    // Cerrar modal después de refrescar
    setShowModal(false);
  };

  return (
    <ProfileFreezeModal
      isOpen={showModal}
      profiles={profiles}
      planLimit={planLimit}
      onClose={handleModalClose}
      onSuccess={handleFreezeSuccess}
    />
  );
}
