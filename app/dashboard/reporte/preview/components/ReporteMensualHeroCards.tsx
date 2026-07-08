'use client';

import Image from 'next/image';
import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { REPORTE_MESES, type ReporteMensualData } from './reporte-mensual-types';

interface ReporteMensualHeroCardsProps {
  data: Pick<
    ReporteMensualData,
    'logoUrl' | 'nombreComercial' | 'rfc' | 'mes' | 'año'
  >;
}

export function ReporteMensualHeroCards({ data }: ReporteMensualHeroCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
      <Card className="overflow-visible border border-gray-200 bg-gray-50/80 shadow-sm">
        <CardHeader className="pb-2">
          {data.logoUrl ? (
            <div className="-mt-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow">
              <Image
                src={data.logoUrl}
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="-mt-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow">
              <DollarSign className="h-6 w-6" />
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {data.nombreComercial ? (
            <>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                {data.nombreComercial}
              </h2>
              <p className="mt-0.5 text-xs font-medium tracking-wide text-gray-500">
                Generado con Contafy
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-emerald-700">Contafy</h2>
              <p className="text-sm font-medium tracking-wide text-gray-500 uppercase">
                FINANCIAL ANALYTICS
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 bg-emerald-600 text-white shadow-sm">
        <div
          className="absolute top-0 left-0 h-24 w-24 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 4px,
                rgba(255,255,255,0.3) 4px,
                rgba(255,255,255,0.3) 8px
              )`,
          }}
        />
        <CardContent className="relative p-6">
          <p className="text-sm font-medium text-emerald-100">Reporte Mensual de Operaciones</p>
          <p className="mt-2 text-2xl font-bold">RFC: {data.rfc || '—'}</p>
          <p className="mt-1 text-emerald-100">
            Periodo: {REPORTE_MESES[data.mes - 1]} {data.año}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
