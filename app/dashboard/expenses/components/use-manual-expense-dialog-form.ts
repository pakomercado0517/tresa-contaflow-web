'use client';

import { useReducer, useMemo, useRef } from 'react';
import { createAccruedExpenseClient } from '@/lib/api/accrued-expenses.client';
import { ApiError } from '@/lib/api/client';
import {
  canUploadExpenses,
  getExpensesLimit,
  getRecommendedUpgradePlan,
} from '@/lib/utils/subscription';
import type { Subscription } from '@/lib/types/subscription';
import type { Profile } from '@/lib/types/profiles';
import {
  createInitialManualExpenseFormState,
  manualExpenseFormReducer,
} from './manual-expense-form-reducer';
import { getTodayIsoDateInAppTimezone } from '@/lib/utils/app-calendar';

interface UseManualExpenseDialogFormOptions {
  isOpen: boolean;
  profileId: string;
  periodId: string;
  profiles: Profile[];
  subscription?: Subscription | null;
  expensesUsed?: number;
  onSuccess?: () => void;
  onClose: () => void;
}

export function useManualExpenseDialogForm({
  isOpen,
  profileId,
  periodId,
  profiles,
  subscription,
  expensesUsed = 0,
  onSuccess,
  onClose,
}: UseManualExpenseDialogFormOptions) {
  const [form, dispatchForm] = useReducer(
    manualExpenseFormReducer,
    profileId,
    createInitialManualExpenseFormState
  );

  const prevIsOpenRef = useRef(isOpen);
  const prevProfileIdRef = useRef(profileId);
  if (isOpen && (!prevIsOpenRef.current || profileId !== prevProfileIdRef.current)) {
    dispatchForm({ type: 'dialog_opened', profileId });
  }
  prevIsOpenRef.current = isOpen;
  prevProfileIdRef.current = profileId;

  const {
    isSubmitting,
    error,
    selectedProfileId,
    fecha,
    total,
    subtotal,
    iva,
    concepto,
    categoria,
  } = form;

  const maxFechaIso = useMemo(() => getTodayIsoDateInAppTimezone(), []);

  const plan = subscription?.plan || 'FREE';
  const expensesLimit = getExpensesLimit(plan, subscription);
  const canUpload = canUploadExpenses(expensesUsed, plan, subscription);
  const recommendedPlan = getRecommendedUpgradePlan(plan);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const isFrozen = selectedProfile?.frozen || false;
  const availableProfiles = profiles.filter((p) => !p.frozen);

  const handleTotalChange = (value: string) => {
    if (value && !isNaN(parseFloat(value))) {
      const totalNum = parseFloat(value);
      const subtotalNum = totalNum / 1.16;
      const ivaNum = totalNum - subtotalNum;
      dispatchForm({
        type: 'set_total',
        value,
        subtotal: subtotalNum.toFixed(2),
        iva: ivaNum.toFixed(2),
      });
    } else {
      dispatchForm({ type: 'set_total', value, subtotal: '', iva: '' });
    }
  };

  const handleSubtotalChange = (value: string) => {
    if (value && !isNaN(parseFloat(value))) {
      const subtotalNum = parseFloat(value);
      const ivaNum = subtotalNum * 0.16;
      const totalNum = subtotalNum + ivaNum;
      dispatchForm({
        type: 'set_subtotal',
        value,
        iva: ivaNum.toFixed(2),
        total: totalNum.toFixed(2),
      });
    } else {
      dispatchForm({ type: 'set_subtotal', value, iva: '', total: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatchForm({ type: 'set_error', message: '' });

    if (!canUpload) {
      dispatchForm({
        type: 'set_error',
        message: `Has alcanzado el límite de ${expensesLimit} gastos por mes de tu plan actual. ${
          recommendedPlan
            ? 'Actualiza tu plan para crear más gastos.'
            : 'Contacta con soporte para aumentar tu límite.'
        }`,
      });
      return;
    }

    if (!fecha) {
      dispatchForm({ type: 'set_error', message: 'La fecha es requerida' });
      return;
    }

    if (!selectedProfileId) {
      dispatchForm({ type: 'set_error', message: 'Debes seleccionar un perfil' });
      return;
    }

    if (isFrozen) {
      dispatchForm({
        type: 'set_error',
        message: 'No se pueden agregar gastos a un perfil congelado. Selecciona otro perfil.',
      });
      return;
    }

    const subtotalNum = parseFloat(subtotal);
    const ivaNum = parseFloat(iva) || 0;

    if (!Number.isFinite(subtotalNum) || subtotalNum < 0) {
      dispatchForm({
        type: 'set_error',
        message: 'El subtotal debe ser un número mayor o igual a 0',
      });
      return;
    }
    if (!Number.isFinite(ivaNum) || ivaNum < 0) {
      dispatchForm({ type: 'set_error', message: 'El IVA debe ser un número mayor o igual a 0' });
      return;
    }

    const concept = concepto.trim();
    if (!concept) {
      dispatchForm({ type: 'set_error', message: 'El concepto es obligatorio' });
      return;
    }

    dispatchForm({ type: 'submit_start' });

    try {
      await createAccruedExpenseClient({
        profile_id: selectedProfileId,
        period_id: periodId,
        concept,
        subtotal: subtotalNum,
        iva_amount: ivaNum,
        fecha,
        type: 'manual',
        categoria: categoria || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        dispatchForm({ type: 'set_error', message: err.message });
      } else {
        dispatchForm({ type: 'set_error', message: 'Error al crear el gasto. Intenta nuevamente.' });
      }
    } finally {
      dispatchForm({ type: 'submit_end' });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      dispatchForm({ type: 'dialog_opened', profileId });
      return;
    }
    if (!isSubmitting) {
      onClose();
    }
  };

  return {
    form: {
      isSubmitting,
      error,
      selectedProfileId,
      fecha,
      total,
      subtotal,
      iva,
      concepto,
      categoria,
    },
    maxFechaIso,
    profiles,
    availableProfiles,
    expensesLimit,
    canUpload,
    recommendedPlan,
    isFrozen,
    dispatchForm,
    handleTotalChange,
    handleSubtotalChange,
    handleSubmit,
    handleOpenChange,
  };
}
