import type jsPDF from 'jspdf';
import { COLORS, MARGINS } from './constants';

export function drawHeader(doc: jsPDF, title: string, subtitle?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, 0, pageWidth, MARGINS.header, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, MARGINS.left, 15);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, MARGINS.left, 21);
  }

  return MARGINS.header + 5; // Y inicial del contenido
}
