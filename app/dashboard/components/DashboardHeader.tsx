'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProfileSelector } from '@/components/common/ProfileSelector';
import { RegimenFiscalSelector } from '@/components/common/RegimenFiscalSelector';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { Plus, Building2, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/lib/types/profiles';

interface DashboardHeaderProps {
  profiles?: Profile[];
  selectedProfileId?: string;
  selectedMonth?: number;
  selectedYear?: number;
  selectedRegimenFiscal?: string;
  activeProfile?: Profile | null;
  companyName?: string;
}

export function DashboardHeader({
  profiles = [],
  selectedProfileId,
  selectedMonth,
  selectedYear,
  selectedRegimenFiscal = 'all',
  activeProfile,
  companyName,
}: DashboardHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDate = new Date();
  const currentMonth = selectedMonth || currentDate.getMonth() + 1;
  const currentYear = selectedYear || currentDate.getFullYear();

  function updateFilters(month?: number, year?: number, regimenFiscal?: string) {
    const params = new URLSearchParams(searchParams.toString());

    const newMonth = month !== undefined ? month : currentMonth;
    const newYear = year !== undefined ? year : currentYear;

    params.set('mes', newMonth.toString());
    params.set('año', newYear.toString());

    if (regimenFiscal !== undefined) {
      if (regimenFiscal && regimenFiscal !== 'all') {
        params.set('regimen_fiscal', regimenFiscal);
      } else {
        params.delete('regimen_fiscal');
      }
    }

    if (selectedProfileId) {
      params.set('profileId', selectedProfileId);
    } else {
      params.delete('profileId');
    }

    router.push(`/dashboard?${params.toString()}`, { scroll: false });
    router.refresh();
  }

  function handleMonthChange(month: number) {
    updateFilters(month, currentYear);
  }

  function handleYearChange(year: number) {
    updateFilters(currentMonth, year);
  }

  function handleRegimenChange(value: string) {
    updateFilters(undefined, undefined, value);
  }

  const regimenesFiscales = activeProfile?.regimenes_fiscales ?? [];

  return (
    <PageHeader
      icon={LayoutDashboard}
      title="Resumen General"
      subtitle={
        companyName ? (
          <span className="border-border/60 bg-muted/50 text-muted-foreground hidden items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs md:inline-flex">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="max-w-45 truncate">{companyName}</span>
          </span>
        ) : undefined
      }
      actions={
        <>
          {profiles.length > 0 && (
            <div data-tour="profile-selector">
              <ProfileSelector
                profiles={profiles}
                selectedProfileId={selectedProfileId}
                clearParamsOnChange={['regimen_fiscal']}
              />
            </div>
          )}
          <Button
            asChild
            size="sm"
            data-tour="new-invoice-button"
            className="bg-primary hover:bg-primary/90 gap-1.5 shadow-sm"
          >
            <Link href="/dashboard/invoices/upload">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Factura</span>
            </Link>
          </Button>
        </>
      }
      filtersTourId="date-filters"
      filters={
        <FilterBar
          selectedMes={currentMonth}
          onMesChange={handleMonthChange}
          selectedAño={currentYear}
          onAñoChange={handleYearChange}
          extraFilters={
            <RegimenFiscalSelector
              regimenesFiscales={regimenesFiscales}
              selectedRegimenFiscal={selectedRegimenFiscal}
              onRegimenFiscalChange={handleRegimenChange}
              showOnlyWhenMultiple
              triggerClassName="h-8 w-50 text-sm"
            />
          }
        />
      }
    />
  );
}
