import { Badge } from '@/components/ui/badge';
import { ApiError } from '@/lib/api/client';
import type { Expense } from '@/lib/types/expenses';

/** Categorías para gastos manuales (edición y tabla). No confundir con el filtro de régimen fiscal. */
export const MANUAL_EXPENSE_CATEGORIES = [
  { value: 'Viáticos', label: 'Viáticos' },
  { value: 'Oficina', label: 'Oficina' },
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Alimentación', label: 'Alimentación' },
] as const;

export function getExpenseCategoryBadge(categoria: string | null) {
  if (!categoria) return null;

  const categoryColors: Record<string, string> = {
    Viáticos: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Oficina: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Servicios: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Transporte: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Alimentación: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const colorClass = categoryColors[categoria] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <Badge variant="outline" className={colorClass}>
      {categoria}
    </Badge>
  );
}

export function getExpenseOriginBadge(tipoOrigen: 'XML' | 'MANUAL') {
  if (tipoOrigen === 'XML') {
    return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">XML</Badge>;
  }
  return (
    <Badge variant="secondary" className="border-orange-500/30 bg-orange-500/20 text-orange-400">
      Manual
    </Badge>
  );
}

export function getExpenseDeleteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'No tienes permisos para eliminar este gasto.';
    }
    if (error.status === 404) {
      return 'El gasto ya no existe o fue eliminado.';
    }
    if (error.status === 400) {
      return error.message || 'No se puede eliminar este gasto.';
    }
    return error.message || 'Error al eliminar el gasto.';
  }
  return 'Error inesperado al eliminar el gasto. Por favor intenta nuevamente.';
}

export function getExpensePaymentStatusBadge(expense: Expense) {
  if (expense.tipo_origen !== 'XML' || !expense.tipo || expense.tipo === 'COMPLEMENTO_PAGO') {
    return null;
  }

  if (expense.tipo === 'PUE') {
    return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">✓ Pagado</Badge>;
  }

  if (expense.tipo === 'PPD') {
    const estadoPago = expense.estadoPago;

    if (!estadoPago) {
      return (
        <Badge variant="outline" className="border-orange-500 bg-orange-50 text-orange-600">
          No Pagado
        </Badge>
      );
    }

    if (estadoPago.completamentePagado || estadoPago.estado === 'PAGADO') {
      return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">✓ Pagado</Badge>;
    }

    if (estadoPago.estado === 'PAGO_PARCIAL' || estadoPago.porcentajePagado > 0) {
      return (
        <Badge variant="outline" className="border-blue-500 bg-blue-50 text-blue-600">
          Pago Parcial ({Math.round(estadoPago.porcentajePagado)}%)
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-orange-500 bg-orange-50 text-orange-600">
        No Pagado
      </Badge>
    );
  }

  return null;
}
