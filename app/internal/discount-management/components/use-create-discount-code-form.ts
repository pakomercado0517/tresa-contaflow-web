'use client';

import { useReducer, useCallback } from 'react';
import { createDiscountCodeClient } from '@/lib/api/discounts.client';
import {
  createDiscountFormReducer,
  initialCreateDiscountFormState,
  type CreateDiscountFormState,
} from './create-discount-form-reducer';
import { buildCreateDiscountPayload, validateCreateDiscountForm } from './create-discount-form-helpers';

interface UseCreateDiscountCodeFormOptions {
  onSuccess: () => void;
}

export type SetCreateDiscountFormField = <K extends keyof CreateDiscountFormState>(
  field: K,
  value: CreateDiscountFormState[K]
) => void;

function getSubmitErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return 'Error al crear el código de descuento';
}

export function useCreateDiscountCodeForm({ onSuccess }: UseCreateDiscountCodeFormOptions) {
  const [form, dispatch] = useReducer(createDiscountFormReducer, initialCreateDiscountFormState);
  const setField = useCallback<SetCreateDiscountFormField>((field, value) => {
    dispatch({ type: 'set_field', field, value });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: 'submit_start' });

    try {
      validateCreateDiscountForm(form);
      const payload = buildCreateDiscountPayload(form);
      await createDiscountCodeClient(payload);

      dispatch({ type: 'submit_success' });
      onSuccess();

      setTimeout(() => dispatch({ type: 'reset_feedback' }), 3000);
    } catch (err) {
      dispatch({ type: 'submit_error', message: getSubmitErrorMessage(err) });
    } finally {
      dispatch({ type: 'submit_end' });
    }
  };

  return {
    form,
    setField,
    handleSubmit,
  };
}
