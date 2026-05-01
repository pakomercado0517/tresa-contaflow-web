import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';

interface MetricStatProps {
  label: string;
  value: number;
  description?: string;
  /** Nota breve bajo la descripción (p. ej. aclaración de subtotal vs impuestos). */
  subNote?: string;
  valueClassName?: string;
}

/**
 * Bloque reutilizable de estadística: etiqueta + valor monetario + descripción opcional.
 * Usado en PublicMetricsCards (vista pública); el dashboard duplica el layout con `subNote` inline.
 */
export function MetricStat({ label, value, description, subNote, valueClassName }: MetricStatProps) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
        {label}
      </p>
      <p className={cn('text-2xl font-bold tabular-nums md:text-3xl', valueClassName)}>
        {formatCurrency(value)}
      </p>
      {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      {subNote && (
        <p className="text-muted-foreground mt-1 text-xs leading-snug">{subNote}</p>
      )}
    </div>
  );
}
