import { apiClient } from "./client";
import type { UploadExpenseResponse, CreateExpenseRequest, CreateExpenseResponse } from "@/lib/types/expenses";

/**
 * Sube un archivo XML de gasto al backend (Client Component only)
 * Nota: En realidad usa el mismo endpoint que invoices/upload
 * El sistema determina automáticamente si es factura o gasto basándose en el RFC
 */
export async function uploadExpense(
  file: File,
  profileId: string
): Promise<UploadExpenseResponse> {
  const formData = new FormData();
  formData.append("xml", file);
  formData.append("profileId", profileId);

  return apiClient<UploadExpenseResponse>("/api/invoices/upload", {
    method: "POST",
    body: formData,
    requireAuth: true,
  });
}

/**
 * Crea un gasto manual (Client Component only)
 */
export async function createManualExpense(
  data: CreateExpenseRequest
): Promise<CreateExpenseResponse> {
  return apiClient<CreateExpenseResponse>("/api/expenses", {
    method: "POST",
    body: JSON.stringify(data),
    requireAuth: true,
  });
}
