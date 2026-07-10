"use client";

import Image from "next/image";
import type { ReporteGastosData } from "./reporte-gastos-types";

interface ReporteGastosTitleSectionProps {
  data: Pick<
    ReporteGastosData,
    "logoUrl" | "nombreComercial" | "profileName" | "rfc" | "periodoLabel" | "estadoCfdi"
  >;
}

export function ReporteGastosTitleSection({ data }: ReporteGastosTitleSectionProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {(data.logoUrl || data.nombreComercial) && (
          <div className="mb-4 flex items-center gap-3">
            {data.logoUrl && (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                <Image
                  src={data.logoUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
            )}
            {data.nombreComercial && (
              <p className="text-lg font-semibold tracking-tight text-gray-900">
                {data.nombreComercial}
              </p>
            )}
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          REPORTE DETALLADO DE GASTOS
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <span>TIPO:</span>
          <span className="rounded bg-amber-600 px-2 py-0.5 text-xs font-medium text-white">
            EGRESOS
          </span>
        </p>
      </div>
      <div className="flex flex-col items-end text-right text-sm text-gray-600">
        <p className="font-medium text-gray-900">{data.profileName}</p>
        <p className="mt-0.5 font-mono text-xs text-gray-700">RFC: {data.rfc || "—"}</p>
        <p className="mt-2 font-medium text-gray-900">Período reportado: {data.periodoLabel}</p>
        <p className="mt-1 flex items-center justify-end gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          Estado de CFDI: {data.estadoCfdi}
        </p>
      </div>
    </div>
  );
}
