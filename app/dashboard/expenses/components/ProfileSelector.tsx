"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile } from "@/lib/types/profiles";

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
    <Select value={selectedProfileId || "all"} onValueChange={onProfileChange}>
      <SelectTrigger className="w-full min-w-0 sm:w-[200px] md:w-[280px]">
        <SelectValue placeholder="SELECCIONAR EMPRESA / RFC" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">TODOS LOS PERFILES</SelectItem>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            {profile.nombre} ({profile.rfc})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

