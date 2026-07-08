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
  iva: string;
  concepto: string;
  categoria: string;
  error: string;
  onProfileChange: (profileId: string) => void;
  onFechaChange: (value: string) => void;
  onTotalChange: (value: string) => void;
  onSubtotalChange: (value: string) => void;
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
  iva,
  concepto,
  categoria,
  error,
  onProfileChange,
  onFechaChange,
  onTotalChange,
  onSubtotalChange,
  onConceptoChange,
  onCategoriaChange,
}: ManualExpenseFormFieldsProps) {
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
          El subtotal e IVA se calcularán automáticamente
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
        <Label htmlFor="iva">
          IVA <span className="text-muted-foreground">(16%)</span>
        </Label>
        <Input
          id="iva"
          type="number"
          step="0.01"
          min="0"
          placeholder="160.00"
          value={iva}
          disabled
          className="bg-muted/50"
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
