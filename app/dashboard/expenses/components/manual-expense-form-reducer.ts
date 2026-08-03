import type { ManualEntryIvaRateOption } from '@/lib/utils/manual-entry-iva';

interface ManualExpenseFormState {
  isSubmitting: boolean;
  error: string;
  selectedProfileId: string;
  fecha: string;
  total: string;
  subtotal: string;
  ivaAmount: string;
  ivaRateOption: ManualEntryIvaRateOption;
  concepto: string;
  categoria: string;
}

export function createInitialManualExpenseFormState(profileId: string): ManualExpenseFormState {
  const today = new Date();
  return {
    isSubmitting: false,
    error: '',
    selectedProfileId: profileId,
    fecha: today.toISOString().split('T')[0],
    total: '',
    subtotal: '',
    ivaAmount: '',
    ivaRateOption: '16',
    concepto: '',
    categoria: '',
  };
}

export type ManualExpenseFormAction =
  | { type: 'dialog_opened'; profileId: string }
  | { type: 'set_error'; message: string }
  | { type: 'set_selected_profile_id'; value: string }
  | { type: 'set_fecha'; value: string }
  | { type: 'set_total'; value: string; subtotal: string; ivaAmount: string }
  | { type: 'set_subtotal'; value: string; ivaAmount: string; total: string }
  | {
      type: 'set_iva_rate_option';
      value: ManualEntryIvaRateOption;
      subtotal?: string;
      ivaAmount?: string;
      total?: string;
    }
  | { type: 'set_iva_amount'; value: string; total: string }
  | { type: 'set_concepto'; value: string }
  | { type: 'set_categoria'; value: string }
  | { type: 'submit_start' }
  | { type: 'submit_end' };

export function manualExpenseFormReducer(
  state: ManualExpenseFormState,
  action: ManualExpenseFormAction
): ManualExpenseFormState {
  switch (action.type) {
    case 'dialog_opened':
      return { ...createInitialManualExpenseFormState(action.profileId) };
    case 'set_error':
      return { ...state, error: action.message };
    case 'set_selected_profile_id':
      return { ...state, selectedProfileId: action.value };
    case 'set_fecha':
      return { ...state, fecha: action.value };
    case 'set_total':
      return {
        ...state,
        total: action.value,
        subtotal: action.subtotal,
        ivaAmount: action.ivaAmount,
      };
    case 'set_subtotal':
      return {
        ...state,
        subtotal: action.value,
        ivaAmount: action.ivaAmount,
        total: action.total,
      };
    case 'set_iva_rate_option':
      return {
        ...state,
        ivaRateOption: action.value,
        ...(action.subtotal !== undefined ? { subtotal: action.subtotal } : {}),
        ...(action.ivaAmount !== undefined ? { ivaAmount: action.ivaAmount } : {}),
        ...(action.total !== undefined ? { total: action.total } : {}),
      };
    case 'set_iva_amount':
      return { ...state, ivaAmount: action.value, total: action.total };
    case 'set_concepto':
      return { ...state, concepto: action.value };
    case 'set_categoria':
      return { ...state, categoria: action.value };
    case 'submit_start':
      return { ...state, isSubmitting: true, error: '' };
    case 'submit_end':
      return { ...state, isSubmitting: false };
    default:
      return state;
  }
}
