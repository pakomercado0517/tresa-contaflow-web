import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  /** Ícono de la página (ej: FileText, Receipt) */
  icon: LucideIcon;
  /** Título principal */
  title: string;
  /** Texto secundario junto al título (visible desde md:) */
  subtitle?: ReactNode;
  /** Acciones del lado derecho de la fila superior (botones, selectors, dropdowns) */
  actions?: ReactNode;
  /** Contenido de la barra de filtros (fila inferior) */
  filters?: ReactNode;
  /** data-tour attribute para la barra de filtros */
  filtersTourId?: string;
}

/**
 * Header reutilizable de dos filas para páginas del dashboard.
 *
 * - Fila 1: Ícono + Título + Subtitle | Acciones
 * - Fila 2: Barra de filtros con flex-wrap (escalable)
 */
export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  filters,
  filtersTourId,
}: PageHeaderProps) {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full backdrop-blur">
      {/* Fila 1: Título + Acciones */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3.5 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <Icon className="text-primary h-5 w-5" />
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          {subtitle && (
            <span className="text-muted-foreground hidden text-sm md:inline">{subtitle}</span>
          )}
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {/* Fila 2: Barra de filtros */}
      {filters && (
        <div className="border-border/50 bg-muted/20 border-b px-4 py-2.5 md:px-6 lg:px-8">
          <div data-tour={filtersTourId} className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {filters}
          </div>
        </div>
      )}
    </header>
  );
}
