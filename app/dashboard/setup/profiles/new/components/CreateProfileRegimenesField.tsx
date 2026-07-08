'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegimenCatalogItem {
  clave: string;
  descripcion: string;
}

interface CreateProfileRegimenesFieldProps {
  regimenesFiscales: string[];
  regimenToAdd: string;
  onRegimenToAddChange: (value: string) => void;
  onAddRegimen: () => void;
  onRemoveRegimen: (clave: string) => void;
  regimenesOptions: RegimenCatalogItem[];
  availableToAdd: RegimenCatalogItem[];
  isLoadingRegimenes: boolean;
}

export function CreateProfileRegimenesField({
  regimenesFiscales,
  regimenToAdd,
  onRegimenToAddChange,
  onAddRegimen,
  onRemoveRegimen,
  regimenesOptions,
  availableToAdd,
  isLoadingRegimenes,
}: CreateProfileRegimenesFieldProps) {
  const regimenLabel =
    regimenesFiscales.length !== 1 ? 'Régimenes Fiscales' : 'Régimen Fiscal';

  return (
    <div className="space-y-2">
      <Label>{regimenLabel}</Label>
      <p className="text-muted-foreground text-xs">
        Selecciona los regímenes que aplican a este perfil. Puedes agregar varios.
      </p>
      <div className="flex gap-2">
        <Select
          value={regimenToAdd}
          onValueChange={onRegimenToAddChange}
          disabled={isLoadingRegimenes || availableToAdd.length === 0}
        >
          <SelectTrigger className="flex-1">
            <SelectValue
              placeholder={
                isLoadingRegimenes
                  ? 'Cargando regímenes...'
                  : availableToAdd.length === 0
                    ? 'Todos agregados'
                    : 'Agregar régimen...'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableToAdd.map((item) => (
              <SelectItem key={item.clave} value={item.clave}>
                {item.clave} - {item.descripcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={onAddRegimen} disabled={!regimenToAdd}>
          Añadir
        </Button>
      </div>
      {regimenesFiscales.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {regimenesFiscales.map((clave) => {
            const item = regimenesOptions.find((r) => r.clave === clave);
            const label = item ? `${item.clave} - ${item.descripcion}` : clave;
            return (
              <span
                key={clave}
                className="bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm"
              >
                {label}
                <button
                  type="button"
                  onClick={() => onRemoveRegimen(clave)}
                  className="hover:bg-primary/20 ml-1 rounded p-0.5"
                  aria-label={`Quitar ${clave}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
      {isLoadingRegimenes && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando catálogo de regímenes...
        </div>
      )}
    </div>
  );
}
