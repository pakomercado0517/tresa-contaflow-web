/**
 * Versión actual del tour de onboarding
 * Incrementar esta versión cuando se actualicen los pasos del tour
 * para que los usuarios que ya completaron el tour vean la nueva versión
 */
export const CURRENT_TOUR_VERSION = '3.1.0';

/**
 * Clave para almacenar el estado del tour en localStorage
 */
export const TOUR_LOCALSTORAGE_KEY = 'tour:onboarding';

/**
 * IDs de los tours individuales
 */
export const TOUR_IDS = {
  dashboard: 'dashboardTour',
  invoices: 'invoicesTour',
  expenses: 'expensesTour',
  satSearch: 'satSearchTour',
  certification: 'certificationTour',
} as const;
