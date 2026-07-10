"use client";

import { type ReactNode } from "react";
import { Building2 } from "lucide-react";

interface ReporteGastosHeaderProps {
  profileName: string;
  rfc: string;
  reportId: string;
  generatedDate: string;
  generatedTime: string;
  headerAction?: ReactNode;
}

export function ReporteGastosHeader({
  profileName,
  rfc,
  reportId,
  generatedDate,
  generatedTime,
  headerAction,
}: ReporteGastosHeaderProps) {
  return (
    <header
      className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4"
      data-html-header
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{profileName}</p>
          <p className="text-sm text-gray-500">RFC: {rfc || "—"}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white">
          ID REPORTE: {reportId}
        </span>
        <p className="text-xs text-gray-500">Generado: {generatedDate}</p>
        <p className="text-xs text-gray-500">Hora: {generatedTime}</p>
      </div>
      {headerAction}
    </header>
  );
}
