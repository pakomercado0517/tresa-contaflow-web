'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProfileSelector } from '@/components/common/ProfileSelector';
import { PageHeader } from '@/components/common/PageHeader';
import { DashboardHeaderFilters } from './DashboardHeaderFilters';
import { Plus, Building2, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/lib/types/profiles';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';
import { setStoredDashboardFilters } from '@/lib/storage/dashboard-filters';

const EMPTY_REGIMENES_FISCALES: string[] = [];
const EMPTY_PROFILES: Profile[] = [];

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
  profiles = EMPTY_PROFILES,
  selectedProfileId,
  selectedMonth,
  selectedYear,
  selectedRegimenFiscal = 'all',
  activeProfile,
  companyName,
}: DashboardHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mes: appMes, año: appAño } = getCurrentMonthYearInAppTimezone();
  const currentMonth = selectedMonth ?? appMes;
  const currentYear = selectedYear ?? appAño;

  const updateFilters = useCallback(
    (month?: number, year?: number, regimenFiscal?: string) => {
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

      setStoredDashboardFilters({
        mes: newMonth,
        año: newYear,
        profileId: selectedProfileId ?? 'all',
      });

      router.push(`/dashboard?${params.toString()}`, { scroll: false });
      router.refresh();
    },
    [searchParams, currentMonth, currentYear, selectedProfileId, router]
  );

  const regimenesFiscales = useMemo(
    () => activeProfile?.regimenes_fiscales ?? EMPTY_REGIMENES_FISCALES,
    [activeProfile?.regimenes_fiscales]
  );

  const handleMonthChange = useCallback(
    (month: number) => {
      updateFilters(month, currentYear);
    },
    [updateFilters, currentYear]
  );

  const handleYearChange = useCallback(
    (year: number) => {
      updateFilters(currentMonth, year);
    },
    [updateFilters, currentMonth]
  );

  const handleRegimenChange = useCallback(
    (value: string) => {
      updateFilters(undefined, undefined, value);
    },
    [updateFilters]
  );

  const filters = useMemo(
    () => (
      <DashboardHeaderFilters
        currentMonth={currentMonth}
        currentYear={currentYear}
        selectedRegimenFiscal={selectedRegimenFiscal}
        regimenesFiscales={regimenesFiscales}
        onMesChange={handleMonthChange}
        onAñoChange={handleYearChange}
        onRegimenChange={handleRegimenChange}
      />
    ),
    [
      currentMonth,
      currentYear,
      selectedRegimenFiscal,
      regimenesFiscales,
      handleMonthChange,
      handleYearChange,
      handleRegimenChange,
    ]
  );

  return (
    <PageHeader
      icon={LayoutDashboard}
      title="Resumen General"
      fixed
      subtitle={
        companyName ? (
          <span className="border-border/60 bg-muted/50 text-muted-foreground hidden items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs md:inline-flex">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="max-w-32 truncate md:max-w-40">{companyName}</span>
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
                triggerClassName="min-w-[10rem] w-56"
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
      filters={filters}
    />
  );
}
