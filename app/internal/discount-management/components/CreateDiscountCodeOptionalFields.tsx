import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { SetCreateDiscountFormField } from './use-create-discount-code-form';

interface CreateDiscountCodeOptionalFieldsProps {
  maxRedemptions: string;
  expiresAt: string;
  active: boolean;
  trialDays: string;
  setField: SetCreateDiscountFormField;
}

export function CreateDiscountCodeOptionalFields({
  maxRedemptions,
  expiresAt,
  active,
  trialDays,
  setField,
}: CreateDiscountCodeOptionalFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="maxRedemptions">Máximo de redenciones (opcional)</Label>
        <Input
          id="maxRedemptions"
          type="number"
          min="1"
          value={maxRedemptions}
          onChange={(e) => setField('maxRedemptions', e.target.value)}
          placeholder="100"
        />
        <p className="text-xs text-muted-foreground">Dejar vacío para ilimitado</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Fecha de expiración (opcional)</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setField('expiresAt', e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="active">Código activo</Label>
        <Switch id="active" checked={active} onCheckedChange={(value) => setField('active', value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trialDays">Días de periodo de prueba (opcional)</Label>
        <Input
          id="trialDays"
          type="number"
          min="0"
          value={trialDays}
          onChange={(e) => setField('trialDays', e.target.value)}
          placeholder="0 = sin trial, vacío = default del plan (30 días)"
        />
        <p className="text-xs text-muted-foreground">
          Solo aplica si el usuario es elegible para trial. 0 = sin trial, vacío = usar default del plan (30 días para
          Basic y Pro).
        </p>
      </div>
    </>
  );
}
