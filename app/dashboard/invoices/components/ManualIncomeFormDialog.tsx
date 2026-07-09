'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ManualIncome } from '@/lib/types/manual-incomes';

interface ManualIncomeFormDialogProps {
  open: boolean;
  editingManualIncome: ManualIncome | null;
  concept: string;
  onConceptChange: (value: string) => void;
  subtotal: string;
  onSubtotalChange: (value: string) => void;
  iva: string;
  onIvaChange: (value: string) => void;
  fecha: string;
  onFechaChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isPaid: boolean;
  onIsPaidChange: (value: boolean) => void;
  paymentDate: string;
  onPaymentDateChange: (value: string) => void;
  formError: string | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function ManualIncomeFormDialog({
  open,
  editingManualIncome,
  concept,
  onConceptChange,
  subtotal,
  onSubtotalChange,
  iva,
  onIvaChange,
  fecha,
  onFechaChange,
  notes,
  onNotesChange,
  isPaid,
  onIsPaidChange,
  paymentDate,
  onPaymentDateChange,
  formError,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ManualIncomeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle>
            {editingManualIncome ? 'Editar ingreso manual' : 'Agregar ingreso manual'}
          </DialogTitle>
          <DialogDescription>
            {editingManualIncome
              ? 'Actualiza el concepto, montos o notas. No incluye factura CFDI.'
              : 'Registra un ingreso sin factura CFDI para el período seleccionado.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="manual-income-concept">Concepto</Label>
            <Input
              id="manual-income-concept"
              value={concept}
              onChange={(e) => onConceptChange(e.target.value)}
              placeholder="Ej. Honorarios diciembre"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="manual-income-subtotal">Subtotal (MXN)</Label>
              <Input
                id="manual-income-subtotal"
                type="text"
                inputMode="decimal"
                value={subtotal}
                onChange={(e) => onSubtotalChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manual-income-iva">IVA (MXN)</Label>
              <Input
                id="manual-income-iva"
                type="text"
                inputMode="decimal"
                value={iva}
                onChange={(e) => onIvaChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="manual-income-fecha">Fecha</Label>
            <Input
              id="manual-income-fecha"
              type="date"
              value={fecha}
              onChange={(e) => onFechaChange(e.target.value)}
              disabled={!!editingManualIncome}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="manual-income-notes">Notas (opcional)</Label>
            <Input
              id="manual-income-notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Cliente, referencia..."
            />
          </div>
          {editingManualIncome && (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="manual-income-paid">Cobrado</Label>
                  <p className="text-muted-foreground text-sm">
                    Marca si ya recibiste el pago de este ingreso.
                  </p>
                </div>
                <Switch id="manual-income-paid" checked={isPaid} onCheckedChange={onIsPaidChange} />
              </div>
              {isPaid && (
                <div className="grid gap-2">
                  <Label htmlFor="manual-income-payment-date">Fecha de cobro</Label>
                  <Input
                    id="manual-income-payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => onPaymentDateChange(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? 'Guardando...'
              : editingManualIncome
                ? 'Actualizar'
                : 'Crear ingreso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
