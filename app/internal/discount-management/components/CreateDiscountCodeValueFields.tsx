import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CreateDiscountFormState } from './create-discount-form-reducer';
import type { SetCreateDiscountFormField } from './use-create-discount-code-form';

interface CreateDiscountCodeValueFieldsProps {
  discountType: CreateDiscountFormState['discountType'];
  percentOff: string;
  amountOff: string;
  currency: string;
  setField: SetCreateDiscountFormField;
}

export function CreateDiscountCodeValueFields({
  discountType,
  percentOff,
  amountOff,
  currency,
  setField,
}: CreateDiscountCodeValueFieldsProps) {
  return (
    <>
      <div className="space-y-3">
        <Label>Tipo de descuento *</Label>
        <RadioGroup
          value={discountType}
          onValueChange={(value) => setField('discountType', value as CreateDiscountFormState['discountType'])}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="percent" id="percent" />
            <Label htmlFor="percent" className="cursor-pointer font-normal">
              Porcentaje (%)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="amount" id="amount" />
            <Label htmlFor="amount" className="cursor-pointer font-normal">
              Monto fijo
            </Label>
          </div>
        </RadioGroup>
      </div>

      {discountType === 'percent' ? (
        <div className="space-y-2">
          <Label htmlFor="percentOff">Porcentaje de descuento *</Label>
          <Input
            id="percentOff"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            value={percentOff}
            onChange={(e) => setField('percentOff', e.target.value)}
            placeholder="20"
            required
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amountOff">Monto de descuento *</Label>
            <Input
              id="amountOff"
              type="number"
              min="0.01"
              step="0.01"
              value={amountOff}
              onChange={(e) => setField('amountOff', e.target.value)}
              placeholder="50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Moneda *</Label>
            <Select value={currency} onValueChange={(value) => setField('currency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">MXN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </>
  );
}
