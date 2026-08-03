'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  MANUAL_ENTRY_IVA_RATE_OPTIONS,
  type ManualEntryIvaRateOption,
} from '@/lib/utils/manual-entry-iva';

interface ManualIncomeFormDialogProps {
  open: boolean;
  editingManualIncome: ManualIncome | null;
  concept: string;
  onConceptChange: (value: string) => void;
  subtotal: string;
  onSubtotalChange: (value: string) => void;
  ivaAmount: string;
  onIvaAmountChange: (value: string) => void;
  ivaRateOption: ManualEntryIvaRateOption;
  onIvaRateOptionChange: (value: ManualEntryIvaRateOption) => void;
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
  ivaAmount,
  onIvaAmountChange,
  ivaRateOption,
  onIvaRateOptionChange,
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
  const isIvaManual = ivaRateOption === 'otro';
  const selectedRateLabel =
    MANUAL_ENTRY_IVA_RATE_OPTIONS.find((option) => option.value === ivaRateOption)?.label ?? 'IVA';

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
          <div className="grid gap-2">
            <Label htmlFor="manual-income-iva-rate">Tasa de IVA</Label>
            <Select
              value={ivaRateOption}
              onValueChange={(value) => onIvaRateOptionChange(value as ManualEntryIvaRateOption)}
            >
              <SelectTrigger id="manual-income-iva-rate">
                <SelectValue placeholder="Selecciona la tasa de IVA" />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_ENTRY_IVA_RATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isIvaManual && (
              <p className="text-muted-foreground text-xs">
                Captura el monto de IVA manualmente en el campo inferior.
              </p>
            )}
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
              <Label htmlFor="manual-income-iva-amount">
                IVA (MXN){' '}
                <span className="text-muted-foreground">
                  ({isIvaManual ? 'manual' : selectedRateLabel})
                </span>
              </Label>
              <Input
                id="manual-income-iva-amount"
                type="text"
                inputMode="decimal"
                value={ivaAmount}
                onChange={(e) => onIvaAmountChange(e.target.value)}
                placeholder="0.00"
                disabled={!isIvaManual}
                className={isIvaManual ? undefined : 'bg-muted/50'}
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
