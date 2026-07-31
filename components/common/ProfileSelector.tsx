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

  function handleProfileChange(profileId: string) {
    const selectedProfile = profiles.find((p) => p.id === profileId);
    if (selectedProfile?.frozen) {
      return;
    }
    setStoredDashboardFilters({ profileId });

    const params = new URLSearchParams(searchParams.toString());
    params.set('profileId', profileId);
    for (const param of clearParamsOnChange) {
      params.delete(param);
    }
    router.push(`/dashboard?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={selectedProfileId} onValueChange={handleProfileChange}>
      <SelectTrigger className={triggerClassName} aria-label="Seleccionar perfil">
        <SelectValue placeholder="Selecciona un RFC" />
      </SelectTrigger>
      <SelectContent>
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
  );
}
