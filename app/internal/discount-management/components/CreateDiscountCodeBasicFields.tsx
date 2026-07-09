import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CreateDiscountFormState } from './create-discount-form-reducer';
import type { SetCreateDiscountFormField } from './use-create-discount-code-form';

interface CreateDiscountCodeBasicFieldsProps {
  code: string;
  duration: CreateDiscountFormState['duration'];
  durationInMonths: string;
  setField: SetCreateDiscountFormField;
}

export function CreateDiscountCodeBasicFields({
  code,
  duration,
  durationInMonths,
  setField,
}: CreateDiscountCodeBasicFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="code">Código *</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setField('code', e.target.value)}
          placeholder="PROMO20"
          maxLength={50}
          required
        />
        <p className="text-xs text-muted-foreground">
          Se convertirá automáticamente a mayúsculas (3-50 caracteres)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Duración *</Label>
        <Select
          value={duration}
          onValueChange={(value) => setField('duration', value as CreateDiscountFormState['duration'])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">Una vez</SelectItem>
            <SelectItem value="repeating">Repetitivo</SelectItem>
            <SelectItem value="forever">Permanente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {duration === 'repeating' && (
        <div className="space-y-2">
          <Label htmlFor="durationInMonths">Duración en meses *</Label>
          <Input
            id="durationInMonths"
            type="number"
            min="1"
            value={durationInMonths}
            onChange={(e) => setField('durationInMonths', e.target.value)}
            placeholder="3"
            required
          />
        </div>
      )}
    </>
  );
}
