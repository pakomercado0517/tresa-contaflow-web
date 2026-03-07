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
  /** Clases para top cuando es sticky (ej: "top-16 lg:top-0" para móvil con nav superior) */
  stickyTop?: string;
  /** Si true, usa position:fixed para que el header permanezca visible al hacer scroll */
  fixed?: boolean;
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
  stickyTop = 'top-0',
  fixed = false,
}: PageHeaderProps) {
  const positionClasses = fixed
    ? 'fixed top-16 left-0 right-0 z-40 lg:top-0 lg:left-64 lg:w-[calc(100vw-16rem)]'
    : `sticky ${stickyTop}`;

  return (
    <header
      className={`bg-background/95 supports-backdrop-filter:bg-background/60 min-w-0 w-full max-w-full backdrop-blur z-40 ${positionClasses}`}
    >
      {/* Fila 1: Título + Acciones */}
      <div className="border-border flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between md:px-6 md:py-5 lg:px-8">
        <div className="flex min-w-0 flex-1 shrink items-start gap-3 overflow-hidden">
          <Icon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <span className="text-muted-foreground text-sm">{subtitle}</span>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex min-w-0 w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Fila 2: Barra de filtros */}
      {filters && (
        <div className="border-border/50 bg-muted/20 border-b px-4 py-2.5 md:px-6 lg:px-8">
          <div
            data-tour={filtersTourId}
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-2"
          >
            {filters}
          </div>
        </div>
      )}
    </header>
  );
}
