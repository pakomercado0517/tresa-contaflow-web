'use client';

import { useCreateDiscountCodeForm } from './use-create-discount-code-form';
import { CreateDiscountCodeBasicFields } from './CreateDiscountCodeBasicFields';
import { CreateDiscountCodeValueFields } from './CreateDiscountCodeValueFields';
import { CreateDiscountCodeOptionalFields } from './CreateDiscountCodeOptionalFields';
import { CreateDiscountCodeMetadataFields } from './CreateDiscountCodeMetadataFields';
import { CreateDiscountCodeFormActions } from './CreateDiscountCodeFormActions';

interface CreateDiscountCodeFormProps {
  onSuccess: () => void;
}

export function CreateDiscountCodeForm({ onSuccess }: CreateDiscountCodeFormProps) {
  const { form, setField, handleSubmit } = useCreateDiscountCodeForm({ onSuccess });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CreateDiscountCodeBasicFields
        code={form.code}
        duration={form.duration}
        durationInMonths={form.durationInMonths}
        setField={setField}
      />

      <CreateDiscountCodeValueFields
        discountType={form.discountType}
        percentOff={form.percentOff}
        amountOff={form.amountOff}
        currency={form.currency}
        setField={setField}
      />

      <CreateDiscountCodeOptionalFields
        maxRedemptions={form.maxRedemptions}
        expiresAt={form.expiresAt}
        active={form.active}
        trialDays={form.trialDays}
        setField={setField}
      />

      <CreateDiscountCodeMetadataFields
        metadataKey={form.metadataKey}
        metadataValue={form.metadataValue}
        setField={setField}
      />

      <CreateDiscountCodeFormActions
        isSubmitting={form.isSubmitting}
        error={form.error}
        success={form.success}
      />
    </form>
  );
}
