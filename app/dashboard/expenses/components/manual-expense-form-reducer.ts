interface ManualExpenseFormState {
  isSubmitting: boolean;
  error: string;
  selectedProfileId: string;
  fecha: string;
  total: string;
  subtotal: string;
  iva: string;
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
    iva: '',
    concepto: '',
    categoria: '',
  };
}

export type ManualExpenseFormAction =
  | { type: 'dialog_opened'; profileId: string }
  | { type: 'set_error'; message: string }
  | { type: 'set_selected_profile_id'; value: string }
  | { type: 'set_fecha'; value: string }
  | { type: 'set_total'; value: string; subtotal: string; iva: string }
  | { type: 'set_subtotal'; value: string; iva: string; total: string }
  | { type: 'set_iva'; value: string }
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
      return { ...state, total: action.value, subtotal: action.subtotal, iva: action.iva };
    case 'set_subtotal':
      return { ...state, subtotal: action.value, iva: action.iva, total: action.total };
    case 'set_iva':
      return { ...state, iva: action.value };
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
