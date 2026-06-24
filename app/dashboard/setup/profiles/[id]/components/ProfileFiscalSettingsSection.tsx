'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateFiscalSettingsClient } from '@/lib/api/fiscal-settings.client';
import { ApiError } from '@/lib/api/client';
import { getFiscalSettingsHelpBlocks } from '@/lib/constants/fiscal-settings-copy';
import {
  fiscalSettingsProfilePrefixKey,
  useFiscalSettings,
} from '@/lib/hooks/useFiscalSettings';
import { invalidateTaxEstimatesForProfile } from '@/lib/hooks/useTaxEstimates';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';
import type { Profile } from '@/lib/types/profiles';
import type { UpdateFiscalSettingsRequest } from '@/lib/types/fiscal-settings';

interface ProfileFiscalSettingsSectionProps {
  profile: Profile;
}

interface FiscalFormState {
  coeficienteUtilidad: string;
  coeficienteUtilidadEjercicioAnterior: string;
  isrPagosProvisionalesAcum: string;
  saldoAFavorIsr: string;
  saldoAFavorIva: string;
  perdidasFiscalesPendientes: string;
  ptuPagadaAcum: string;
}

const EMPTY_FORM: FiscalFormState = {
  coeficienteUtilidad: '',
  coeficienteUtilidadEjercicioAnterior: '',
  isrPagosProvisionalesAcum: '0',
  saldoAFavorIsr: '0',
  saldoAFavorIva: '0',
  perdidasFiscalesPendientes: '0',
  ptuPagadaAcum: '0',
};

function formStateFromApi(data: {
  coeficiente_utilidad: number | null;
  coeficiente_utilidad_ejercicio_anterior: number | null;
  isr_pagos_provisionales_acum: number;
  saldo_a_favor_isr: number;
  saldo_a_favor_iva: number;
  perdidas_fiscales_pendientes: number;
  ptu_pagada_acum: number;
}): FiscalFormState {
  return {
    coeficienteUtilidad:
      data.coeficiente_utilidad !== null ? String(data.coeficiente_utilidad) : '',
    coeficienteUtilidadEjercicioAnterior:
      data.coeficiente_utilidad_ejercicio_anterior !== null
        ? String(data.coeficiente_utilidad_ejercicio_anterior)
        : '',
    isrPagosProvisionalesAcum: String(data.isr_pagos_provisionales_acum),
    saldoAFavorIsr: String(data.saldo_a_favor_isr),
    saldoAFavorIva: String(data.saldo_a_favor_iva),
    perdidasFiscalesPendientes: String(data.perdidas_fiscales_pendientes),
    ptuPagadaAcum: String(data.ptu_pagada_acum),
  };
}

function parseOptionalCoefficient(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num)) {
    return Number.NaN;
  }
  return num;
}

function parseNonNegativeAmount(value: string): number {
  const trimmed = value.trim();
  if (trimmed === '') {
    return 0;
  }
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : Number.NaN;
}

function buildEjercicioOptions(currentYear: number): number[] {
  const start = Math.max(2000, currentYear - 5);
  const end = Math.min(2100, currentYear + 1);
  const years: number[] = [];
  for (let year = end; year >= start; year -= 1) {
    years.push(year);
  }
  return years;
}

interface ProfileFiscalSettingsFormProps {
  profile: Profile;
  ejercicio: number;
  ejercicioOptions: number[];
  onEjercicioChange: (year: number) => void;
  initialForm: FiscalFormState;
}

function ProfileFiscalSettingsForm({
  profile,
  ejercicio,
  ejercicioOptions,
  onEjercicioChange,
  initialForm,
}: ProfileFiscalSettingsFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FiscalFormState>(initialForm);

  const saveMutation = useMutation({
    mutationFn: (body: UpdateFiscalSettingsRequest) =>
      updateFiscalSettingsClient(profile.id, body),
    onSuccess: async (response) => {
      toast.success(response.message || 'Configuración fiscal guardada');
      await queryClient.invalidateQueries({
        queryKey: fiscalSettingsProfilePrefixKey(profile.id),
      });
      await invalidateTaxEstimatesForProfile(queryClient, profile.id);
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No se pudo guardar la configuración fiscal.';
      toast.error(message);
    },
  });

  const updateField = (field: keyof FiscalFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const coeficienteUtilidad = parseOptionalCoefficient(form.coeficienteUtilidad);
    const coeficienteAnterior = parseOptionalCoefficient(
      form.coeficienteUtilidadEjercicioAnterior
    );

    if (Number.isNaN(coeficienteUtilidad) || Number.isNaN(coeficienteAnterior)) {
      toast.error('Los coeficientes de utilidad deben ser números válidos o estar vacíos.');
      return;
    }
    if (
      coeficienteUtilidad !== null &&
      (coeficienteUtilidad < 0 || coeficienteUtilidad > 1)
    ) {
      toast.error('El coeficiente de utilidad debe estar entre 0 y 1.');
      return;
    }
    if (
      coeficienteAnterior !== null &&
      (coeficienteAnterior < 0 || coeficienteAnterior > 1)
    ) {
      toast.error('El coeficiente del ejercicio anterior debe estar entre 0 y 1.');
      return;
    }

    const amounts = {
      isr_pagos_provisionales_acum: parseNonNegativeAmount(form.isrPagosProvisionalesAcum),
      saldo_a_favor_isr: parseNonNegativeAmount(form.saldoAFavorIsr),
      saldo_a_favor_iva: parseNonNegativeAmount(form.saldoAFavorIva),
      perdidas_fiscales_pendientes: parseNonNegativeAmount(form.perdidasFiscalesPendientes),
      ptu_pagada_acum: parseNonNegativeAmount(form.ptuPagadaAcum),
    };

    for (const [key, value] of Object.entries(amounts)) {
      if (Number.isNaN(value)) {
        toast.error(`El campo ${key} debe ser un número válido mayor o igual a 0.`);
        return;
      }
      if (value < 0) {
        toast.error('Los montos acumulados no pueden ser negativos.');
        return;
      }
    }

    saveMutation.mutate({
      ejercicio,
      coeficiente_utilidad: coeficienteUtilidad,
      coeficiente_utilidad_ejercicio_anterior: coeficienteAnterior,
      ...amounts,
    });
  };

  const isFormBusy = saveMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fiscal-ejercicio">Ejercicio fiscal</Label>
        <Select
          value={String(ejercicio)}
          onValueChange={(value) => onEjercicioChange(Number(value))}
          disabled={isFormBusy}
        >
          <SelectTrigger id="fiscal-ejercicio" className="w-full sm:max-w-xs">
            <SelectValue placeholder="Selecciona el año" />
          </SelectTrigger>
          <SelectContent>
            {ejercicioOptions.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="coeficiente-utilidad">Coeficiente de utilidad (0–1)</Label>
          <Input
            id="coeficiente-utilidad"
            inputMode="decimal"
            placeholder="Ej. 0.15"
            value={form.coeficienteUtilidad}
            onChange={(e) => updateField('coeficienteUtilidad', e.target.value)}
            disabled={isFormBusy}
          />
          <p className="text-muted-foreground text-xs">Régimen 601 (marzo–diciembre).</p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="coeficiente-anterior">
            Coeficiente de utilidad ejercicio anterior (0–1)
          </Label>
          <Input
            id="coeficiente-anterior"
            inputMode="decimal"
            placeholder="Opcional"
            value={form.coeficienteUtilidadEjercicioAnterior}
            onChange={(e) =>
              updateField('coeficienteUtilidadEjercicioAnterior', e.target.value)
            }
            disabled={isFormBusy}
          />
          <p className="text-muted-foreground text-xs">Régimen 601 (enero–febrero).</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pagos-provisionales">Pagos provisionales ISR acumulados</Label>
          <Input
            id="pagos-provisionales"
            inputMode="decimal"
            value={form.isrPagosProvisionalesAcum}
            onChange={(e) => updateField('isrPagosProvisionalesAcum', e.target.value)}
            disabled={isFormBusy}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="saldo-isr">Saldo a favor ISR</Label>
          <Input
            id="saldo-isr"
            inputMode="decimal"
            value={form.saldoAFavorIsr}
            onChange={(e) => updateField('saldoAFavorIsr', e.target.value)}
            disabled={isFormBusy}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="saldo-iva">Saldo a favor IVA</Label>
          <Input
            id="saldo-iva"
            inputMode="decimal"
            value={form.saldoAFavorIva}
            onChange={(e) => updateField('saldoAFavorIva', e.target.value)}
            disabled={isFormBusy}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="perdidas-fiscales">Pérdidas fiscales pendientes</Label>
          <Input
            id="perdidas-fiscales"
            inputMode="decimal"
            value={form.perdidasFiscalesPendientes}
            onChange={(e) => updateField('perdidasFiscalesPendientes', e.target.value)}
            disabled={isFormBusy}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ptu-acum">PTU pagada acumulada</Label>
          <Input
            id="ptu-acum"
            inputMode="decimal"
            value={form.ptuPagadaAcum}
            onChange={(e) => updateField('ptuPagadaAcum', e.target.value)}
            disabled={isFormBusy}
          />
        </div>
      </div>

      <Button type="submit" disabled={isFormBusy}>
        {saveMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando…
          </>
        ) : (
          'Guardar configuración'
        )}
      </Button>
    </form>
  );
}

export function ProfileFiscalSettingsSection({ profile }: ProfileFiscalSettingsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { año: defaultEjercicio } = getCurrentMonthYearInAppTimezone();
  const [ejercicio, setEjercicio] = useState(defaultEjercicio);

  const ejercicioOptions = useMemo(
    () => buildEjercicioOptions(defaultEjercicio),
    [defaultEjercicio]
  );

  const helpBlocks = useMemo(
    () => getFiscalSettingsHelpBlocks(profile.regimenes_fiscales ?? []),
    [profile.regimenes_fiscales]
  );

  const { data, isLoading, dataUpdatedAt } = useFiscalSettings(profile.id, ejercicio);

  const initialForm = useMemo(() => {
    const settings = data?.data;
    if (settings) {
      return formStateFromApi(settings);
    }
    return EMPTY_FORM;
  }, [data?.data]);

  const formSyncKey = `${ejercicio}-${dataUpdatedAt}`;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.location.hash !== '#configuracion-fiscal') {
      return;
    }
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="configuracion-fiscal"
      className="border-border mt-8 scroll-mt-24 border-t pt-8"
      aria-labelledby="fiscal-settings-heading"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="bg-primary/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Scale className="text-primary h-5 w-5" />
        </div>
        <div>
          <h2 id="fiscal-settings-heading" className="text-2xl font-bold">
            Configuración fiscal del ejercicio
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Estos datos alimentan la estimación informativa de ISR e IVA en el dashboard. Se
            guardan por ejercicio fiscal.
          </p>
        </div>
      </div>

      <ul className="text-muted-foreground mb-6 list-disc space-y-1 pl-5 text-sm">
        {helpBlocks.map((block) => (
          <li key={block}>{block}</li>
        ))}
      </ul>

      <Card className="border-border">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando configuración…
            </div>
          ) : (
            <ProfileFiscalSettingsForm
              key={formSyncKey}
              profile={profile}
              ejercicio={ejercicio}
              ejercicioOptions={ejercicioOptions}
              onEjercicioChange={setEjercicio}
              initialForm={initialForm}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
