import type jsPDF from 'jspdf';
import { COLORS, REPORT } from './constants';

export interface ExportReportOptions {
  rfc?: string;
  periodo?: string;
  profileName?: string;
}

export function drawReportHeader(doc: jsPDF, options: ExportReportOptions): void {
  // Header deshabilitado - causa traslapes entre páginas
  return;
}

export function drawReportFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const fechaGen = now.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Rectángulo blanco para cubrir desbordamientos mínimos del contenido
  doc.setFillColor(255, 255, 255);
  doc.rect(0, pageHeight - REPORT.footerHeightMm, pageWidth, REPORT.footerHeightMm, 'F');

  // Dibujar la línea divisoria del footer
  doc.setDrawColor(...COLORS.grayLight);
  doc.setLineWidth(0.3);
  doc.line(
    15,
    pageHeight - REPORT.footerHeightMm,
    pageWidth - 15,
    pageHeight - REPORT.footerHeightMm
  );
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.grayDark);
  doc.text('Generado por Contaflow', 15, pageHeight - REPORT.footerHeightMm + 4);
  doc.text(`Fecha: ${fechaGen}`, 15, pageHeight - REPORT.footerHeightMm + 8);
  doc.text(
    `Página ${pageNum} de ${totalPages}`,
    pageWidth - 15,
    pageHeight - REPORT.footerHeightMm + 6,
    { align: 'right' }
  );
}
