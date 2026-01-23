'use client';

import { Lock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Profile } from '@/lib/types/profiles';

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
}

export function ProfileSelector({
  profiles,
  selectedProfileId,
  onProfileChange,
}: ProfileSelectorProps) {
  return (
    <Select value={selectedProfileId} onValueChange={onProfileChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="SELECCIONAR EMPRESA / RFC" />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem
            key={profile.id}
            value={profile.id}
            disabled={profile.frozen}
            className={profile.frozen ? 'text-gray-400' : ''}
          >
            <div className="flex items-center gap-2">
              <span>
                {profile.nombre} ({profile.rfc})
              </span>
              {profile.frozen && <Lock className="h-4 w-4 text-orange-500" />}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
