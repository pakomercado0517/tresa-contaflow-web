"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  selectedProfileId?: string;
}

export function ProfileSelector({
  profiles,
  selectedProfileId,
}: ProfileSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleProfileChange(profileId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (profileId) {
      params.set("profileId", profileId);
    } else {
      params.delete("profileId");
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <Select
      value={selectedProfileId || "all"}
      onValueChange={(value) =>
        handleProfileChange(value === "all" ? "" : value)
      }
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Seleccionar empresa" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las empresas</SelectItem>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            {profile.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

