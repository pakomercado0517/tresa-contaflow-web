"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
import {
  exportToPDF,
  normalizeInvoicesForExport,
  normalizeExpensesForExport,
} from "@/lib/utils/pdf-export";
import { apiClient } from "@/lib/api/client";
import type { Invoice } from "@/lib/types/invoices";
import type { Expense } from "@/lib/types/expenses";

interface ExportPDFButtonProps {
  profileId?: string;
  profileName?: string;
  rfc?: string;
  mes: number;
  año: number;
  metrics: {
    totalFacturado: number;
    totalPagado: number;
    totalCompras: number;
    pendientePorPagar: number;
    diferencia: number;
  };
}

export function ExportPDFButton({
  profileId,
  profileName,
  rfc,
  mes,
  año,
  metrics,
}: ExportPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      // Obtener TODAS las facturas y gastos del mes (sin límite)
      const queryParams = new URLSearchParams();
      if (profileId) queryParams.append("profileId", profileId);
      queryParams.append("mes", mes.toString());
      queryParams.append("año", año.toString());
      queryParams.append("limit", "1000"); // Límite alto para obtener todos

      const [invoicesResponse, expensesResponse] = await Promise.all([
        apiClient<{ data: Invoice[] }>(
          `/api/invoices?${queryParams.toString()}`,
          { requireAuth: true }
        ),
        apiClient<{ data: Expense[] }>(
          `/api/expenses?${queryParams.toString()}`,
          { requireAuth: true }
        ),
      ]);

      const invoices = normalizeInvoicesForExport(invoicesResponse.data || []);
      const expenses = normalizeExpensesForExport(expensesResponse.data || []);

      await exportToPDF({
        tipo: "completo",
        invoices,
        expenses,
        profileName: profileName || "Todos los perfiles",
        rfc: rfc || "",
        mes,
        año,
        metrics,
      });
    } catch (error) {
      logger.error("Error al exportar PDF", error);
      alert("Error al generar el PDF. Por favor intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      variant="outline"
      className="border-primary text-primary hover:bg-primary/10"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte PDF
        </>
      )}
    </Button>
  );
}
