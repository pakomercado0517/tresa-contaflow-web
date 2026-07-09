import type { CreateDiscountCodeRequest } from '@/lib/types/discounts';
import type { CreateDiscountFormState } from './create-discount-form-reducer';

export function validateCreateDiscountForm(state: CreateDiscountFormState): void {
  const { code, discountType, percentOff, amountOff, currency, duration, durationInMonths, maxRedemptions, trialDays } =
    state;

  if (!code.trim()) {
    throw new Error('El código es requerido');
  }

  if (code.trim().length < 3 || code.trim().length > 50) {
    throw new Error('El código debe tener entre 3 y 50 caracteres');
  }

  if (discountType === 'percent') {
    const percent = parseFloat(percentOff);
    if (isNaN(percent) || percent <= 0 || percent > 100) {
      throw new Error('El porcentaje debe ser mayor a 0 y menor o igual a 100');
    }
  } else {
    const amount = parseFloat(amountOff);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('La moneda es requerida y debe tener 3 caracteres (ej: MXN, USD)');
    }
  }

  if (duration === 'repeating') {
    const months = parseInt(durationInMonths, 10);
    if (isNaN(months) || months < 1) {
      throw new Error('La duración en meses debe ser un número entero mayor o igual a 1');
    }
  }

  if (maxRedemptions) {
    const max = parseInt(maxRedemptions, 10);
    if (isNaN(max) || max < 1) {
      throw new Error('El máximo de redenciones debe ser un número entero mayor o igual a 1');
    }
  }

  if (trialDays.trim() !== '') {
    const trimmed = trialDays.trim();
    const days = parseInt(trimmed, 10);
    if (isNaN(days) || days < 0 || String(days) !== trimmed) {
      throw new Error('Los días de prueba deben ser un número entero mayor o igual a 0');
    }
  }
}

export function buildCreateDiscountPayload(state: CreateDiscountFormState): CreateDiscountCodeRequest {
  const {
    code,
    duration,
    active,
    discountType,
    percentOff,
    amountOff,
    currency,
    durationInMonths,
    maxRedemptions,
    expiresAt,
    trialDays,
    metadataKey,
    metadataValue,
  } = state;

  return {
    code: code.trim().toUpperCase(),
    duration,
    active,
    ...(discountType === 'percent'
      ? { percentOff: parseFloat(percentOff) }
      : { amountOff: parseFloat(amountOff), currency }),
    ...(duration === 'repeating' && { durationInMonths: parseInt(durationInMonths, 10) }),
    ...(maxRedemptions && { maxRedemptions: parseInt(maxRedemptions, 10) }),
    ...(expiresAt && { expiresAt: new Date(expiresAt).toISOString() }),
    ...(trialDays.trim() !== '' && { trialDays: parseInt(trialDays.trim(), 10) }),
    ...(metadataKey &&
      metadataValue && {
        metadata: { [metadataKey]: metadataValue },
      }),
  };
}
