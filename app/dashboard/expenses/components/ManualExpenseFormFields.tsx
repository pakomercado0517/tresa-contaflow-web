'use client';

import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Profile } from '@/lib/types/profiles';
import {
  MANUAL_ENTRY_IVA_RATE_OPTIONS,
  type ManualEntryIvaRateOption,
} from '@/lib/utils/manual-entry-iva';
import { MANUAL_EXPENSE_DIALOG_CATEGORIES } from './manual-expense-dialog-constants';

interface ManualExpenseFormFieldsProps {
  profiles: Profile[];
  availableProfiles: Profile[];
  isSubmitting: boolean;
  maxFechaIso: string;
  selectedProfileId: string;
  fecha: string;
  total: string;
  subtotal: string;
  ivaAmount: string;
  ivaRateOption: ManualEntryIvaRateOption;
  concepto: string;
  categoria: string;
  error: string;
  onProfileChange: (profileId: string) => void;
  onFechaChange: (value: string) => void;
  onTotalChange: (value: string) => void;
  onSubtotalChange: (value: string) => void;
  onIvaRateOptionChange: (value: ManualEntryIvaRateOption) => void;
  onIvaAmountChange: (value: string) => void;
  onConceptoChange: (value: string) => void;
  onCategoriaChange: (value: string) => void;
}

export function ManualExpenseFormFields({
  profiles,
  availableProfiles,
  isSubmitting,
  maxFechaIso,
  selectedProfileId,
  fecha,
  total,
  subtotal,
  ivaAmount,
  ivaRateOption,
  concepto,
  categoria,
  error,
  onProfileChange,
  onFechaChange,
  onTotalChange,
  onSubtotalChange,
  onIvaRateOptionChange,
  onIvaAmountChange,
  onConceptoChange,
  onCategoriaChange,
}: ManualExpenseFormFieldsProps) {
  const isIvaManual = ivaRateOption === 'otro';
  const selectedRateLabel =
    MANUAL_ENTRY_IVA_RATE_OPTIONS.find((option) => option.value === ivaRateOption)?.label ??
    'IVA';

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="profile">
          RFC/Empresa <span className="text-destructive">*</span>
        </Label>
        <Select value={selectedProfileId} onValueChange={onProfileChange} disabled={isSubmitting}>
          <SelectTrigger id="profile">
            <SelectValue placeholder="Selecciona un RFC/Empresa" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => {
              const isFrozenProfile = profile.frozen || false;
              return (
                <SelectItem key={profile.id} value={profile.id} disabled={isFrozenProfile}>
                  <div
                    className={`flex items-center gap-2 ${isFrozenProfile ? 'opacity-60' : ''}`}
                  >
                    <span className="font-mono text-sm">{profile.rfc}</span>
                    {isFrozenProfile && <span>🔒</span>}
                    <span>{profile.nombre}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {availableProfiles.length === 0 && (
          <p className="text-destructive mt-2 text-xs">
            ⚠️ Todos tus perfiles están congelados 🔒. Actualiza tu plan para descongelarlos.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="fecha">
          Fecha <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => onFechaChange(e.target.value)}
            max={maxFechaIso}
            suppressHydrationWarning
            required
            disabled={isSubmitting}
            className="pl-3"
          />
          <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="iva-rate">
          Tasa de IVA <span className="text-destructive">*</span>
        </Label>
        <Select
          value={ivaRateOption}
          onValueChange={(value) => onIvaRateOptionChange(value as ManualEntryIvaRateOption)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="iva-rate">
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

      <div className="grid gap-2">
        <Label htmlFor="total">
          Total (con IVA) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="total"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="1,160.00"
          value={total}
          onChange={(e) => onTotalChange(e.target.value)}
          required
          disabled={isSubmitting}
        />
        <p className="text-muted-foreground text-xs">
          {isIvaManual
            ? 'El subtotal se calcula a partir del total menos el IVA capturado.'
            : 'El subtotal e IVA se calcularán automáticamente según la tasa seleccionada.'}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subtotal">
          Subtotal <span className="text-muted-foreground">(sin IVA)</span>
        </Label>
        <Input
          id="subtotal"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="1,000.00"
          value={subtotal}
          onChange={(e) => onSubtotalChange(e.target.value)}
          disabled={isSubmitting}
          className="bg-muted/50"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="iva-amount">
          IVA (MXN){' '}
          <span className="text-muted-foreground">
            ({isIvaManual ? 'manual' : selectedRateLabel})
          </span>
        </Label>
        <Input
          id="iva-amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="160.00"
          value={ivaAmount}
          onChange={(e) => onIvaAmountChange(e.target.value)}
          disabled={isSubmitting || !isIvaManual}
          className={isIvaManual ? undefined : 'bg-muted/50'}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="concepto">Concepto / Descripción</Label>
        <Input
          id="concepto"
          type="text"
          placeholder="Ej: Compra de materiales de oficina"
          value={concepto}
          onChange={(e) => onConceptoChange(e.target.value)}
          disabled={isSubmitting}
          maxLength={200}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="categoria">Categoría</Label>
        <Select value={categoria} onValueChange={onCategoriaChange} disabled={isSubmitting}>
          <SelectTrigger id="categoria">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {MANUAL_EXPENSE_DIALOG_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="text-destructive bg-destructive/10 rounded-md p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
