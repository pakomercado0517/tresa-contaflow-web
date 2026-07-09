'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Plus, Receipt, FileText, Upload, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/common/PageHeader';
import { ExpensesHeaderFilters } from './ExpensesHeaderFilters';
import { ProfileSelector } from './ProfileSelector';
import { DashboardListHeaderExportButtons } from '@/app/dashboard/components/DashboardListHeaderExportButtons';
import type {
  ListHeaderExportConfig,
  ManualEntryHeaderAction,
  RegimenFilterConfig,
} from '@/app/dashboard/components/dashboard-list-header-types';
import type { Profile } from '@/lib/types/profiles';

interface ExpensesHeaderProps {
  profiles: Profile[];
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
  selectedMes: number;
  onMesChange: (mes: number) => void;
  selectedAño: number;
  onAñoChange: (año: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  regimenFilter: RegimenFilterConfig;
  exportConfig: ListHeaderExportConfig;
  manualEntry: ManualEntryHeaderAction;
}

function getManualExpenseMenuTitle(blockReason: ManualEntryHeaderAction['blockReason']): string {
  if (blockReason === null) {
    return 'Registrar un gasto sin factura CFDI';
  }
  if (blockReason === 'no_profile') {
    return 'Selecciona un perfil para agregar gastos manuales';
  }
  return 'Se requiere un período válido para habilitar gastos manuales';
}

export function ExpensesHeader({
  profiles,
  selectedProfileId,
  onProfileChange,
  selectedMes,
  onMesChange,
  selectedAño,
  onAñoChange,
  search,
  onSearchChange,
  onClearFilters,
  regimenFilter,
  exportConfig,
  manualEntry,
}: ExpensesHeaderProps) {
  const filters = useMemo(
    () => (
      <ExpensesHeaderFilters
        selectedMes={selectedMes}
        onMesChange={onMesChange}
        selectedAño={selectedAño}
        onAñoChange={onAñoChange}
        search={search}
        onSearchChange={onSearchChange}
        onClearFilters={onClearFilters}
        selectedRegimenFiscal={regimenFilter.selected}
        onRegimenFiscalChange={regimenFilter.onChange}
        regimenOptions={regimenFilter.options}
        isRegimenDisabled={regimenFilter.disabled}
      />
    ),
    [
      selectedMes,
      onMesChange,
      selectedAño,
      onAñoChange,
      search,
      onSearchChange,
      onClearFilters,
      regimenFilter,
    ]
  );

  const isManualEntryEnabled = manualEntry.blockReason === null;

  return (
    <PageHeader
      icon={Receipt}
      title="Gestión de Gastos"
      subtitle="(Egresos y gastos devengados)"
      fixed
      actions={
        <>
          <div data-tour="expenses-profile-selector" className="min-w-0 max-w-full">
            <ProfileSelector
              profiles={profiles}
              selectedProfileId={selectedProfileId}
              onProfileChange={onProfileChange}
            />
          </div>

          <div className="bg-border/70 mx-0.5 hidden h-6 w-px sm:block" aria-hidden="true" />

          <DashboardListHeaderExportButtons exportConfig={exportConfig} />

          <div className="bg-border/70 mx-0.5 hidden h-6 w-px sm:block" aria-hidden="true" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                data-tour="expenses-upload-button"
                className="bg-primary hover:bg-primary/90 gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/expenses/upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Cargar Gastos XML
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                data-tour="expenses-manual-button"
                onClick={manualEntry.onAdd}
                disabled={!isManualEntryEnabled}
                className="flex items-center gap-2"
                title={getManualExpenseMenuTitle(manualEntry.blockReason)}
              >
                <FileText className="h-4 w-4" />
                Gasto Manual
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      filters={filters}
    />
  );
}
