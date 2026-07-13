'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRegimenesFiscalesClient } from '@/lib/api/sat.client';

interface RegimenFiscalSelectorProps {
  regimenesFiscales: string[];
  selectedRegimenFiscal: string;
  onRegimenFiscalChange: (value: string) => void;
  disabled?: boolean;
  /** Solo mostrar si el perfil tiene 2 o más regímenes fiscales */
  showOnlyWhenMultiple?: boolean;
  /** Ancho del trigger, compatible con w-* de Tailwind */
  triggerClassName?: string;
}

export function RegimenFiscalSelector({
  regimenesFiscales,
  selectedRegimenFiscal,
  onRegimenFiscalChange,
  disabled = false,
  showOnlyWhenMultiple = true,
  triggerClassName = 'w-[180px]',
}: RegimenFiscalSelectorProps) {
  const shouldShow = showOnlyWhenMultiple
    ? regimenesFiscales.length >= 2
    : regimenesFiscales.length > 0;

  const { data: regimenesCatalogData, isLoading: isRegimenesCatalogLoading } = useQuery({
    queryKey: ['regimenes-fiscales'],
    queryFn: () => getRegimenesFiscalesClient(),
    enabled: shouldShow && regimenesFiscales.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const regimenOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'Todos los regímenes' }];
    if (regimenesFiscales.length === 0) return options;

    const catalog = regimenesCatalogData?.data ?? [];
    const descripcionMap = Object.fromEntries(
      catalog.map((r) => [r.clave, r.descripcion])
    );

    for (const clave of regimenesFiscales) {
      const desc = descripcionMap[clave];
      options.push({
        value: clave,
        label: desc ? `${clave} — ${desc}` : clave,
      });
    }
    return options;
  }, [regimenesFiscales, regimenesCatalogData?.data]);

  if (!shouldShow) return null;

  return (
    <Select
      value={selectedRegimenFiscal || 'all'}
      onValueChange={onRegimenFiscalChange}
      disabled={disabled || isRegimenesCatalogLoading}
    >
      <SelectTrigger className={triggerClassName} aria-label="Régimen fiscal">
        <SelectValue placeholder="Régimen fiscal" />
      </SelectTrigger>
      <SelectContent>
        {regimenOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
