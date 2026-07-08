import type { ValidationState } from '@/lib/types/expenses';

export interface QueuedExpenseFile {
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

/** @deprecated Use QueuedExpenseFile — kept for gradual import updates */
export type QueuedFile = QueuedExpenseFile;
