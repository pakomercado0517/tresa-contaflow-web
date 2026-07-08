'use client';

import { Badge } from '@/components/ui/badge';

interface RegimenFiscalCellProps {
  regimenesFiscales: string[];
  descripcionMap: Record<string, string>;
}

export function RegimenFiscalCell({ regimenesFiscales, descripcionMap }: RegimenFiscalCellProps) {
  const MAX_VISIBLE = 3;
  const visible = regimenesFiscales.slice(0, MAX_VISIBLE);
  const remaining = regimenesFiscales.length - MAX_VISIBLE;

  const getTooltip = (clave: string) => {
    const desc = descripcionMap[clave];
    return desc ? `${clave} - ${desc}` : clave;
  };

  if (!regimenesFiscales.length) {
    return <span className="text-muted-foreground text-sm">Sin definir</span>;
  }

  return (
    <div className="flex max-w-[200px] min-w-0 flex-wrap items-center gap-1.5">
      {visible.map((clave) => (
        <Badge
          key={clave}
          variant="outline"
          className="border-primary/30 text-foreground shrink-0 cursor-help font-mono text-xs"
          title={getTooltip(clave)}
        >
          {clave}
        </Badge>
      ))}
      {remaining > 0 && (
        <span
          className="text-muted-foreground shrink-0 text-xs"
          title={regimenesFiscales
            .slice(MAX_VISIBLE)
            .map((c) => getTooltip(c))
            .join('\n')}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
