import { toast } from 'sonner';
import { exportReportElementToPDFBlob } from './html/exportHtmlReport';

export interface ShareReportPdfOptions {
  element: HTMLElement;
  fileName: string;
  title: string;
  text: string;
  /** URL del preview; en fallback se copia al portapapeles si está disponible */
  shareUrl?: string;
}

export type ShareReportPdfResult =
  | { method: 'native-file' }
  | { method: 'download-fallback'; linkCopied: boolean }
  | { method: 'aborted' };

/** Espera al DOM estable antes de capturar el reporte (html2canvas). */
export async function prepareReportElementForCapture(element: HTMLElement): Promise<void> {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await new Promise((resolve) => setTimeout(resolve, 300));
  element.scrollIntoView({ behavior: 'instant', block: 'start' });
  await new Promise((resolve) => setTimeout(resolve, 200));
}

function downloadPdfBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyShareUrl(shareUrl: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch {
    return false;
  }
}

function notifyDownloadFallback(linkCopied: boolean): void {
  if (linkCopied) {
    toast.success('PDF descargado', {
      description:
        'Se copió el enlace del reporte. Adjunta el archivo descargado en WhatsApp, correo u otra app.',
    });
    return;
  }

  toast.success('PDF descargado', {
    description: 'Adjunta el archivo descargado en WhatsApp, correo u otra app.',
  });
}

/**
 * Comparte el reporte como PDF (Web Share API con archivo) o descarga + aviso en escritorio.
 */
export async function shareReportPdf(
  options: ShareReportPdfOptions
): Promise<ShareReportPdfResult> {
  const { element, fileName, title, text, shareUrl } = options;

  const pdfBlob = await exportReportElementToPDFBlob(element);
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  const sharePayload: ShareData = { title, text, files: [pdfFile] };

  if (typeof navigator.share === 'function') {
    const canShareFiles =
      typeof navigator.canShare === 'function' && navigator.canShare(sharePayload);

    if (canShareFiles) {
      try {
        await navigator.share(sharePayload);
        return { method: 'native-file' };
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return { method: 'aborted' };
        }
        throw error;
      }
    }
  }

  downloadPdfBlob(pdfBlob, fileName);
  const linkCopied = shareUrl ? await copyShareUrl(shareUrl) : false;
  notifyDownloadFallback(linkCopied);

  return { method: 'download-fallback', linkCopied };
}
