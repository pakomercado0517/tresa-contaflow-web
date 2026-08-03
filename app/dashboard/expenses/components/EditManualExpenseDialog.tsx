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
import {
  MANUAL_ENTRY_IVA_RATE_OPTIONS,
  type ManualEntryIvaRateOption,
} from '@/lib/utils/manual-entry-iva';
import { MANUAL_EXPENSE_CATEGORIES } from './expenses-list-display-utils';

interface EditManualExpenseDialogProps {
  open: boolean;
  editConcept: string;
  onEditConceptChange: (value: string) => void;
  editSubtotal: string;
  onEditSubtotalChange: (value: string) => void;
  editIvaAmount: string;
  onEditIvaAmountChange: (value: string) => void;
  editIvaRateOption: ManualEntryIvaRateOption;
  onEditIvaRateOptionChange: (value: ManualEntryIvaRateOption) => void;
  editIsPaid: boolean;
  onEditIsPaidChange: (value: boolean) => void;
  editPaymentDate: string;
  onEditPaymentDateChange: (value: string) => void;
  editCategoria: string;
  onEditCategoriaChange: (value: string) => void;
  editError: string | null;
  isUpdatingManual: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function EditManualExpenseDialog({
  open,
  editConcept,
  onEditConceptChange,
  editSubtotal,
  onEditSubtotalChange,
  editIvaAmount,
  onEditIvaAmountChange,
  editIvaRateOption,
  onEditIvaRateOptionChange,
  editIsPaid,
  onEditIsPaidChange,
  editPaymentDate,
  onEditPaymentDateChange,
  editCategoria,
  onEditCategoriaChange,
  editError,
  isUpdatingManual,
  onClose,
  onSubmit,
}: EditManualExpenseDialogProps) {
  const isIvaManual = editIvaRateOption === 'otro';

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle>Editar gasto manual</DialogTitle>
          <DialogDescription>
            Actualiza concepto, montos o estado de pago. No incluye factura CFDI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-concept">Concepto</Label>
            <Input
              id="edit-concept"
              value={editConcept}
              onChange={(e) => onEditConceptChange(e.target.value)}
              placeholder="Ej. Viáticos marzo"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-iva-rate">Tasa de IVA</Label>
            <Select
              value={editIvaRateOption}
              onValueChange={(value) => onEditIvaRateOptionChange(value as ManualEntryIvaRateOption)}
            >
              <SelectTrigger id="edit-iva-rate">
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-subtotal">Subtotal (MXN)</Label>
              <Input
                id="edit-subtotal"
                type="text"
                inputMode="decimal"
                value={editSubtotal}
                onChange={(e) => onEditSubtotalChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-iva-amount">
                IVA (MXN) {isIvaManual ? '(manual)' : ''}
              </Label>
              <Input
                id="edit-iva-amount"
                type="text"
                inputMode="decimal"
                value={editIvaAmount}
                onChange={(e) => onEditIvaAmountChange(e.target.value)}
                placeholder="0.00"
                disabled={!isIvaManual}
                className={isIvaManual ? undefined : 'bg-muted/50'}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="edit-paid">Pagado</Label>
              <p className="text-muted-foreground text-sm">Marca si ya pagaste este gasto.</p>
            </div>
            <Switch id="edit-paid" checked={editIsPaid} onCheckedChange={onEditIsPaidChange} />
          </div>
          {editIsPaid && (
            <div className="grid gap-2">
              <Label htmlFor="edit-payment-date">Fecha de pago</Label>
              <Input
                id="edit-payment-date"
                type="date"
                value={editPaymentDate}
                onChange={(e) => onEditPaymentDateChange(e.target.value)}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Select
              value={editCategoria || 'none'}
              onValueChange={(v) => onEditCategoriaChange(v === 'none' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin categoría</SelectItem>
                {MANUAL_EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {editError && (
            <Alert variant="destructive">
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdatingManual}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isUpdatingManual}>
            {isUpdatingManual ? 'Guardando...' : 'Actualizar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
