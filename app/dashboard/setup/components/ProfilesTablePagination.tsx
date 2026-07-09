'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfilesTablePaginationProps {
  startIndex: number;
  endIndex: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ProfilesTablePagination({
  startIndex,
  endIndex,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
}: ProfilesTablePaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        Mostrando {startIndex + 1} a {Math.min(endIndex, totalCount)} de {totalCount} resultados
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 3) {
            pageNum = i + 1;
          } else if (currentPage === 1) {
            pageNum = i + 1;
          } else if (currentPage === totalPages) {
            pageNum = totalPages - 2 + i;
          } else {
            pageNum = currentPage - 1 + i;
          }

          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
