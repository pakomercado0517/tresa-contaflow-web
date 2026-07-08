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
import type { Invoice } from '@/lib/types/invoices';
import { formatCurrency } from '@/lib/utils/format';

const DELETE_KEYWORD = 'ELIMINAR';

interface DeleteInvoiceDialogProps {
  invoice: Invoice | null;
  deleteConfirmation: string;
  onDeleteConfirmationChange: (value: string) => void;
  deleteError: string | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteInvoiceDialog({
  invoice,
  deleteConfirmation,
  onDeleteConfirmationChange,
  deleteError,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteInvoiceDialogProps) {
  const isDeleteBlocked = isDeleting || deleteConfirmation.trim() !== DELETE_KEYWORD;

  return (
    <Dialog open={!!invoice} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar factura</DialogTitle>
          <DialogDescription>
            Esta acción eliminará la factura seleccionada y no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        {invoice && (
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">{invoice.nombre_emisor}</p>
            <p className="text-muted-foreground">{invoice.concepto || 'Sin concepto'}</p>
            <p className="text-muted-foreground mt-1">Total: {formatCurrency(invoice.total)}</p>
            <p className="text-muted-foreground mt-1 font-mono text-xs">UUID: {invoice.uuid}</p>
          </div>
        )}
        {invoice && (
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
