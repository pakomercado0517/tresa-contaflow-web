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

export function ReportePreviewContent({
  data,
  detalleData,
  totalPages,
}: ReportePreviewContentProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    const el = reportRef.current;
    if (!el) return;
    setIsExporting(true);
    setErrorMessage(null);

    // Referencias a los elementos que vamos a ocultar
    const htmlHeaders = Array.from(el.querySelectorAll<HTMLElement>('[data-html-header]'));
    const htmlFooters = Array.from(el.querySelectorAll<HTMLElement>('[data-html-footer]'));
    const originalStyles: Array<{ element: HTMLElement; display: string }> = [];

    try {
      // Ocultar headers y footers HTML directamente manipulando el DOM
      [...htmlHeaders, ...htmlFooters].forEach((element) => {
        originalStyles.push({
          element,
          display: element.style.display,
        });
        element.style.display = 'none';
      });

      // Esperar a que los cambios se apliquen
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      el.scrollIntoView({ behavior: "instant", block: "start" });
      await new Promise((r) => setTimeout(r, 300));

      const fileName = `contafy-reporte-${MESES[data.mes - 1].toLowerCase()}-${data.año}.pdf`;
      await exportReportElementToPDF(el, fileName);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error al exportar PDF", error);
      setErrorMessage(message);
    } finally {
      // Restaurar los estilos originales
      originalStyles.forEach(({ element, display }) => {
        element.style.display = display;
      });
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    const el = reportRef.current;
    if (!el) return;
    setIsExporting(true);
    setErrorMessage(null);

    // Referencias a los elementos que vamos a ocultar
    const htmlHeaders = Array.from(el.querySelectorAll<HTMLElement>('[data-html-header]'));
    const htmlFooters = Array.from(el.querySelectorAll<HTMLElement>('[data-html-footer]'));
    const originalStyles: Array<{ element: HTMLElement; display: string }> = [];

    try {
      // Ocultar headers y footers HTML directamente manipulando el DOM
      [...htmlHeaders, ...htmlFooters].forEach((element) => {
        originalStyles.push({
          element,
          display: element.style.display,
        });
        element.style.display = 'none';
      });

      // Esperar a que los cambios se apliquen
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      el.scrollIntoView({ behavior: "instant", block: "start" });
      await new Promise((r) => setTimeout(r, 300));

      // Generar el PDF pero en lugar de descargarlo, abrirlo en nueva ventana para imprimir
      const { exportReportElementToPDFBlob } = await import('@/lib/pdf');
      const pdfBlob = await exportReportElementToPDFBlob(el);

      // Crear URL del blob y abrir en nueva ventana para imprimir
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      // Limpiar la URL del blob después de un tiempo
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error al generar PDF para imprimir", error);
      setErrorMessage(message);
    } finally {
      // Restaurar los estilos originales
      originalStyles.forEach(({ element, display }) => {
        element.style.display = display;
      });
      setIsExporting(false);
    }
  };

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
      {/* Contenedor del reporte capturado por html2canvas para generar el PDF.
          Antes se forzaba una altura mínima de una página completa (min-h-[267mm]),
          lo que podía generar cortes inconsistentes cuando el contenido real
          ocupaba más de una página (por ejemplo, con varios regímenes). */}
      <div ref={reportRef} className="w-full max-w-[210mm] mx-auto">
        <div>
          <ReporteMensualTemplate
            data={data}
            pageNumber={1}
            totalPages={totalPages}
            hideHeaderForCapture={isExporting}
            hideFooterForCapture={isExporting}
            headerAction={
            <div className="print:hidden">
              <Button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </>
                )}
              </Button>
            </div>
          }
          />
        </div>
        <DetalleOperacionesDevengadasTemplate data={detalleData} hideFooterForCapture={isExporting} />
      </div>

      {/* Botones flotantes (solo vista previa, ocultos al imprimir) */}
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

      {/* Diálogo de error al exportar PDF */}
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
