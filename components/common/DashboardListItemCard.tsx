import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DashboardListItemCardField {
  label: string;
  value: ReactNode;
}

interface DashboardListItemCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  amount?: ReactNode;
  fields?: ReadonlyArray<DashboardListItemCardField>;
  actions?: ReactNode;
  className?: string;
}

export function DashboardListItemCard({
  title,
  subtitle,
  badge,
  meta,
  amount,
  fields,
  actions,
  className,
}: DashboardListItemCardProps) {
  const hasFields = fields != null && fields.length > 0;
  const hasFooter = meta != null || amount != null;

  return (
    <article
      className={cn(
        'border-border bg-muted/30 space-y-3 rounded-lg border p-3',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div className="text-sm font-medium">{title}</div>
          {subtitle != null && (
            <div className="text-muted-foreground text-xs">{subtitle}</div>
          )}
        </div>
        {badge != null && <div className="shrink-0">{badge}</div>}
      </div>

      {hasFields && (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
          {fields.map((field) => (
            <div key={field.label} className="min-w-0 space-y-0.5">
              <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                {field.label}
              </dt>
              <dd className="text-sm tabular-nums">{field.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {hasFooter && (
        <div className="flex items-center justify-between gap-3">
          {meta != null ? (
            <div className="text-muted-foreground min-w-0 text-xs">{meta}</div>
          ) : (
            <span />
          )}
          {amount != null && (
            <div className="shrink-0 text-sm font-semibold tabular-nums">{amount}</div>
          )}
        </div>
      )}

      {actions != null && (
        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-2">
          {actions}
        </div>
      )}
    </article>
  );
}
