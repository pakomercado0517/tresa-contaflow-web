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
import { ProfileSelector } from './ProfileSelector';
import type { Profile } from '@/lib/types/profiles';

interface UploadExpensesProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validCount: number;
  profiles: Profile[];
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
  selectedProfile: Profile | undefined;
  isProcessing: boolean;
  onConfirm: () => void;
}

export function UploadExpensesProcessDialog({
  open,
  onOpenChange,
  validCount,
  profiles,
  selectedProfileId,
  onProfileChange,
  selectedProfile,
  isProcessing,
  onConfirm,
}: UploadExpensesProcessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecciona la empresa para procesar</DialogTitle>
          <DialogDescription>
            Se procesarán {validCount} archivo{validCount !== 1 ? 's' : ''} válido
            {validCount !== 1 ? 's' : ''}. Elige el perfil correcto para evitar sobreprocesar
            gastos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <ProfileSelector
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            onProfileChange={onProfileChange}
          />
          {selectedProfile && (
            <p className="text-muted-foreground text-sm">
              Se procesarán {validCount} archivo{validCount !== 1 ? 's' : ''} para{' '}
              <span className="text-foreground font-medium">
                {selectedProfile.nombre} ({selectedProfile.rfc})
              </span>
              .
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!selectedProfileId || isProcessing}>
            Confirmar y procesar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
