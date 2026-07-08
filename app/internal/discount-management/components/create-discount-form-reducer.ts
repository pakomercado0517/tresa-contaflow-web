export interface CreateDiscountFormState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  code: string;
  duration: 'once' | 'repeating' | 'forever';
  discountType: 'percent' | 'amount';
  percentOff: string;
  amountOff: string;
  currency: string;
  durationInMonths: string;
  maxRedemptions: string;
  expiresAt: string;
  active: boolean;
  trialDays: string;
  metadataKey: string;
  metadataValue: string;
}

export const initialCreateDiscountFormState: CreateDiscountFormState = {
  isSubmitting: false,
  error: null,
  success: false,
  code: '',
  duration: 'once',
  discountType: 'percent',
  percentOff: '',
  amountOff: '',
  currency: 'MXN',
  durationInMonths: '',
  maxRedemptions: '',
  expiresAt: '',
  active: true,
  trialDays: '',
  metadataKey: '',
  metadataValue: '',
};

export type CreateDiscountFormAction =
  | { type: 'set_field'; field: keyof CreateDiscountFormState; value: CreateDiscountFormState[keyof CreateDiscountFormState] }
  | { type: 'submit_start' }
  | { type: 'submit_success' }
  | { type: 'submit_error'; message: string }
  | { type: 'submit_end' }
  | { type: 'reset_feedback' };

export function createDiscountFormReducer(
  state: CreateDiscountFormState,
  action: CreateDiscountFormAction
): CreateDiscountFormState {
  switch (action.type) {
    case 'set_field':
      return { ...state, [action.field]: action.value };
    case 'submit_start':
      return { ...state, isSubmitting: true, error: null, success: false };
    case 'submit_success':
      return { ...initialCreateDiscountFormState, success: true };
    case 'submit_error':
      return { ...state, isSubmitting: false, error: action.message, success: false };
    case 'submit_end':
      return { ...state, isSubmitting: false };
    case 'reset_feedback':
      return { ...state, error: null, success: false };
    default:
      return state;
  }
}
