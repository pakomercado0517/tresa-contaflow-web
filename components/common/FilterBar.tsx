'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReactNode } from 'react';

interface FilterBarProps {
  /** Valor del mes seleccionado */
  selectedMes: number;
  onMesChange: (mes: number) => void;
  /** Valor del año seleccionado */
  selectedAño: number;
  onAñoChange: (año: number) => void;
  /** Búsqueda de texto (opcional) */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Callback para limpiar filtros */
  onClearFilters?: () => void;
  /** Filtros adicionales insertados después de la búsqueda */
  extraFilters?: ReactNode;
}

const MONTHS = [
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

/** Separador vertical reutilizable dentro del filter bar */
export function FilterSeparator() {
  return <div className="bg-border/70 mx-0.5 hidden h-4 w-px sm:block" aria-hidden="true" />;
}

/**
 * Barra de filtros reutilizable con label "Filtros", mes, año,
 * búsqueda opcional y slot para filtros extra.
 *
 * Diseñada para usarse como children de `<PageHeader filters={...} />`
 */
export function FilterBar({
  selectedMes,
  onMesChange,
  selectedAño,
  onAñoChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  onClearFilters,
  extraFilters,
}: FilterBarProps) {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <>
      {/* Label */}
      <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Filtros</span>
      </div>
      <FilterSeparator />

      {/* Búsqueda - ancho completo en móvil */}
      {onSearchChange !== undefined && (
        <>
          <div className="relative w-full min-w-0 sm:w-48 md:w-56">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder={searchPlaceholder}
              value={search ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-full pr-8 pl-8 text-sm"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <FilterSeparator />
        </>
      )}

      {/* Mes - ancho completo en móvil */}
      <Select value={selectedMes.toString()} onValueChange={(v) => onMesChange(Number(v))}>
        <SelectTrigger className="h-8 w-full min-w-0 text-sm sm:w-32.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month, index) => (
            <SelectItem key={index} value={(index + 1).toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Año */}
      <Select value={selectedAño.toString()} onValueChange={(v) => onAñoChange(Number(v))}>
        <SelectTrigger className="h-8 w-full min-w-0 text-sm sm:w-22.5">
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

      {/* Filtros adicionales (régimen, categoría, etc.) */}
      {extraFilters}

      {/* Limpiar filtros */}
      {onClearFilters && (
        <Button
          onClick={onClearFilters}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 shrink-0 gap-1.5 text-xs"
        >
          <X className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Limpiar</span>
        </Button>
      )}
    </>
  );
}
