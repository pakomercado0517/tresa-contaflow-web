'use client';

import Link from 'next/link';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertSourceBadge } from '@/components/common/AlertSourceBadge';
import { Progress } from '@/components/ui/progress';
import type { Plan } from '@/lib/types/subscription';

type UsageWarningLevel = 'error' | 'warning' | 'info' | null;

interface UploadExpensesUsageAlertProps {
  expensesLimit: number | null;
  expensesUsed: number;
  usagePercentage: number;
  warningLevel: UsageWarningLevel;
  remaining: number | null;
  recommendedPlan: Plan | null;
}

export function UploadExpensesUsageAlert({
  expensesLimit,
  expensesUsed,
  usagePercentage,
  warningLevel,
  remaining,
  recommendedPlan,
}: UploadExpensesUsageAlertProps) {
  if (expensesLimit === null) return null;

  return (
    <Alert
      className={
        warningLevel === 'error'
          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
          : warningLevel === 'warning'
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
            : warningLevel === 'info'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-border'
      }
    >
      <AlertCircle
        className={`h-4 w-4 ${
          warningLevel === 'error'
            ? 'text-red-600'
            : warningLevel === 'warning'
              ? 'text-orange-600'
              : warningLevel === 'info'
                ? 'text-blue-600'
                : 'text-muted-foreground'
        }`}
      />
      <AlertTitle className="flex flex-wrap items-center gap-2">
        <span>Uso de Gastos del Mes</span>
        <AlertSourceBadge source="planLimit" />
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>
            {expensesUsed} / {expensesLimit} gastos utilizados
          </span>
          <span className="font-medium">{Math.round(usagePercentage)}%</span>
        </div>
        <Progress value={usagePercentage} className="h-2" />
        {warningLevel === 'error' && (
          <p className="text-sm font-medium">
            Has alcanzado el límite de tu plan.{' '}
            {recommendedPlan && (
              <Link
                href="/dashboard/setup?tab=subscription"
                className="text-primary inline-flex items-center gap-1 hover:underline"
              >
                Actualiza a {recommendedPlan} <Sparkles className="h-4 w-4" />
              </Link>
            )}
          </p>
        )}
        {warningLevel === 'warning' && remaining !== null && remaining > 0 && (
          <p className="text-sm">
            Te quedan {remaining} gasto{remaining !== 1 ? 's' : ''} disponibles este mes.
            {recommendedPlan && (
              <Link
                href="/dashboard/setup?tab=subscription"
                className="text-primary ml-1 inline-flex items-center gap-1 hover:underline"
              >
                Considera actualizar tu plan <Sparkles className="h-4 w-4" />
              </Link>
            )}
          </p>
        )}
        {warningLevel === 'info' && remaining !== null && (
          <p className="text-muted-foreground text-sm">
            Te quedan {remaining} gastos disponibles este mes.
          </p>
        )}
        {!warningLevel && remaining !== null && remaining > 0 && (
          <p className="text-muted-foreground text-sm">
            Te quedan {remaining} gastos disponibles este mes.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
