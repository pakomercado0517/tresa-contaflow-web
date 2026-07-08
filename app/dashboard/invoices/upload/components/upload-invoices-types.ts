import type { ValidationState } from '@/lib/types/invoices';

export interface QueuedInvoiceFile {
  id: string;
  file: File;
  status: 'pending' | 'valid' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  size: number;
  type?: string;
  validacion?: ValidationState;
  complementViewHref?: string;
  duplicateListHref?: string;
}

/** @deprecated Use QueuedInvoiceFile */
export type QueuedFile = QueuedInvoiceFile;
