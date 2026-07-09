'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Profile } from '@/lib/types/profiles';

interface DeleteProfileDialogProps {
  profile: Profile | null;
  deleteConfirmation: string;
  onDeleteConfirmationChange: (value: string) => void;
  deleteError: string | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProfileDialog({
  profile,
  deleteConfirmation,
  onDeleteConfirmationChange,
  deleteError,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteProfileDialogProps) {
  const deleteKeyword = profile ? `ELIMINAR ${profile.rfc}` : '';
  const isDeleteBlocked = isDeleting || deleteConfirmation.trim() !== deleteKeyword;

  return (
    <Dialog open={!!profile} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar perfil</DialogTitle>
          <DialogDescription>
            Esta acción eliminará el perfil seleccionado y no se puede deshacer. También se borrarán
            todas las facturas subidas relacionadas a este perfil o RFC.
          </DialogDescription>
        </DialogHeader>
        {profile && (
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">{profile.nombre}</p>
            <p className="text-muted-foreground font-mono">{profile.rfc}</p>
          </div>
        )}
        {profile && (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Para confirmar, escribe{' '}
              <span className="text-foreground font-mono font-medium">{deleteKeyword}</span>.
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(event) => onDeleteConfirmationChange(event.target.value)}
              placeholder={deleteKeyword}
              autoComplete="off"
            />
          </div>
        )}
        {deleteError && (
          <Alert variant="destructive">
            <AlertTitle>No se pudo eliminar</AlertTitle>
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleteBlocked}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
