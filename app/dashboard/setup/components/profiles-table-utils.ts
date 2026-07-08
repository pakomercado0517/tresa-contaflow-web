import { ApiError } from '@/lib/api/client';
import type { ProfileStats } from '@/lib/utils/pdf-export';
import type { Invoice } from '@/lib/types/invoices';
import type { Expense } from '@/lib/types/expenses';

export function calculateProfileStats(
  invoices: Invoice[],
  expenses: Expense[],
  profileId: string
): ProfileStats {
  const profileInvoices = invoices.filter((inv) => inv.profile_id === profileId);
  const profileExpenses = expenses.filter((exp) => exp.profile_id === profileId);

  const totalInvoiced = profileInvoices.reduce((sum, inv) => {
    const total = typeof inv.total === 'number' ? inv.total : parseFloat(String(inv.total)) || 0;
    return sum + total;
  }, 0);

  const totalSpent = profileExpenses.reduce((sum, exp) => {
    const total = typeof exp.total === 'number' ? exp.total : parseFloat(String(exp.total)) || 0;
    return sum + total;
  }, 0);

  const invoiceDates = profileInvoices
    .map((inv) => inv.fecha)
    .filter((fecha): fecha is string => Boolean(fecha))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const expenseDates = profileExpenses
    .map((exp) => exp.fecha)
    .filter((fecha): fecha is string => Boolean(fecha))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return {
    profileId,
    totalInvoices: profileInvoices.length,
    totalExpenses: profileExpenses.length,
    totalInvoiced,
    totalSpent,
    firstInvoiceDate: invoiceDates.length > 0 ? invoiceDates[0] : null,
    lastInvoiceDate: invoiceDates.length > 0 ? invoiceDates[invoiceDates.length - 1] : null,
    firstExpenseDate: expenseDates.length > 0 ? expenseDates[0] : null,
    lastExpenseDate: expenseDates.length > 0 ? expenseDates[expenseDates.length - 1] : null,
  };
}

export function getProfileDeleteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'No tienes permisos para eliminar este perfil.';
    }
    if (error.status === 404) {
      return 'El perfil ya no existe o fue eliminado.';
    }
    if (error.status === 409) {
      return 'No se puede eliminar el perfil porque tiene datos asociados.';
    }
    return error.message || 'No se pudo eliminar el perfil.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No se pudo eliminar el perfil. Intenta nuevamente.';
}
