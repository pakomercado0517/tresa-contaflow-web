'use client';

import { useMemo } from 'react';
import { FilterBar } from '@/components/common/FilterBar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegimenOption {
  value: string;
  label: string;
}

interface InvoicesHeaderFiltersProps {
  selectedMes: number;
  onMesChange: (mes: number) => void;
  selectedAño: number;
  onAñoChange: (año: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  selectedRegimenFiscal: string;
  onRegimenFiscalChange: (regimen: string) => void;
  regimenOptions: RegimenOption[];
  isRegimenDisabled: boolean;
}

export function InvoicesHeaderFilters({
  selectedMes,
  onMesChange,
  selectedAño,
  onAñoChange,
  search,
  onSearchChange,
  onClearFilters,
  selectedRegimenFiscal,
  onRegimenFiscalChange,
  regimenOptions,
  isRegimenDisabled,
}: InvoicesHeaderFiltersProps) {
  const regimenFilter = useMemo(
    () => (
      <div className="w-full min-w-0 sm:w-auto">
        <Select
          value={selectedRegimenFiscal}
          onValueChange={onRegimenFiscalChange}
          disabled={isRegimenDisabled}
        >
          <SelectTrigger className="h-8 w-full min-w-0 text-sm sm:w-[180px]">
            <SelectValue placeholder="Régimen: Todos" />
          </SelectTrigger>
          <SelectContent>
            {regimenOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.value === 'all' ? 'Régimen: Todos' : opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ),
    [selectedRegimenFiscal, onRegimenFiscalChange, isRegimenDisabled, regimenOptions]
  );

  return (
    <FilterBar
      selectedMes={selectedMes}
      onMesChange={onMesChange}
      selectedAño={selectedAño}
      onAñoChange={onAñoChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar RFC, Nombre, UUID..."
      onClearFilters={onClearFilters}
      extraFilters={regimenFilter}
    />
  );
}
