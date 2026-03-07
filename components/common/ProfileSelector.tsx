'use client';

import { useEffect } from 'react';
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
import {
  clearStoredProfileSelection,
  getStoredProfileSelection,
  setStoredProfileSelection,
} from '@/lib/storage/profile-selection';

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

  useEffect(() => {
    const urlProfileId = searchParams.get('profileId');
    if (urlProfileId) {
      setStoredProfileSelection(urlProfileId);
      return;
    }

    const storedProfileId = getStoredProfileSelection();
    if (!storedProfileId || storedProfileId === 'all') return;

    const storedProfile = profiles.find((profile) => profile.id === storedProfileId);
    if (!storedProfile || storedProfile.frozen) {
      clearStoredProfileSelection();
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('profileId', storedProfileId);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
    router.refresh();
  }, [searchParams, profiles, router]);

  function handleProfileChange(profileId: string) {
    // Verificar que el perfil no esté congelado
    if (profileId !== 'all') {
      const selectedProfile = profiles.find((p) => p.id === profileId);
      if (selectedProfile?.frozen) {
        return; // Prevenir selección de perfil congelado
      }
    }
    setStoredProfileSelection(profileId || 'all');

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
    <Select
      value={selectedProfileId || 'all'}
      onValueChange={(value) => handleProfileChange(value === 'all' ? '' : value)}
    >
      <SelectTrigger className={triggerClassName ?? 'min-w-[9rem] w-52'}>
        <SelectValue placeholder="Seleccionar empresa" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las empresas</SelectItem>
        {profiles.map((profile) => (
          <SelectItem
            key={profile.id}
            value={profile.id}
            disabled={profile.frozen}
            className={profile.frozen ? 'text-gray-400' : ''}
          >
            <div className="flex items-center gap-2">
              <span>{profile.nombre}</span>
              {profile.frozen && <Lock className="h-4 w-4 text-orange-500" />}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
