'use client';

import { ReportGeneratedAtLine } from '@/components/common/ReportGeneratedAtLine';
import { TAX_ESTIMATE_REPORT_FOOTER_NOTE } from '@/lib/constants/tax-estimate-field-labels';

interface ReporteMensualFooterProps {
  pageNumber: number;
  totalPages: number;
  hasTaxEstimates: boolean;
}

export function ReporteMensualFooter({
  pageNumber,
  totalPages,
  hasTaxEstimates,
}: ReporteMensualFooterProps) {
  return (
    <footer
      className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-xs text-gray-600"
      data-html-footer
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p>Generado por: Contafy</p>
          <ReportGeneratedAtLine />
        </div>
        <p className="max-w-md text-center md:text-right">
          Este documento es para fines informativos y de gestión interna. Sujeto a cambios basados en
          conciliaciones bancarias.
          {hasTaxEstimates ? (
            <span className="mt-2 block">{TAX_ESTIMATE_REPORT_FOOTER_NOTE}</span>
          ) : null}
        </p>
        <p className="text-right font-medium">
          Página {pageNumber} de {totalPages}
        </p>
      </div>
      <p className="mt-2 text-center text-gray-500" suppressHydrationWarning>
        © {new Date().getFullYear()} Contafy - Aviso de privacidad y términos de servicio
        aplicables.
      </p>
    </footer>
  );
}
