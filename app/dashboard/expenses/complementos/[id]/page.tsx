import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PaymentComplementDetailPageClient } from '@/components/payment-complements/PaymentComplementDetailPageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpensePaymentComplementDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-50 items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      }
    >
      <PaymentComplementDetailPageClient
        complementId={id}
        role="EGRESO"
        listBasePath="/dashboard/expenses"
        detailRouteBase="/dashboard/expenses/complementos"
      />
    </Suspense>
  );
}
