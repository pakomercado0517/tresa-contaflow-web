'use client';

import Link from 'next/link';
import { Plus, HandCoins, FileText, FileSpreadsheet, Upload, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { ProfileSelector } from './ProfileSelector';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getExportUpgradeMessage } from '@/lib/utils/subscription';
import type { Profile } from '@/lib/types/profiles';

interface RegimenOption {
  value: string;
  label: string;
}

interface InvoicesHeaderProps {
  profiles: Profile[];
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
  selectedMes: number;
  onMesChange: (mes: number) => void;
  selectedAño: number;
  onAñoChange: (año: number) => void;
  selectedRegimenFiscal: string;
  onRegimenFiscalChange: (regimen: string) => void;
  regimenOptions: RegimenOption[];
  isRegimenDisabled: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  /** Si se proporciona, el botón PDF es un Link al preview; si no, usa onExportPDF */
  exportPdfHref?: string;
  onExportPDF: () => void;
  canExportPDF: boolean;
  onExportExcel: () => void;
  canExportExcel: boolean;
  onAddManualIncome: () => void;
  canAddManualIncome: boolean;
  manualIncomeDisabledReason: 'no_profile' | 'no_period' | null;
}

export function InvoicesHeader({
  profiles,
  selectedProfileId,
  onProfileChange,
  selectedMes,
  onMesChange,
  selectedAño,
  onAñoChange,
  selectedRegimenFiscal,
  onRegimenFiscalChange,
  regimenOptions,
  isRegimenDisabled,
  search,
  onSearchChange,
  onClearFilters,
  exportPdfHref,
  onExportPDF,
  canExportPDF,
  onExportExcel,
  canExportExcel,
  onAddManualIncome,
  canAddManualIncome,
  manualIncomeDisabledReason,
}: InvoicesHeaderProps) {
  return (
    <PageHeader
      icon={FileText}
      title="Gestión de Egresos"
      subtitle="(Facturas y egresos devengados)"
      fixed
      actions={
        <>
          <div data-tour="invoices-profile-selector" className="min-w-0 max-w-full">
            <ProfileSelector
              profiles={profiles}
              selectedProfileId={selectedProfileId}
              onProfileChange={onProfileChange}
            />
          </div>

          <div className="bg-border/70 mx-0.5 hidden h-6 w-px sm:block" aria-hidden="true" />

          {canExportPDF ? (
            exportPdfHref ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-1.5"
                asChild
              >
                <Link href={exportPdfHref}>
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </Link>
              </Button>
            ) : (
              <Button
                onClick={onExportPDF}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-1.5"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </Button>
            )
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-muted-foreground gap-1.5 disabled:opacity-50 cursor-not-allowed"
                    >
                      <FileText className="h-4 w-4" />
                      <span>PDF</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {getExportUpgradeMessage('pdf_export')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {canExportExcel ? (
            <Button
              onClick={onExportExcel}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Excel</span>
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-muted-foreground gap-1.5 disabled:opacity-50 cursor-not-allowed"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Excel</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {getExportUpgradeMessage('excel_export')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="bg-border/70 mx-0.5 hidden h-6 w-px sm:block" aria-hidden="true" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                data-tour="invoices-upload-button"
                className="bg-primary hover:bg-primary/90 gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/invoices/upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Subir Facturas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onAddManualIncome}
                disabled={!canAddManualIncome}
                className="flex items-center gap-2"
                title={
                  canAddManualIncome
                    ? 'Registrar un ingreso sin factura CFDI'
                    : manualIncomeDisabledReason === 'no_profile'
                      ? 'Selecciona un perfil para agregar ingresos manuales'
                      : 'Se requiere un período válido para habilitar ingresos manuales'
                }
              >
                <HandCoins className="h-4 w-4" />
                Ingreso manual
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      filters={
        <FilterBar
          selectedMes={selectedMes}
          onMesChange={onMesChange}
          selectedAño={selectedAño}
          onAñoChange={onAñoChange}
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar RFC, Nombre, UUID..."
          onClearFilters={onClearFilters}
          extraFilters={
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
          }
        />
      }
    />
  );
}
