'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Profile } from '@/lib/types/profiles';
import { setStoredDashboardFilters } from '@/lib/storage/dashboard-filters';
import { useDashboardFiltersUrlRestoreRef } from '@/lib/navigation/use-dashboard-filters-url-restore-ref';

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedProfileId?: string;
  /** Params a eliminar de la URL al cambiar de perfil (ej: regimen_fiscal) */
  clearParamsOnChange?: string[];
  /** Clases adicionales para el trigger del select */
  triggerClassName?: string;
}

export function ProfileSelector({
  profiles,
  selectedProfileId,
  clearParamsOnChange = [],
  triggerClassName,
}: ProfileSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dashboardFiltersUrlRestoreRef = useDashboardFiltersUrlRestoreRef('/dashboard', profiles);

  function handleProfileChange(profileId: string) {
    // Verificar que el perfil no esté congelado
    if (profileId !== 'all') {
      const selectedProfile = profiles.find((p) => p.id === profileId);
      if (selectedProfile?.frozen) {
        return; // Prevenir selección de perfil congelado
      }
    }
    setStoredDashboardFilters({ profileId: profileId || 'all' });

    const params = new URLSearchParams(searchParams.toString());
    if (profileId) {
      params.set('profileId', profileId);
    } else {
      params.delete('profileId');
    }
    for (const param of clearParamsOnChange) {
      params.delete(param);
    }
    router.push(`/dashboard?${params.toString()}`, { scroll: false });
    router.refresh();
  }

  return (
    <>
      <div ref={dashboardFiltersUrlRestoreRef} className="hidden" aria-hidden />
      <Select value={selectedProfileId || 'all'} onValueChange={handleProfileChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder="Seleccionar perfil" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los perfiles</SelectItem>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id} disabled={profile.frozen}>
              <span className="flex items-center gap-2">
                {profile.frozen && <Lock className="h-3 w-3" />}
                {profile.nombre} ({profile.rfc})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
