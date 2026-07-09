import { Badge } from '@/components/ui/badge';
import { AlertTitle } from '@/components/ui/alert';
import { ApiError } from '@/lib/api/client';
import type { Invoice } from '@/lib/types/invoices';

export function getManualIncomeDeleteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'No tienes permisos para eliminar este ingreso.';
    if (error.status === 404) return 'El ingreso ya no existe o fue eliminado.';
    if (error.status === 400) return error.message || 'No se puede eliminar este ingreso.';
    return error.message || 'Error al eliminar el ingreso.';
  }
  return 'Error inesperado al eliminar el ingreso. Por favor intenta nuevamente.';
}

export function getInvoiceDeleteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'No tienes permisos para eliminar esta factura.';
    }
    if (error.status === 404) {
      return 'La factura ya no existe o fue eliminada.';
    }
    if (error.status === 400) {
      return error.message || 'No se puede eliminar esta factura.';
    }
    return error.message || 'Error al eliminar la factura.';
  }
  return 'Error inesperado al eliminar la factura. Por favor intenta nuevamente.';
}

export function getInvoiceStatusBadge(invoice: Invoice) {
  if (!invoice.validacion?.valido) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTitle className="h-3 w-3" />
        ERROR
      </Badge>
    );
  }

  if (invoice.tipo === 'PUE') {
    return <Badge className="bg-green-500 text-white hover:bg-green-600">✓ Pagado</Badge>;
  }

  if (invoice.tipo === 'PPD') {
    const estadoPago = invoice.estadoPago;

    if (!estadoPago) {
      return (
        <Badge variant="outline" className="border-orange-500 bg-orange-50 text-orange-600">
          No Pagado
        </Badge>
      );
    }

    if (estadoPago.completamentePagado || estadoPago.estado === 'PAGADO') {
      return <Badge className="bg-green-500 text-white hover:bg-green-600">✓ Pagado</Badge>;
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

  if (invoice.tipo === 'COMPLEMENTO_PAGO') {
    return <Badge className="bg-green-500 text-white hover:bg-green-600">✓ VÁLIDO</Badge>;
  }

  return <Badge className="bg-green-500 text-white hover:bg-green-600">✓ VÁLIDO</Badge>;
}
