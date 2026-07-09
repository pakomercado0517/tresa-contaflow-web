import { Suspense } from 'react';
import { DashboardContent } from './components/DashboardContent';
import { DashboardHomeUrlSync } from './components/DashboardHomeUrlSync';
import { getCurrentMonthYearInAppTimezone } from '@/lib/utils/app-calendar';

// Forzar renderizado dinámico y evitar caché para datos siempre frescos
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DashboardPageProps {
  searchParams?: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
    regimen_fiscal?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { mes: defaultMes, año: defaultAño } = getCurrentMonthYearInAppTimezone();
  const params = await searchParams;

  const profileId = params?.profileId;
  const mesParam = params?.mes;
  const añoParam = params?.['año'];
  const regimenFiscal =
    params?.regimen_fiscal && params.regimen_fiscal !== 'all'
      ? params.regimen_fiscal
      : undefined;

  const mesNumber = mesParam ? Number(mesParam) : defaultMes;
  const añoNumber = añoParam ? Number(añoParam) : defaultAño;

  const mes = Number.isFinite(mesNumber) ? mesNumber : defaultMes;
  const año = Number.isFinite(añoNumber) ? añoNumber : defaultAño;

  return (
    <>
      <Suspense fallback={null}>
        <DashboardHomeUrlSync />
      </Suspense>
      <DashboardContent
        profileId={profileId}
        mes={mes}
        año={año}
        regimenFiscal={regimenFiscal}
      />
    </>
  );
}
