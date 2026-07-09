import type { SATProductServiceAttributes, SATPlanInfo } from '@/lib/types/sat';

export interface SatSearchUiState {
  searchQuery: string;
  results: SATProductServiceAttributes[];
  isSearching: boolean;
  aiExplanation: string | undefined;
  confidence: 'high' | 'medium' | 'low' | undefined;
  hasSearched: boolean;
  currentPage: number;
  planInfo: SATPlanInfo | null;
  limitReached: boolean;
  showUpgradeModal: boolean;
  upgradeModalMessage: string;
}

export const initialSatSearchUiState: SatSearchUiState = {
  searchQuery: '',
  results: [],
  isSearching: false,
  aiExplanation: undefined,
  confidence: undefined,
  hasSearched: false,
  currentPage: 1,
  planInfo: null,
  limitReached: false,
  showUpgradeModal: false,
  upgradeModalMessage:
    'La sugerencia inteligente está limitada en tu plan, actualiza para obtener resultados más precisos',
};

export type SatSearchUiAction =
  | { type: 'set_search_query'; value: string }
  | { type: 'plan_info_loaded'; planInfo: SATPlanInfo | null; limitReached: boolean }
  | { type: 'clear_search' }
  | { type: 'search_blocked_show_upgrade'; message: string }
  | { type: 'search_start'; query: string }
  | { type: 'search_limit_reached'; message: string; planInfo?: SATPlanInfo | null }
  | {
      type: 'search_success';
      results: SATProductServiceAttributes[];
      aiExplanation?: string;
      confidence?: 'high' | 'medium' | 'low';
      planInfo?: SATPlanInfo | null;
    }
  | { type: 'search_error' }
  | { type: 'search_end' }
  | { type: 'set_current_page'; page: number }
  | { type: 'close_upgrade_modal' };

export function satSearchUiReducer(
  state: SatSearchUiState,
  action: SatSearchUiAction
): SatSearchUiState {
  switch (action.type) {
    case 'set_search_query':
      return { ...state, searchQuery: action.value };
    case 'plan_info_loaded':
      return { ...state, planInfo: action.planInfo, limitReached: action.limitReached };
    case 'clear_search':
      return {
        ...state,
        results: [],
        hasSearched: false,
        aiExplanation: undefined,
        confidence: undefined,
        currentPage: 1,
      };
    case 'search_blocked_show_upgrade':
      return {
        ...state,
        upgradeModalMessage: action.message,
        showUpgradeModal: true,
      };
    case 'search_start':
      return {
        ...state,
        isSearching: true,
        hasSearched: true,
        searchQuery: action.query,
        currentPage: 1,
      };
    case 'search_limit_reached':
      return {
        ...state,
        isSearching: false,
        limitReached: true,
        upgradeModalMessage: action.message,
        showUpgradeModal: true,
        planInfo: action.planInfo ?? state.planInfo,
      };
    case 'search_success':
      return {
        ...state,
        isSearching: false,
        results: action.results,
        aiExplanation: action.aiExplanation,
        confidence: action.confidence,
        planInfo: action.planInfo ?? state.planInfo,
      };
    case 'search_error':
      return { ...state, isSearching: false, results: [] };
    case 'search_end':
      return { ...state, isSearching: false };
    case 'set_current_page':
      return { ...state, currentPage: action.page };
    case 'close_upgrade_modal':
      return { ...state, showUpgradeModal: false };
    default:
      return state;
  }
}
