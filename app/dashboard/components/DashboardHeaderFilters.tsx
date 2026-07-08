'use client';

import { useMemo } from 'react';
import { RegimenFiscalSelector } from '@/components/common/RegimenFiscalSelector';
import { FilterBar } from '@/components/common/FilterBar';

interface DashboardHeaderFiltersProps {
  currentMonth: number;
  currentYear: number;
  selectedRegimenFiscal: string;
  regimenesFiscales: string[];
  onMesChange: (month: number) => void;
  onAñoChange: (year: number) => void;
  onRegimenChange: (value: string) => void;
}

export function DashboardHeaderFilters({
  currentMonth,
  currentYear,
  selectedRegimenFiscal,
  regimenesFiscales,
  onMesChange,
  onAñoChange,
  onRegimenChange,
}: DashboardHeaderFiltersProps) {
  const regimenFilter = useMemo(
    () => (
      <RegimenFiscalSelector
        regimenesFiscales={regimenesFiscales}
        selectedRegimenFiscal={selectedRegimenFiscal}
        onRegimenFiscalChange={onRegimenChange}
        showOnlyWhenMultiple
        triggerClassName="h-8 w-50 text-sm"
      />
    ),
    [regimenesFiscales, selectedRegimenFiscal, onRegimenChange]
  );

  return (
    <FilterBar
      selectedMes={currentMonth}
      onMesChange={onMesChange}
      selectedAño={currentYear}
      onAñoChange={onAñoChange}
      extraFilters={regimenFilter}
    />
  );
}
