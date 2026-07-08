import type { GeneratePublicReportResponse } from '@/lib/types/public-reports';

export interface ShareReportUiState {
  isOpen: boolean;
  expiresInDays: number;
  sendToEmail: string;
  isLoading: boolean;
  error: string | null;
  result: GeneratePublicReportResponse | null;
  hasCopied: boolean;
  isUpgradeModalOpen: boolean;
}

export const initialShareReportUiState: ShareReportUiState = {
  isOpen: false,
  expiresInDays: 30,
  sendToEmail: '',
  isLoading: false,
  error: null,
  result: null,
  hasCopied: false,
  isUpgradeModalOpen: false,
};

export type ShareReportUiAction =
  | { type: 'dialog_open_change'; open: boolean }
  | { type: 'set_expires_in_days'; days: number }
  | { type: 'set_send_to_email'; value: string }
  | { type: 'generate_start' }
  | { type: 'generate_success'; result: GeneratePublicReportResponse }
  | { type: 'generate_limit_error'; message: string }
  | { type: 'generate_open_upgrade' }
  | { type: 'generate_generic_error' }
  | { type: 'generate_end' }
  | { type: 'set_has_copied'; value: boolean }
  | { type: 'close_upgrade_modal' }
  | { type: 'reset_result' };

export function shareReportUiReducer(
  state: ShareReportUiState,
  action: ShareReportUiAction
): ShareReportUiState {
  switch (action.type) {
    case 'dialog_open_change':
      if (action.open) {
        return { ...state, isOpen: true };
      }
      return { ...initialShareReportUiState, isOpen: false };
    case 'set_expires_in_days':
      return { ...state, expiresInDays: action.days };
    case 'set_send_to_email':
      return { ...state, sendToEmail: action.value };
    case 'generate_start':
      return { ...state, isLoading: true, error: null };
    case 'generate_success':
      return { ...state, isLoading: false, result: action.result, error: null };
    case 'generate_limit_error':
      return { ...state, isLoading: false, error: action.message };
    case 'generate_open_upgrade':
      return { ...state, isLoading: false, isUpgradeModalOpen: true };
    case 'generate_generic_error':
      return { ...state, isLoading: false, error: 'No se pudo generar el link. Intenta de nuevo.' };
    case 'generate_end':
      return { ...state, isLoading: false };
    case 'set_has_copied':
      return { ...state, hasCopied: action.value };
    case 'close_upgrade_modal':
      return { ...state, isUpgradeModalOpen: false };
    case 'reset_result':
      return { ...state, result: null, error: null };
    default:
      return state;
  }
}
