import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardHeader } from './DashboardHeader';
import { DashboardGreeting } from './DashboardGreeting';
import { MetricsCards } from './MetricsCards';
import { RecentInvoicesTable } from './RecentInvoicesTable';
import { RecentExpensesTable } from './RecentExpensesTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TrialBannerWrapper } from './TrialBannerWrapper';
import { getMetrics, getInvoices, getTrendData } from '@/lib/api/invoices';
import { getExpenses } from '@/lib/api/expenses';
import { getProfiles } from '@/lib/api/profiles';
import { getCurrentUser } from '@/lib/api/auth.server';

// Lazy load componentes pesados (jsPDF y Recharts)
// Nota: Estos componentes ya son Client Components, el lazy loading reduce el bundle inicial
const ExportPDFButton = dynamic(
  () => import('./ExportPDFButton').then((mod) => ({ default: mod.ExportPDFButton })),
  {
    loading: () => <div className="bg-muted h-10 w-32 animate-pulse rounded-md" />,
  }
);

const FlowTrendChart = dynamic(
  () => import('./FlowTrendChart').then((mod) => ({ default: mod.FlowTrendChart })),
  {
    loading: () => (
      <div className="bg-muted flex h-96 w-full animate-pulse items-center justify-center rounded-lg">
        <LoadingSpinner message="Cargando gráfico..." />
      </div>
    ),
  }
);

interface DashboardContentProps {
  profileId?: string;
  mes: number;
  año: number;
}

export async function DashboardContent({ profileId, mes, año }: DashboardContentProps) {
  // No usar .catch() aquí porque captura los errores de redirect()
  // Si hay un 401, serverApiClient redirigirá automáticamente a /auth/login
  const [metrics, invoices, expenses, profiles, trendData, currentUser] = await Promise.all([
    getMetrics(profileId, mes, año),
    getInvoices({ profileId, mes, año, limit: 3 }),
    getExpenses({ profileId, mes, año, limit: 3 }),
    getProfiles(),
    getTrendData(profileId, año, 'año-actual', mes),
    getCurrentUser(),
  ]);

  const activeProfile = profiles.data.find((p) => p.id === profileId) || profiles.data[0];
  const selectedCompanyName = profileId
    ? activeProfile?.nombre
    : profiles.data.length > 0
      ? 'Todas las empresas'
      : undefined;

  // Obtener el nombre del usuario para mostrar
  const userName = currentUser.user.nombre || currentUser.user.email.split('@')[0];

  // Métricas para el PDF (mapeo desde PeriodMetricsResponse)
  const totalFacturado = metrics.devengado.ingresos_devengados ?? 0;
  const totalPagado = metrics.flujo.ingresos_cobrados ?? 0;
  const totalCompras = metrics.flujo.egresos_pagados ?? 0;
  const pendientePorPagar = metrics.pendientes.por_cobrar ?? 0;
  const diferencia = metrics.flujo.flujo_neto ?? 0;

  return (
    <>
      <DashboardHeader
        profiles={profiles.data || []}
        selectedProfileId={profileId}
        selectedMonth={mes}
        selectedYear={año}
        companyName={selectedCompanyName}
      />
      <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        {/* Trial Banner - Solo se muestra si el usuario está en trial */}
        <TrialBannerWrapper />

        <div className="flex items-center justify-between">
          <DashboardGreeting userName={userName} companyName={selectedCompanyName} />
          <ExportPDFButton
            profileId={profileId}
            profileName={activeProfile?.nombre}
            rfc={activeProfile?.rfc}
            mes={mes}
            año={año}
            metrics={{
              totalFacturado,
              totalPagado,
              totalCompras,
              pendientePorPagar,
              diferencia,
            }}
          />
        </div>
        <MetricsCards metrics={metrics} />
        <Suspense
          fallback={
            <div className="bg-muted flex h-96 w-full animate-pulse items-center justify-center rounded-lg">
              <LoadingSpinner message="Cargando gráfico..." />
            </div>
          }
        >
          <FlowTrendChart initialData={trendData} profileId={profileId} año={año} mes={mes} />
        </Suspense>
        <div className="grid gap-6 md:grid-cols-2">
          <RecentInvoicesTable invoices={invoices.data} />
          <RecentExpensesTable expenses={expenses.data} />
        </div>
      </main>
    </>
  );
}
