"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ReporteGastosData } from "./reporte-gastos-types";
import { ReporteGastosHeader } from "./ReporteGastosHeader";
import { ReporteGastosTitleSection } from "./ReporteGastosTitleSection";
import { ReporteGastosSummaryCards } from "./ReporteGastosSummaryCards";
import { ReporteGastosTable } from "./ReporteGastosTable";
import { ReporteGastosComplementosSection } from "./ReporteGastosComplementosSection";
import { ReporteGastosLegalNote } from "./ReporteGastosLegalNote";
import { ReporteGastosFooter } from "./ReporteGastosFooter";

export type {
  FilaGastoReporte,
  FilaComplementoReporte,
  ReporteGastosData,
} from "./reporte-gastos-types";

interface ReporteGastosTemplateProps {
  data: ReporteGastosData;
  headerAction?: ReactNode;
  hideHeaderForCapture?: boolean;
  hideFooterForCapture?: boolean;
  pageNumber?: number;
  totalPages?: number;
  className?: string;
}

export function ReporteGastosTemplate({
  data,
  headerAction,
  hideHeaderForCapture = false,
  hideFooterForCapture = false,
  pageNumber = 1,
  totalPages = 1,
  className,
}: ReporteGastosTemplateProps) {
  return (
    <article
      className={cn(
        "bg-white text-gray-900 shadow-none print:shadow-none",
        "mx-auto max-w-[210mm]",
        className
      )}
      data-reporte-contenido
    >
      {!hideHeaderForCapture && (
        <ReporteGastosHeader
          profileName={data.profileName}
          rfc={data.rfc}
          reportId={data.reportId}
          generatedDate={data.generatedDate}
          generatedTime={data.generatedTime}
          headerAction={headerAction}
        />
      )}

      <div className="px-6 py-6">
        <ReporteGastosTitleSection data={data} />
        <ReporteGastosSummaryCards data={data} />
        <ReporteGastosTable filas={data.filas} />
        <ReporteGastosComplementosSection
          mes={data.mes}
          año={data.año}
          filasComplementos={data.filasComplementos}
          showComplementProfileColumn={data.showComplementProfileColumn}
        />
        <ReporteGastosLegalNote />
      </div>

      {!hideFooterForCapture && (
        <ReporteGastosFooter pageNumber={pageNumber} totalPages={totalPages} />
      )}
    </article>
  );
}
