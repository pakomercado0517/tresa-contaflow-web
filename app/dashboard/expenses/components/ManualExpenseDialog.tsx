'use client';

import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Subscription } from '@/lib/types/subscription';
import type { Profile } from '@/lib/types/profiles';
import { useManualExpenseDialogForm } from './use-manual-expense-dialog-form';
import { ManualExpenseDialogAlerts } from './ManualExpenseDialogAlerts';
import { ManualExpenseFormFields } from './ManualExpenseFormFields';

interface ManualExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  profileId: string;
  periodId: string;
  profiles: Profile[];
  subscription?: Subscription | null;
  expensesUsed?: number;
}

export function ManualExpenseDialog({
  isOpen,
  onClose,
  onSuccess,
  profileId,
  periodId,
  profiles,
  subscription,
  expensesUsed = 0,
}: ManualExpenseDialogProps) {
  const vm = useManualExpenseDialogForm({
    isOpen,
    profileId,
    periodId,
    profiles,
    subscription,
    expensesUsed,
    onSuccess,
    onClose,
  });

  return (
    <Dialog open={isOpen} onOpenChange={vm.handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <form onSubmit={vm.handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar Gasto Manual</DialogTitle>
            <DialogDescription>Registra un gasto que no proviene de un CFDI XML.</DialogDescription>
          </DialogHeader>

          <ManualExpenseDialogAlerts
            expensesLimit={vm.expensesLimit}
            canUpload={vm.canUpload}
            recommendedPlan={vm.recommendedPlan}
            isFrozen={vm.isFrozen}
          />

          <ManualExpenseFormFields
            profiles={vm.profiles}
            availableProfiles={vm.availableProfiles}
            isSubmitting={vm.form.isSubmitting}
            maxFechaIso={vm.maxFechaIso}
            selectedProfileId={vm.form.selectedProfileId}
            fecha={vm.form.fecha}
            total={vm.form.total}
            subtotal={vm.form.subtotal}
            ivaAmount={vm.form.ivaAmount}
            ivaRateOption={vm.form.ivaRateOption}
            concepto={vm.form.concepto}
            categoria={vm.form.categoria}
            error={vm.form.error}
            onProfileChange={(value) => vm.dispatchForm({ type: 'set_selected_profile_id', value })}
            onFechaChange={(value) => vm.dispatchForm({ type: 'set_fecha', value })}
            onTotalChange={vm.handleTotalChange}
            onSubtotalChange={vm.handleSubtotalChange}
            onIvaRateOptionChange={vm.handleIvaRateOptionChange}
            onIvaAmountChange={vm.handleIvaAmountChange}
            onConceptoChange={(value) => vm.dispatchForm({ type: 'set_concepto', value })}
            onCategoriaChange={(value) => vm.dispatchForm({ type: 'set_categoria', value })}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => vm.handleOpenChange(false)}
              disabled={vm.form.isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={vm.form.isSubmitting || !vm.canUpload}>
              {vm.form.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {vm.form.isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
