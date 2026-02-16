"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReporteGastosTemplate, type ReporteGastosData } from "./ReporteGastosTemplate";
import { exportReportElementToPDF } from "@/lib/pdf";
import { useSubscription, hasFeatureAccess } from "@/lib/hooks/useSubscription";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface ExpensesReportPreviewContentProps {
  data: ReporteGastosData;
}

export function ExpensesReportPreviewContent({ data }: ExpensesReportPreviewContentProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { subscription } = useSubscription();
  const canExportPDF = hasFeatureAccess(subscription, "pdf_export");
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async (asBlob: boolean) => {
    const el = reportRef.current;
    if (!el) return;
    setIsExporting(true);
    setErrorMessage(null);

    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 300));
      el.scrollIntoView({ behavior: "instant", block: "start" });
      await new Promise((r) => setTimeout(r, 200));

      if (asBlob) {
        const { exportReportElementToPDFBlob } = await import("@/lib/pdf");
        const pdfBlob = await exportReportElementToPDFBlob(el);
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl, "_blank");
        if (printWindow) printWindow.onload = () => printWindow.print();
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
      } else {
        const fileName = `contafy-gastos-${MESES[data.mes - 1].toLowerCase()}-${data.año}.pdf`;
        await exportReportElementToPDF(el, fileName);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error al exportar PDF", error);
      setErrorMessage(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reporte de gastos Contafy - ${data.periodoLabel}`,
          text: `Reporte detallado de gastos - ${data.profileName}`,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error("Error al compartir", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 print:bg-white">
      <div ref={reportRef} className="w-full max-w-[210mm] mx-auto">
        <ReporteGastosTemplate
          data={data}
          hideHeaderForCapture={isExporting}
          hideFooterForCapture={isExporting}
          pageNumber={1}
          totalPages={1}
          headerAction={
            !isExporting ? (
              <Button
                onClick={() => handleExport(false)}
                disabled={!canExportPDF || isExporting}
                title={!canExportPDF ? "Disponible en plan Básico o superior" : undefined}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            ) : (
              <Button disabled className="bg-emerald-600">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </Button>
            )
          }
        />
      </div>

      {!isExporting && (
        <div className="fixed right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 print:hidden">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-emerald-600 shadow-lg hover:bg-emerald-700 disabled:opacity-50"
            onClick={() => handleExport(true)}
            disabled={!canExportPDF}
            title={canExportPDF ? "Imprimir" : "Disponible en plan Básico o superior"}
          >
            <Printer className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-emerald-600 shadow-lg hover:bg-emerald-700"
            onClick={handleShare}
            title="Compartir"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      )}

      <Dialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Error al generar el PDF</DialogTitle>
            <DialogDescription>{errorMessage ?? ""}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorMessage(null)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
