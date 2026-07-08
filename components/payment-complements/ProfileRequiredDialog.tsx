'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import type { Profile } from '@/lib/types/profiles';

interface ProfileRequiredDialogProps {
  open: boolean;
  profiles: Profile[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (profileId: string) => void;
}

export function ProfileRequiredDialog({
  open,
  profiles,
  onOpenChange,
  onConfirm,
}: ProfileRequiredDialogProps) {
  const [selectedProfileId, setSelectedProfileId] = useState('');

  const handleConfirm = () => {
    if (!selectedProfileId) return;
    onConfirm(selectedProfileId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecciona un perfil</DialogTitle>
          <DialogDescription>
            Este complemento está vinculado a más de un perfil. Elige con cuál deseas ver el
            detalle.
          </DialogDescription>
        </DialogHeader>
        <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
          <SelectTrigger>
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.nombre} ({profile.rfc})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedProfileId}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
