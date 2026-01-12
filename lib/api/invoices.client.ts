import { apiClient } from "./client";
import type { UploadInvoiceResponse } from "@/lib/types/invoices";

/**
 * Sube un archivo XML de factura al backend (Client Component only)
 * El sistema determina automáticamente si es factura o gasto basándose en el RFC
 */
export async function uploadInvoice(
  file: File,
  profileId: string
): Promise<UploadInvoiceResponse> {
  const formData = new FormData();
  formData.append("xml", file);
  formData.append("profileId", profileId);

  return apiClient<UploadInvoiceResponse>("/api/invoices/upload", {
    method: "POST",
    body: formData,
    requireAuth: true,
  });
}
