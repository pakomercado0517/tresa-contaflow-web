"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatReporteGastosCurrency } from "./reporte-gastos-format";
import type { ReporteGastosData } from "./reporte-gastos-types";

interface ReporteGastosSummaryCardsProps {
  data: Pick<
    ReporteGastosData,
    | "regimenFiscalLabel"
    | "totalRetencionesIva"
    | "totalRetencionesIsr"
    | "totalEgresos"
    | "totalIva"
  >;
}

export function ReporteGastosSummaryCards({ data }: ReporteGastosSummaryCardsProps) {
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-gray-200 bg-gray-50/80">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Régimen fiscal
            </p>
            <p className="mt-1 font-medium text-gray-900">{data.regimenFiscalLabel}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gray-50/80">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Retenciones IVA
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatReporteGastosCurrency(data.totalRetencionesIva)}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gray-50/80">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Retenciones ISR
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatReporteGastosCurrency(data.totalRetencionesIsr)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border border-amber-200 bg-amber-50/60">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              Total egresos CFDI
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              {formatReporteGastosCurrency(data.totalEgresos)}
            </p>
            <p className="text-xs text-gray-600">MXN</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gray-50/80">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Total IVA
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatReporteGastosCurrency(data.totalIva)}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
