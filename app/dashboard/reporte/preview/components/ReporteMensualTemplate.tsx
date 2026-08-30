'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { ReporteMensualData } from './reporte-mensual-types';
import { ReporteMensualHeader } from './ReporteMensualHeader';
import { ReporteMensualHeroCards } from './ReporteMensualHeroCards';
import { ReporteMensualFlujoSection } from './ReporteMensualFlujoSection';
import { ReporteMensualTesoreriaSection } from './ReporteMensualTesoreriaSection';
import { ReporteMensualComparativaSection } from './ReporteMensualComparativaSection';
import { ReporteMensualEstadoPorRegimenSection } from './ReporteMensualEstadoPorRegimenSection';
import { ReporteMensualEstadoDevengadoSection } from './ReporteMensualEstadoDevengadoSection';
import { ReporteMensualEstimacionesFiscalesSection } from './ReporteMensualEstimacionesFiscalesSection';
import { ReporteMensualFooter } from './ReporteMensualFooter';
import { PRODUCT_FEATURES } from '@/lib/constants/product-features';

export type {
  EstadoPorRegimen,
  ReporteTaxEstimateItem,
  ReporteMensualData,
} from './reporte-mensual-types';

interface ReporteMensualTemplateProps {
  data: ReporteMensualData;
  headerAction?: ReactNode;
  hideHeaderForCapture?: boolean;
  hideFooterForCapture?: boolean;
  pageNumber?: number;
  totalPages?: number;
  className?: string;
}

export function ReporteMensualTemplate({
  data,
  headerAction,
  hideHeaderForCapture = false,
  hideFooterForCapture = false,
  pageNumber = 1,
  totalPages = 1,
  className,
}: ReporteMensualTemplateProps) {
  const margen =
    data.ingresosDevengados > 0 ? (data.utilidadOperativa / data.ingresosDevengados) * 100 : 0;

  const hasEstadoPorRegimen = Boolean(data.estadoPorRegimen && data.estadoPorRegimen.length > 0);
  const hasTaxEstimates = Boolean(
    PRODUCT_FEATURES.taxEstimate && data.estimacionesFiscales && data.estimacionesFiscales.length > 0
  );

  return (
    <article
      className={cn(
        'bg-white text-gray-900 shadow-none print:shadow-none',
        'mx-auto max-w-[210mm]',
        className
      )}
      data-reporte-contenido
    >
      {!hideHeaderForCapture && <ReporteMensualHeader headerAction={headerAction} />}

      <ReporteMensualHeroCards data={data} />
      <ReporteMensualFlujoSection data={data} />
      <ReporteMensualTesoreriaSection data={data} />
      <ReporteMensualComparativaSection data={data} />

      {hasEstadoPorRegimen && data.estadoPorRegimen && (
        <ReporteMensualEstadoPorRegimenSection estadoPorRegimen={data.estadoPorRegimen} />
      )}

      {!hasEstadoPorRegimen && (
        <ReporteMensualEstadoDevengadoSection data={data} margen={margen} />
      )}

      {hasTaxEstimates && data.estimacionesFiscales && (
        <ReporteMensualEstimacionesFiscalesSection estimacionesFiscales={data.estimacionesFiscales} />
      )}

      {!hideFooterForCapture && (
        <ReporteMensualFooter
          pageNumber={pageNumber}
          totalPages={totalPages}
          hasTaxEstimates={hasTaxEstimates}
        />
      )}
    </article>
  );
}
