'use client';

import Link from 'next/link';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Plan } from '@/lib/types/subscription';

interface ManualExpenseDialogAlertsProps {
  expensesLimit: number | null;
  canUpload: boolean;
  recommendedPlan: Plan | null;
  isFrozen: boolean;
}

export function ManualExpenseDialogAlerts({
  expensesLimit,
  canUpload,
  recommendedPlan,
  isFrozen,
}: ManualExpenseDialogAlertsProps) {
  return (
    <>
      {expensesLimit !== null && !canUpload && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Has alcanzado el límite de {expensesLimit} gastos por mes de tu plan actual.
            {recommendedPlan && (
              <>
                {' '}
                <Link
                  href="/dashboard/setup?tab=subscription"
                  className="text-primary inline-flex items-center gap-1 hover:underline"
                >
                  Actualiza a {recommendedPlan} <Sparkles className="h-4 w-4" />
                </Link>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isFrozen && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este perfil está congelado 🔒. No se pueden agregar gastos a un perfil congelado.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
