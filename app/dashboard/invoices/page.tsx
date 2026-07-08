import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { InvoicesPageClient } from './components/InvoicesPageClient';

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-50 items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      }
    >
      <InvoicesPageClient />
    </Suspense>
  );
}
