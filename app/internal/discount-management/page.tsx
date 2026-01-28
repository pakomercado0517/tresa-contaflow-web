import { notFound } from 'next/navigation';
import { getDiscountCodes } from '@/lib/api/discounts';
import { ServerApiError } from '@/lib/api/server-client';
import { DiscountManagementContent } from './components/DiscountManagementContent';

/**
 * Ruta administrativa oculta para gestionar códigos de descuento
 *
 * Esta ruta no aparece en la navegación del proyecto.
 * Solo usuarios con permisos de administrador pueden acceder.
 *
 * Para usuarios no autorizados o sin permisos, se muestra una página 404
 * para ocultar la existencia de esta ruta administrativa.
 */
export default async function DiscountManagementPage() {
  try {
    // Intentar obtener los códigos de descuento
    // Si el usuario no es admin, recibirá un 403 y se mostrará 404
    await getDiscountCodes();
  } catch (error) {
    // Si hay un error, mostrar página 404 para ocultar la existencia de la ruta
    if (error instanceof ServerApiError) {
      // Si es 403 (Forbidden), el usuario no tiene permisos de admin
      // Si es 401 (Unauthorized), el usuario no está autenticado
      // En ambos casos, mostrar 404 para ocultar la ruta
      if (error.status === 403 || error.status === 401) {
        notFound();
      }
    }
    // Si es otro error, también mostrar 404 por seguridad
    notFound();
  }

  return <DiscountManagementContent />;
}
