'use client';

import { useRef, useState } from 'react';
import { Download, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReporteMensualTemplate, type ReporteMensualData } from './ReporteMensualTemplate';
import { DetalleOperacionesDevengadasTemplate } from './DetalleOperacionesDevengadasTemplate';
import type { DetalleOperacionesDevengadasData } from './DetalleOperacionesDevengadasTemplate';
import {
  exportReportElementToPDF,
  prepareReportElementForCapture,
  shareReportPdf,
} from '@/lib/pdf';
import { useSubscription, hasFeatureAccess } from '@/lib/hooks/useSubscription';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
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
  const { subscription } = useSubscription();
  const canExportPDF = hasFeatureAccess(subscription, 'pdf_export');
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reportFileName = `contafy-reporte-${MESES[data.mes - 1].toLowerCase()}-${data.año}.pdf`;
  const reportShareTitle = `Reporte Contafy - ${MESES[data.mes - 1]} ${data.año}`;
  const reportShareText = `Reporte mensual de operaciones - ${data.profileName}`;

  const handleExport = async (asBlob: boolean) => {
    const el = reportRef.current;
    if (!el) return;
    setIsExporting(true);
    setErrorMessage(null);

    try {
      await prepareReportElementForCapture(el);

      if (asBlob) {
        const { exportReportElementToPDFBlob } = await import('@/lib/pdf');
        const pdfBlob = await exportReportElementToPDFBlob(el);
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => printWindow.print();
        }
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
      } else {
        await exportReportElementToPDF(el, reportFileName);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error al exportar PDF', error);
      setErrorMessage(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = () => handleExport(false);
  const handlePrint = () => handleExport(true);

  const handleShare = async () => {
    const el = reportRef.current;
    if (!el || !canExportPDF) return;

    setIsExporting(true);
    setErrorMessage(null);

    try {
      await prepareReportElementForCapture(el);
      await shareReportPdf({
        element: el,
        fileName: reportFileName,
        title: reportShareTitle,
        text: reportShareText,
        shareUrl: window.location.href,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error al compartir PDF', error);
      setErrorMessage(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 print:bg-white">
      {/* reportRef envuelve las mismas plantillas que se ven en pantalla.
          html2canvas captura este contenedor → el PDF es idéntico al preview. */}
      <div ref={reportRef} className="mx-auto w-full max-w-[210mm]">
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
                  disabled={!canExportPDF || isExporting}
                  title={!canExportPDF ? 'Disponible en plan Básico o superior' : undefined}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
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
        <div className="fixed top-1/2 right-6 z-10 flex -translate-y-1/2 flex-col gap-3 print:hidden">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-emerald-600 shadow-lg hover:bg-emerald-700 disabled:opacity-50"
            onClick={handlePrint}
            disabled={!canExportPDF}
            title={canExportPDF ? 'Imprimir' : 'Disponible en plan Básico o superior'}
          >
            <Printer className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-emerald-600 shadow-lg hover:bg-emerald-700 disabled:opacity-50"
            onClick={handleShare}
            disabled={!canExportPDF}
            title={canExportPDF ? 'Compartir PDF' : 'Disponible en plan Básico o superior'}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      )}

      <Dialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Error al generar el PDF</DialogTitle>
            <DialogDescription>{errorMessage ?? ''}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorMessage(null)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
