import { PAGE, REPORT } from '../layout/constants';
import {
  drawReportHeader,
  drawReportFooter,
  type ExportReportOptions,
} from '../layout/reportHeaderFooter';

/**
 * Recorta una franja horizontal del canvas original.
 */
function sliceCanvas(
  source: HTMLCanvasElement,
  srcY: number,
  srcHeight: number
): HTMLCanvasElement {
  const slice = document.createElement('canvas');
  slice.width = source.width;
  slice.height = srcHeight;
  const ctx = slice.getContext('2d');
  if (ctx) {
    ctx.drawImage(
      source,
      0, srcY, source.width, srcHeight,
      0, 0,  source.width, srcHeight
    );
  }
  return slice;
}

function getReportSections(root: HTMLElement): HTMLElement[] {
  const sections = Array.from(
    root.querySelectorAll<HTMLElement>(
      '[data-reporte-contenido], [data-reporte-pagina-2]'
    )
  );
  return sections.length > 0 ? sections : [root];
}

/**
 * Exporta un elemento HTML visible a PDF (ej. reporte mensual).
 * Usa html2canvas-pro (soporta lab/oklch de Tailwind v4).
 *
 * Estrategia robusta:
 * - Captura por secciones (página 1, página 2, etc.) para evitar que el footer
 *   “se coma” el inicio de la siguiente plantilla por redondeos CSS↔PDF.
 * - Dentro de cada sección, recorta el canvas en rebanadas (una por página PDF)
 *   y coloca cada rebanada únicamente en el área de contenido (entre header/footer).
 */
export async function exportReportElementToPDF(
  element: HTMLElement,
  fileName: string,
  options: ExportReportOptions = {}
): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  const pdf = new jsPDF({
    orientation: PAGE.orientation,
    unit: PAGE.unit,
    format: PAGE.size,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  // Header deshabilitado, solo footer
  const contentHeightMm = pageHeight - REPORT.footerHeightMm;
  const safetyGapMm = 0;
  const safeContentHeightMm = Math.max(1, contentHeightMm - safetyGapMm);

  const sections = getReportSections(element);
  const canvases = await Promise.all(
    sections.map((section) =>
      html2canvas(section, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
    )
  );

  const pagesPerCanvas = canvases.map((canvas) => {
    const pxPerMm = canvas.width / pageWidth;
    // Usar floor evita “pasarnos” y meter pixeles de la siguiente página al final.
    const contentHeightPx = Math.floor(safeContentHeightMm * pxPerMm);
    const safeContentHeightPx = Math.max(1, contentHeightPx);
    return Math.ceil(canvas.height / safeContentHeightPx) || 1;
  });

  const totalPages = pagesPerCanvas.reduce((acc, n) => acc + n, 0) || 1;

  let globalPage = 1;
  for (let c = 0; c < canvases.length; c++) {
    const canvas = canvases[c];
    const pxPerMm = canvas.width / pageWidth;
    const contentHeightPx = Math.floor(safeContentHeightMm * pxPerMm);
    const safeContentHeightPx = Math.max(1, contentHeightPx);
    const canvasPages = pagesPerCanvas[c] ?? 1;

    for (let p = 0; p < canvasPages; p++) {
      if (globalPage > 1) pdf.addPage();

      // Evita “líneas fantasma” duplicadas por redondeos/interpolación entre páginas:
      // recorta 1px del inicio de cada página (excepto la primera) dentro del mismo canvas.
      const trimTopPx = p === 0 ? 0 : 1;
      const srcY = p * safeContentHeightPx + trimTopPx;
      const srcH = Math.min(safeContentHeightPx, Math.max(0, canvas.height - srcY));
      const slice = sliceCanvas(canvas, srcY, srcH);

      const sliceDataUrl = slice.toDataURL('image/png', 1.0);
      const sliceHeightMm = srcH / pxPerMm;

      // La imagen se dibuja EXACTAMENTE en el área de contenido, sin invadir header/footer
      const actualImageHeight = Math.min(sliceHeightMm, safeContentHeightMm);

      // Dibujar la imagen del contenido desde el inicio de la página
      pdf.addImage(
        sliceDataUrl,
        'PNG',
        0,
        0,
        pageWidth,
        actualImageHeight,
        undefined,
        'FAST'
      );

      // Dibujar solo el footer (header deshabilitado)
      drawReportFooter(pdf, globalPage, totalPages);

      globalPage += 1;
    }
  }

  pdf.save(fileName);
}

/**
 * Igual que exportReportElementToPDF pero devuelve un Blob en lugar de descargar.
 * Útil para abrir el PDF en una nueva ventana (ej. para imprimir).
 */
export async function exportReportElementToPDFBlob(
  element: HTMLElement,
  options: ExportReportOptions = {}
): Promise<Blob> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  const pdf = new jsPDF({
    orientation: PAGE.orientation,
    unit: PAGE.unit,
    format: PAGE.size,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  // Header deshabilitado, solo footer
  const contentHeightMm = pageHeight - REPORT.footerHeightMm;
  const safetyGapMm = 0;
  const safeContentHeightMm = Math.max(1, contentHeightMm - safetyGapMm);

  const sections = getReportSections(element);
  const canvases = await Promise.all(
    sections.map((section) =>
      html2canvas(section, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
    )
  );

  const pagesPerCanvas = canvases.map((canvas) => {
    const pxPerMm = canvas.width / pageWidth;
    const contentHeightPx = Math.floor(safeContentHeightMm * pxPerMm);
    const safeContentHeightPx = Math.max(1, contentHeightPx);
    return Math.ceil(canvas.height / safeContentHeightPx) || 1;
  });

  const totalPages = pagesPerCanvas.reduce((acc, n) => acc + n, 0) || 1;

  let globalPage = 1;
  for (let c = 0; c < canvases.length; c++) {
    const canvas = canvases[c];
    const pxPerMm = canvas.width / pageWidth;
    const contentHeightPx = Math.floor(safeContentHeightMm * pxPerMm);
    const safeContentHeightPx = Math.max(1, contentHeightPx);
    const canvasPages = pagesPerCanvas[c] ?? 1;

    for (let p = 0; p < canvasPages; p++) {
      if (globalPage > 1) pdf.addPage();

      const trimTopPx = p === 0 ? 0 : 1;
      const srcY = p * safeContentHeightPx + trimTopPx;
      const srcH = Math.min(safeContentHeightPx, Math.max(0, canvas.height - srcY));
      const slice = sliceCanvas(canvas, srcY, srcH);

      const sliceDataUrl = slice.toDataURL('image/png', 1.0);
      const sliceHeightMm = srcH / pxPerMm;

      const actualImageHeight = Math.min(sliceHeightMm, safeContentHeightMm);

      pdf.addImage(
        sliceDataUrl,
        'PNG',
        0,
        0,
        pageWidth,
        actualImageHeight,
        undefined,
        'FAST'
      );

      drawReportFooter(pdf, globalPage, totalPages);

      globalPage += 1;
    }
  }

  return pdf.output('blob');
}
