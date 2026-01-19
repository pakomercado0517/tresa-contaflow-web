import { redirect } from "next/navigation";
import { getDiscountCodes } from "@/lib/api/discounts";
import { ServerApiError } from "@/lib/api/server-client";
import { DiscountManagementContent } from "./components/DiscountManagementContent";

/**
 * Ruta administrativa oculta para gestionar códigos de descuento
 * 
 * Esta ruta no aparece en la navegación del proyecto.
 * Solo usuarios con permisos de administrador pueden acceder.
 * 
 * La verificación de permisos se hace automáticamente al intentar
 * acceder a los endpoints de códigos de descuento.
 */
export default async function DiscountManagementPage() {
  try {
    // Intentar obtener los códigos de descuento
    // Si el usuario no es admin, recibirá un 403 y se redirigirá
    await getDiscountCodes();
  } catch (error) {
    // Si hay un error (probablemente 403 Forbidden), redirigir
    if (error instanceof ServerApiError) {
      // Si es 403 (Forbidden), el usuario no tiene permisos de admin
      if (error.status === 403) {
        redirect("/dashboard");
      }
      // Si es 401 (Unauthorized), redirigir a login (ya lo hace serverApiClient)
      if (error.status === 401) {
        redirect("/auth/login");
      }
    }
    // Si es otro error, también redirigir por seguridad
    redirect("/dashboard");
  }

  return <DiscountManagementContent />;
}
