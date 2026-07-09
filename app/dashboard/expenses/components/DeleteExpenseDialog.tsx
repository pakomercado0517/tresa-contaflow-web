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
import type { Expense } from '@/lib/types/expenses';
import { formatCurrency } from '@/lib/utils/format';

const DELETE_KEYWORD = 'ELIMINAR';

interface DeleteExpenseDialogProps {
  expense: Expense | null;
  deleteConfirmation: string;
  onDeleteConfirmationChange: (value: string) => void;
  deleteError: string | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteExpenseDialog({
  expense,
  deleteConfirmation,
  onDeleteConfirmationChange,
  deleteError,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteExpenseDialogProps) {
  const isDeleteBlocked = isDeleting || deleteConfirmation.trim() !== DELETE_KEYWORD;

  return (
    <Dialog open={!!expense} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar gasto</DialogTitle>
          <DialogDescription>
            Esta acción eliminará el gasto seleccionado y no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        {expense && (
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">{expense.nombre_emisor || 'Sin emisor'}</p>
            <p className="text-muted-foreground">{expense.concepto || 'Sin concepto'}</p>
            <p className="text-muted-foreground mt-1">Total: {formatCurrency(expense.total)}</p>
            {expense.uuid && (
              <p className="text-muted-foreground mt-1 font-mono text-xs">UUID: {expense.uuid}</p>
            )}
          </div>
        )}
        {expense && (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Para confirmar, escribe{' '}
              <span className="text-foreground font-mono font-medium">{DELETE_KEYWORD}</span>.
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(event) => onDeleteConfirmationChange(event.target.value)}
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
