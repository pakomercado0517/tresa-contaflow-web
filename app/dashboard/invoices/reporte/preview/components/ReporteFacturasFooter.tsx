'use client';

import { Building2 } from 'lucide-react';

interface ReporteFacturasFooterProps {
  pageNumber: number;
  totalPages: number;
}

export function ReporteFacturasFooter({ pageNumber, totalPages }: ReporteFacturasFooterProps) {
  return (
    <footer
      className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4 text-xs text-gray-600"
      data-html-footer
    >
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-emerald-600">
          <Building2 className="h-3 w-3" />
        </div>
        <p>
          Reporte generado por <span className="font-semibold text-emerald-700">Contafy</span>
        </p>
      </div>
      <p className="font-medium text-gray-700">
        Página {pageNumber} de {totalPages}
      </p>
    </footer>
  );
}
