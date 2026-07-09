'use client';

import { Button } from '@/components/ui/button';

interface DashboardListPaginationProps {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  /** Texto después del total, p. ej. "resultados" o "facturas" */
  itemLabel: string;
  navStyle?: 'text' | 'arrows';
}

export function DashboardListPagination({
  pagination,
  onPageChange,
  itemLabel,
  navStyle = 'text',
}: DashboardListPaginationProps) {
  if (pagination.totalPages <= 1) return null;

  const rangeStart = (pagination.page - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        Mostrando {rangeStart}-{rangeEnd} de {pagination.total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          {navStyle === 'arrows' ? '←' : 'Anterior'}
        </Button>
        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
          let pageNum: number;
          if (pagination.totalPages <= 5) {
            pageNum = i + 1;
          } else if (pagination.page <= 3) {
            pageNum = i + 1;
          } else if (pagination.page >= pagination.totalPages - 2) {
            pageNum = pagination.totalPages - 4 + i;
          } else {
            pageNum = pagination.page - 2 + i;
          }
          return (
            <Button
              key={pageNum}
              variant={pagination.page === pageNum ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}
        {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
          <span className="text-muted-foreground px-2">...</span>
        )}
        {pagination.totalPages > 5 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.totalPages)}
          >
            {pagination.totalPages}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          {navStyle === 'arrows' ? '→' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
}
