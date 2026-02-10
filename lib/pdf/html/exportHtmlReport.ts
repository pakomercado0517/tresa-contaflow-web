import { PAGE, REPORT } from '../layout/constants';
import { drawReportFooter } from '../layout/reportHeaderFooter';

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
    ctx.drawImage(source, 0, srcY, source.width, srcHeight, 0, 0, source.width, srcHeight);
  }
  return slice;
}

function getReportSections(root: HTMLElement): HTMLElement[] {
  const sections = Array.from(
    root.querySelectorAll<HTMLElement>('[data-reporte-contenido], [data-reporte-pagina-2]')
  );
  return sections.length > 0 ? sections : [root];
}

const HTML2CANVAS_SCALE = 2;

interface RegimenBounds {
  topPx: number;
  bottomPx: number;
}

/** Obtiene los límites de cada régimen en píxeles del canvas (para evitar cortar en mitad de un régimen). */
function getRegimenBounds(section: HTMLElement, scale: number): RegimenBounds[] {
  const regimenEls = section.querySelectorAll<HTMLElement>('[data-reporte-regimen]');
  if (regimenEls.length === 0) return [];

  const sectionRect = section.getBoundingClientRect();
  const bounds: RegimenBounds[] = [];

  regimenEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const topCss = rect.top - sectionRect.top;
    const bottomCss = rect.bottom - sectionRect.top;
    bounds.push({
      topPx: Math.round(topCss * scale),
      bottomPx: Math.round(bottomCss * scale),
    });
  });

  return bounds;
}

/**
 * Calcula los límites de cada "rebanada" (página) del canvas, respetando los regímenes.
 * Si una rebanada cortaría un régimen por la mitad, termina antes del régimen para que el régimen
 * empiece completo en la siguiente página.
 */
function computeSliceBoundaries(
  canvasHeight: number,
  safeContentHeightPx: number,
  regimenBounds: RegimenBounds[]
): Array<{ srcY: number; srcH: number }> {
  const slices: Array<{ srcY: number; srcH: number }> = [];
  let currentY = 0;

  while (currentY < canvasHeight) {
    const targetEnd = Math.min(currentY + safeContentHeightPx, canvasHeight);
    let sliceEnd = targetEnd;

    // Si hay regímenes, verificar si la rebanada cortaría alguno
    for (const reg of regimenBounds) {
      const wouldCutRegimen = reg.topPx < targetEnd && reg.bottomPx > targetEnd;
      if (wouldCutRegimen && reg.topPx > currentY) {
        sliceEnd = reg.topPx;
        break;
      }
    }

    const srcH = Math.min(sliceEnd - currentY, canvasHeight - currentY);
    if (srcH > 0) {
      slices.push({ srcY: currentY, srcH });
    }
    currentY += srcH;
  }

  return slices;
}

function getFixedSlices(
  canvasHeight: number,
  safeContentHeightPx: number
): Array<{ srcY: number; srcH: number }> {
  const list: Array<{ srcY: number; srcH: number }> = [];
  let y = 0;
  while (y < canvasHeight) {
    const trimTop = list.length > 0 ? 1 : 0;
    const srcY = y + trimTop;
    const srcH = Math.min(safeContentHeightPx, Math.max(0, canvasHeight - srcY));
    if (srcH > 0) list.push({ srcY, srcH });
    y += safeContentHeightPx;
  }
  return list;
}

/**
 * Genera el PDF a partir del elemento. Lógica compartida entre export y exportBlob.
 */
async function buildPdfFromElement(element: HTMLElement) {
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
  const maxContentHeightMm = pageHeight - REPORT.footerHeightMm;
  const contentHeightMm = Math.min(maxContentHeightMm, REPORT.contentHeightMm);
  const safeContentHeightMm = Math.max(1, contentHeightMm);

  const sections = getReportSections(element);
  const regimenBoundsPerSection = sections.map((section) =>
    section.hasAttribute('data-reporte-contenido')
      ? getRegimenBounds(section, HTML2CANVAS_SCALE)
      : []
  );

  const canvases = await Promise.all(
    sections.map((section) =>
      html2canvas(section, {
        scale: HTML2CANVAS_SCALE,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
    )
  );

  const pxPerMm = canvases[0] ? canvases[0].width / pageWidth : 0;
  const contentHeightPx = Math.floor(safeContentHeightMm * pxPerMm);
  const safeContentHeightPx = Math.max(1, contentHeightPx);

  const allSlices: Array<{ canvas: HTMLCanvasElement; srcY: number; srcH: number }> = [];
  for (let c = 0; c < canvases.length; c++) {
    const canvas = canvases[c];
    const regBounds = regimenBoundsPerSection[c] ?? [];
    const slices =
      regBounds.length > 0
        ? computeSliceBoundaries(canvas.height, safeContentHeightPx, regBounds)
        : getFixedSlices(canvas.height, safeContentHeightPx);
    slices.forEach(({ srcY, srcH }) => allSlices.push({ canvas, srcY, srcH }));
  }

  allSlices.forEach(({ canvas, srcY, srcH }, idx) => {
    if (idx > 0) pdf.addPage();

    const slice = sliceCanvas(canvas, srcY, srcH);
    const sliceDataUrl = slice.toDataURL('image/png', 1.0);
    const slicePxPerMm = canvas.width / pageWidth;
    const sliceHeightMm = srcH / slicePxPerMm;
    const actualImageHeight = Math.min(sliceHeightMm, safeContentHeightMm);

    pdf.addImage(sliceDataUrl, 'PNG', 0, 0, pageWidth, actualImageHeight, undefined, 'FAST');
    drawReportFooter(pdf, idx + 1, allSlices.length);
  });

  return pdf;
}

/**
 * Exporta un elemento HTML visible a PDF (ej. reporte mensual).
 * Usa html2canvas-pro (soporta lab/oklch de Tailwind v4).
 *
 * Estrategia:
 * - Regímenes en flujo continuo; solo salto de página si el contenido excede la altura disponible.
 * - Si un régimen no cabe completo, se hace salto antes para que empiece en nueva página.
 */
export async function exportReportElementToPDF(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const pdf = await buildPdfFromElement(element);
  pdf.save(fileName);
}

/**
 * Igual que exportReportElementToPDF pero devuelve un Blob en lugar de descargar.
 * Útil para abrir el PDF en una nueva ventana (ej. para imprimir).
 */
export async function exportReportElementToPDFBlob(element: HTMLElement): Promise<Blob> {
  const pdf = await buildPdfFromElement(element);
  return pdf.output('blob');
}
