'use client';

import type { Plan, Subscription } from '@/lib/types/subscription';
import { useCreateProfileForm } from './use-create-profile-form';
import { CreateProfileFormIntro } from './CreateProfileFormIntro';
import { CreateProfileTipoPersonaSelector } from './CreateProfileTipoPersonaSelector';
import { CreateProfileIdentityFields } from './CreateProfileIdentityFields';
import { CreateProfileRegimenesField } from './CreateProfileRegimenesField';
import { CreateProfileFormActions } from './CreateProfileFormActions';

interface CreateProfileFormProps {
  currentProfileCount: number;
  plan: Plan;
  subscription?: Subscription | null;
}

export function CreateProfileForm(props: CreateProfileFormProps) {
  const form = useCreateProfileForm(props);

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      <CreateProfileFormIntro
        currentProfileCount={form.currentProfileCount}
        plan={form.plan}
        subscription={form.subscription}
        canCreate={form.canCreate}
        remainingProfiles={form.remainingProfiles}
        limit={form.limit}
        recommendedPlan={form.recommendedPlan}
      />

      <CreateProfileTipoPersonaSelector
        tipoPersona={form.tipoPersona}
        onChange={form.handleTipoPersonaChange}
      />

      <CreateProfileIdentityFields
        nombre={form.nombre}
        onNombreChange={form.setNombre}
        rfc={form.rfc}
        onRfcChange={form.setRfc}
      />

      <CreateProfileRegimenesField
        regimenesFiscales={form.regimenesFiscales}
        regimenToAdd={form.regimenToAdd}
        onRegimenToAddChange={form.setRegimenToAdd}
        onAddRegimen={form.handleAddRegimen}
        onRemoveRegimen={form.handleRemoveRegimen}
        regimenesOptions={form.regimenesOptions}
        availableToAdd={form.availableToAdd}
        isLoadingRegimenes={form.isLoadingRegimenes}
      />

      {form.error && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          {form.error}
        </div>
      )}

      <CreateProfileFormActions
        isLoading={form.isLoading}
        isSubmitDisabled={form.isSubmitDisabled}
        onCancel={form.handleCancel}
      />
    </form>
  );
}
