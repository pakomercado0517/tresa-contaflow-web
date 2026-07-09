import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DashboardHomePageClient } from './components/DashboardHomePageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-50 items-center justify-center p-8">
          <LoadingSpinner message="Cargando resumen..." />
        </div>
      }
    >
      <DashboardHomePageClient />
    </Suspense>
  );
}
