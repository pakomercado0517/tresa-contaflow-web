"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileSelector } from "@/components/common/ProfileSelector";
import { Calendar, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/lib/types/profiles";

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
  const previousYear = currentYear - 1;

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  function handleMonthChange(month: number, year: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", month.toString());
    params.set("año", year.toString());
    if (selectedProfileId) {
      params.set("profileId", selectedProfileId);
    } else {
      params.delete("profileId");
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  const monthOptions = [
    { month: 10, year: previousYear, label: `Oct ${previousYear}` },
    { month: 11, year: previousYear, label: `Nov ${previousYear}` },
    { month: 12, year: previousYear, label: `Dic ${previousYear}` },
    ...months.map((month, index) => ({
      month: index + 1,
      year: currentYear,
      label: `${month} ${currentYear}`,
    })),
  ];

  const selectedValue = `${currentYear}-${currentMonth}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Resumen General</h1>
          <Select
            value={selectedValue}
            onValueChange={(value) => {
              const [yearValue, monthValue] = value.split("-");
              handleMonthChange(Number(monthValue), Number(yearValue));
            }}
          >
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem
                  key={`${option.year}-${option.month}`}
                  value={`${option.year}-${option.month}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          {profiles.length > 0 && (
            <ProfileSelector
              profiles={profiles}
              selectedProfileId={selectedProfileId}
            />
          )}
          {companyName && (
            <span className="hidden lg:block text-sm text-muted-foreground">
              {companyName}
            </span>
          )}
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualizar SAT</span>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
            <Link href="/upload">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Factura</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

