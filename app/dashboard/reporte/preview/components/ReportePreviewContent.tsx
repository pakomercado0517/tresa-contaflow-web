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
import { ReporteMensualTemplate, type ReporteMensualData } from "./ReporteMensualTemplate";
import { DetalleOperacionesDevengadasTemplate } from "./DetalleOperacionesDevengadasTemplate";
import type { DetalleOperacionesDevengadasData } from "./DetalleOperacionesDevengadasTemplate";
import { exportReportElementToPDF } from "@/lib/pdf";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface ReportePreviewContentProps {
  data: ReporteMensualData;
  detalleData: DetalleOperacionesDevengadasData;
  totalPages: number;
}

/**
 * Vista previa del reporte.
 * html2canvas captura las MISMAS plantillas visibles en pantalla (ReporteMensualTemplate +
 * DetalleOperacionesDevengadasTemplate) para que el PDF sea idéntico al preview.
 * Al exportar, se ocultan header/footer HTML (jsPDF dibuja los suyos).
 */
export function ReportePreviewContent({
  data,
  detalleData,
  totalPages,
}: ReportePreviewContentProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async (asBlob: boolean) => {
    const el = reportRef.current;
    if (!el) return;
    setIsExporting(true);
    setErrorMessage(null);

    try {
      // Esperar al re-render de React (isExporting=true oculta header/footer)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 300));

      el.scrollIntoView({ behavior: "instant", block: "start" });
      await new Promise((r) => setTimeout(r, 200));

      if (asBlob) {
        const { exportReportElementToPDFBlob } = await import("@/lib/pdf");
        const pdfBlob = await exportReportElementToPDFBlob(el);
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl, "_blank");
        if (printWindow) {
          printWindow.onload = () => printWindow.print();
        }
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
      } else {
        const fileName = `contafy-reporte-${MESES[data.mes - 1].toLowerCase()}-${data.año}.pdf`;
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

  const handleDownloadPDF = () => handleExport(false);
  const handlePrint = () => handleExport(true);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reporte Contafy - ${MESES[data.mes - 1]} ${data.año}`,
          text: `Reporte mensual de operaciones - ${data.profileName}`,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error al compartir", err);
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 print:bg-white">
      {/* reportRef envuelve las mismas plantillas que se ven en pantalla.
          html2canvas captura este contenedor → el PDF es idéntico al preview. */}
      <div ref={reportRef} className="w-full max-w-[210mm] mx-auto">
        <ReporteMensualTemplate
          data={data}
          pageNumber={1}
          totalPages={totalPages}
          hideHeaderForCapture={isExporting}
          hideFooterForCapture={isExporting}
          headerAction={
            !isExporting ? (
              <div className="print:hidden">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            ) : undefined
          }
        />
        <DetalleOperacionesDevengadasTemplate
          data={detalleData}
          hideFooterForCapture={isExporting}
        />
      </div>

      {/* Botones flotantes (ocultos al imprimir y durante exportación) */}
      {!isExporting && (
        <div className="fixed right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 print:hidden">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-emerald-600 shadow-lg hover:bg-emerald-700"
            onClick={handlePrint}
            title="Imprimir"
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
