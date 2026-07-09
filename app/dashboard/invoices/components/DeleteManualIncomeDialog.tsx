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
import type { ManualIncome } from '@/lib/types/manual-incomes';
import { formatCurrency } from '@/lib/utils/format';

const DELETE_KEYWORD = 'ELIMINAR';

interface DeleteManualIncomeDialogProps {
  income: ManualIncome | null;
  deleteConfirmation: string;
  onDeleteConfirmationChange: (value: string) => void;
  deleteError: string | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteManualIncomeDialog({
  income,
  deleteConfirmation,
  onDeleteConfirmationChange,
  deleteError,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteManualIncomeDialogProps) {
  const isDeleteBlocked = isDeleting || deleteConfirmation.trim() !== DELETE_KEYWORD;

  return (
    <Dialog open={!!income} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar ingreso manual</DialogTitle>
          <DialogDescription>
            Esta acción eliminará el ingreso seleccionado y no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        {income && (
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">{income.concept}</p>
            <p className="text-muted-foreground mt-1">
              Total: {formatCurrency(income.subtotal + income.iva_amount)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Fecha: {new Date(income.fecha).toLocaleDateString('es-MX')}
            </p>
          </div>
        )}
        {income && (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Para confirmar, escribe{' '}
              <span className="text-foreground font-mono font-medium">{DELETE_KEYWORD}</span>.
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => onDeleteConfirmationChange(e.target.value)}
              placeholder={DELETE_KEYWORD}
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
