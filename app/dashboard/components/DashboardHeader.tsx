'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfileSelector } from '@/components/common/ProfileSelector';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/lib/types/profiles';

interface DashboardHeaderProps {
  profiles?: Profile[];
  selectedProfileId?: string;
  selectedMonth?: number;
  selectedYear?: number;
  companyName?: string;
}

export function DashboardHeader({
  profiles = [],
  selectedProfileId,
  selectedMonth,
  selectedYear,
  companyName,
}: DashboardHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDate = new Date();
  const currentMonth = selectedMonth || currentDate.getMonth() + 1;
  const currentYear = selectedYear || currentDate.getFullYear();

  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Generar años (5 años: 2 anteriores, actual, 2 futuros)
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  function updateFilters(month?: number, year?: number) {
    const params = new URLSearchParams(searchParams.toString());

    // Usar el valor proporcionado o el valor actual
    const newMonth = month !== undefined ? month : currentMonth;
    const newYear = year !== undefined ? year : currentYear;

    params.set('mes', newMonth.toString());
    params.set('año', newYear.toString());

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

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Resumen General</h1>
          <div data-tour="date-filters" className="flex items-center gap-2">
            <Select
              value={currentMonth.toString()}
              onValueChange={(value) => handleMonthChange(Number(value))}
            >
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={currentYear.toString()}
              onValueChange={(value) => handleYearChange(Number(value))}
            >
              <SelectTrigger className="w-25">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profiles.length > 0 && (
            <div data-tour="profile-selector">
              <ProfileSelector profiles={profiles} selectedProfileId={selectedProfileId} />
            </div>
          )}
          {companyName && (
            <span className="text-muted-foreground hidden text-sm lg:block">{companyName}</span>
          )}
          <Button
            asChild
            data-tour="new-invoice-button"
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Link href="/dashboard/invoices/upload">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Factura</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
