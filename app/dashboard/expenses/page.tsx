import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ExpensesPageClient } from './components/ExpensesPageClient';

export default function ExpensesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-50 items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      }
    >
      <ExpensesPageClient />
    </Suspense>
  );
}
