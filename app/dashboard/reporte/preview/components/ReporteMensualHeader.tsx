'use client';

import { type ReactNode } from 'react';
import { Building2 } from 'lucide-react';

interface ReporteMensualHeaderProps {
  headerAction?: ReactNode;
}

export function ReporteMensualHeader({ headerAction }: ReporteMensualHeaderProps) {
  return (
    <header
      className="flex items-center justify-between border-b border-gray-200 px-6 py-4"
      data-html-header
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold text-gray-900">Portal de Reportes Contafy</span>
      </div>
      {headerAction}
    </header>
  );
}
