import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SetCreateDiscountFormField } from './use-create-discount-code-form';

interface CreateDiscountCodeMetadataFieldsProps {
  metadataKey: string;
  metadataValue: string;
  setField: SetCreateDiscountFormField;
}

export function CreateDiscountCodeMetadataFields({
  metadataKey,
  metadataValue,
  setField,
}: CreateDiscountCodeMetadataFieldsProps) {
  return (
    <div className="space-y-2 border-t pt-4">
      <Label className="text-sm font-medium">Metadatos (opcional)</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Clave (ej: campaign)"
          value={metadataKey}
          onChange={(e) => setField('metadataKey', e.target.value)}
        />
        <Input
          placeholder="Valor (ej: navidad2026)"
          value={metadataValue}
          onChange={(e) => setField('metadataValue', e.target.value)}
        />
      </div>
    </div>
  );
}
