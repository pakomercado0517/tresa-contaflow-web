'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { ReporteFacturasData } from './reporte-facturas-types';
import { ReporteFacturasHeader } from './ReporteFacturasHeader';
import { ReporteFacturasTitleSection } from './ReporteFacturasTitleSection';
import { ReporteFacturasSummaryCards } from './ReporteFacturasSummaryCards';
import { ReporteFacturasTable } from './ReporteFacturasTable';
import { ReporteFacturasComplementosSection } from './ReporteFacturasComplementosSection';
import { ReporteFacturasLegalNote } from './ReporteFacturasLegalNote';
import { ReporteFacturasFooter } from './ReporteFacturasFooter';

export type {
  FilaFacturaReporte,
  FilaComplementoReporte,
  ReporteFacturasData,
} from './reporte-facturas-types';

interface ReporteFacturasTemplateProps {
  data: ReporteFacturasData;
  headerAction?: ReactNode;
  hideHeaderForCapture?: boolean;
  hideFooterForCapture?: boolean;
  pageNumber?: number;
  totalPages?: number;
  className?: string;
}

export function ReporteFacturasTemplate({
  data,
  headerAction,
  hideHeaderForCapture = false,
  hideFooterForCapture = false,
  pageNumber = 1,
  totalPages = 1,
  className,
}: ReporteFacturasTemplateProps) {
  return (
    <article
      className={cn(
        'bg-white text-gray-900 shadow-none print:shadow-none',
        'mx-auto max-w-[210mm]',
        className
      )}
      data-reporte-contenido
    >
      {!hideHeaderForCapture && (
        <ReporteFacturasHeader
          profileName={data.profileName}
          rfc={data.rfc}
          reportId={data.reportId}
          generatedDate={data.generatedDate}
          generatedTime={data.generatedTime}
          headerAction={headerAction}
        />
      )}

      <div className="px-6 py-6">
        <ReporteFacturasTitleSection data={data} />
        <ReporteFacturasSummaryCards data={data} />
        <ReporteFacturasTable filas={data.filas} />
        <ReporteFacturasComplementosSection
          mes={data.mes}
          año={data.año}
          filasComplementos={data.filasComplementos}
          showComplementProfileColumn={data.showComplementProfileColumn}
        />
        <ReporteFacturasLegalNote />
      </div>

      {!hideFooterForCapture && (
        <ReporteFacturasFooter pageNumber={pageNumber} totalPages={totalPages} />
      )}
    </article>
  );
}
