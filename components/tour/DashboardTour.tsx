'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NextStepProvider, NextStepReact, useNextStep } from 'nextstepjs';
import { useTour } from '@/lib/hooks/useTour';
import { TOUR_IDS } from '@/lib/constants/tour';
import type { CardComponentProps, Tour } from 'nextstepjs';
import type { User } from '@/lib/types/auth';

interface DashboardTourProps {
  children: React.ReactNode;
  user?: User;
}

const tourSteps: Tour[] = [
  {
    tour: 'dashboardTour',
    steps: [
      {
        icon: '🧭',
        title: 'Navegación Principal',
        content:
          'Desde aquí puedes acceder a todas las secciones: Dashboard, Facturas (Ingresos), Gastos (Egresos) y Obtener CSF (guía para obtener tu Constancia de Situación Fiscal del SAT).',
        selector: "[data-tour='sidebar']",
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
        nextRoute: "/dashboard/sat-search",
      },
      {
        icon: '⚙️',
        title: 'Configuración',
        content:
          'Haz clic en el icono de configuración para acceder a la gestión de perfiles (RFCs), tu cuenta personal y suscripciones. Aquí puedes agregar nuevas empresas, editar información personal y administrar tu plan.',
        selector: "[data-tour='settings-button']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '📅',
        title: 'Filtros de Fecha',
        content:
          'Selecciona el mes y año para ver las métricas y datos de ese período específico. Los datos se actualizarán automáticamente.',
        selector: "[data-tour='date-filters']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '🏢',
        title: 'Selector de Empresa',
        content:
          'Si gestionas múltiples empresas (RFCs), aquí puedes seleccionar cuál ver. También puedes ver todas las empresas juntas.',
        selector: "[data-tour='profile-selector']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '➕',
        title: 'Nueva Factura',
        content:
          'Haz clic aquí para subir una nueva factura XML. El sistema validará automáticamente el archivo antes de procesarlo.',
        selector: "[data-tour='new-invoice-button']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '📊',
        title: 'Métricas Financieras',
        content:
          'Aquí puedes ver un resumen rápido de tus finanzas: ingresos totales, gastos, utilidad neta, diferencia y total de facturas.',
        selector: "[data-tour='metrics-cards']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '📈',
        title: 'Gráfico de Tendencias',
        content:
          'Visualiza la tendencia de tus ingresos y gastos a lo largo del tiempo. Esto te ayuda a identificar patrones y tomar mejores decisiones.',
        selector: "[data-tour='trend-chart']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '📄',
        title: 'Facturas Recientes',
        content:
          "Aquí puedes ver tus últimas facturas de ingresos. Haz clic en 'Ver todos' para acceder a la lista completa y gestionar todas tus facturas.",
        selector: "[data-tour='recent-invoices']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '💸',
        title: 'Gastos Recientes',
        content:
          'Revisa tus últimos gastos registrados. El sistema valida automáticamente cada gasto y muestra su estado de validación.',
        selector: "[data-tour='recent-expenses']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
        nextRoute: '/dashboard/invoices',
      },
    ],
  },
  {
    tour: 'certificationTour',
    steps: [
      {
        icon: '🏢',
        title: 'Constancia de Situación Fiscal',
        content:
          'Esta guía te ayudará a obtener tu Constancia de Situación Fiscal (CSF) del SAT. Es un trámite importante para muchas empresas.',
        selector: "[data-tour='certification-hero']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '📋',
        title: 'Pasos para obtener tu CSF',
        content:
          'Sigue estos 3 pasos para navegar el portal del SAT: prepara tus credenciales (RFC y e.firma), navega a Trámites, y genera tu PDF.',
        selector: "[data-tour='certification-steps']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '🔗',
        title: 'Acceso al portal del SAT',
        content:
          "Haz clic en el botón 'Ir al portal del SAT' para dirigirte directamente a la plataforma oficial donde podrás completar el trámite.",
        selector: "[data-tour='certification-cta']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
    ],
  },
  {
    tour: 'invoicesTour',
    steps: [
      {
        icon: '🏢',
        title: 'Selector de Perfiles (RFCs)',
        content:
          "Selecciona el perfil (RFC) de la empresa para ver las facturas de esa empresa específica. También puedes ver todas las empresas juntas seleccionando 'Todas las empresas'.",
        selector: "[data-tour='invoices-profile-selector']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '📤',
        title: 'Cargar Facturas',
        content:
          'Haz clic aquí para subir archivos XML de facturas. Puedes subir múltiples archivos a la vez y el sistema los validará automáticamente antes de procesarlos.',
        selector: "[data-tour='invoices-upload-button']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '📋',
        title: 'Tabla de Facturas',
        content:
          'Aquí puedes ver todas tus facturas con información detallada: UUID, fecha, emisor, receptor, total y tipo. Puedes filtrar, buscar y exportar los datos según tus necesidades.',
        selector: "[data-tour='invoices-table']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
        nextRoute: '/dashboard/expenses',
      },
    ],
  },
  {
    tour: 'expensesTour',
    steps: [
      {
        icon: '💸',
        title: 'Gestión de Gastos',
        content:
          'Esta sección es similar a Facturas (Ingresos), pero con una característica adicional: puedes agregar gastos manualmente además de cargar archivos XML. Esto es útil para registrar gastos que no tienen comprobante fiscal digital.',
        selector: "[data-tour='expenses-profile-selector']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '✍️',
        title: 'Gasto Manual',
        content:
          'Haz clic aquí para agregar un gasto manualmente. Útil para registrar gastos sin comprobante XML, como viáticos, gastos menores o pagos en efectivo.',
        selector: "[data-tour='expenses-manual-button']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '📤',
        title: 'Cargar Gastos XML',
        content:
          'Similar a las facturas, puedes subir archivos XML de gastos para que el sistema los valide y procese automáticamente.',
        selector: "[data-tour='expenses-upload-button']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '📋',
        title: 'Tabla de Gastos',
        content:
          'Aquí puedes ver todos tus gastos, tanto los cargados desde XML como los agregados manualmente. La tabla muestra el origen de cada gasto para que puedas identificarlos fácilmente.',
        selector: "[data-tour='expenses-table']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
        nextRoute: '/dashboard/certification',
      },
    ],
  },
  {
    tour: 'satSearchTour',
    steps: [
      {
        icon: '🛰️',
        title: 'Buscador SAT asistido',
        content:
          'La ruta /dashboard/sat-search combina IA y datos del catálogo SAT para que encuentres la clave correcta sin adivinar.',
        selector: "[data-tour='sat-search-hero']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '🔍',
        title: 'Describe tu actividad',
        content:
          'La barra de búsqueda con IA procesa tu texto natural, limita los resultados según el plan y presenta las claves más relevantes.',
        selector: "[data-tour='sat-search-bar']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '⚖️',
        title: 'Límites de tu plan',
        content:
          'Aquí ves tu plan activo, cuántas búsquedas inteligentes quedan y cuándo necesitas mejorar para seguir usando IA.',
        selector: "[data-tour='sat-search-plan-limit']",
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: '💡',
        title: 'Sugerencias rápidas',
        content:
          'Utiliza las sugerencias para probar búsquedas populares, acelerar el descubrimiento y experimentar con nuevas descripciones.',
        selector: "[data-tour='sat-search-suggestions']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
    ],
  },
];

function CustomTourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
}: CardComponentProps) {
  const router = useRouter();
  const { markTourCompleted } = useTour();
  const { currentTour } = useNextStep();

  const handleNext = async () => {
    const isLastStep = currentStep === totalSteps - 1;

    if (isLastStep && step.nextRoute) {
      // Si es el último paso y tiene nextRoute, marcar como completado y navegar
      if (currentTour) {
        try {
          console.debug("[Tour] marking tour completed (card)", currentTour, { step, currentStep });
          await markTourCompleted(currentTour);
          console.debug("[Tour] markTourCompleted OK (card)", currentTour);
        } catch (error) {
          console.error('Error al marcar tour como completado:', error);
          // Continuar con la navegación aunque falle la API
        }
      }
      // Navegar a la siguiente ruta; no forzar el cierre del overlay aquí
      try {
        console.debug("[Tour] navigating to nextRoute", step.nextRoute);
        router.push(step.nextRoute!);
      } catch (e) {
        console.error("[Tour] router.push error:", e);
        // Fallback: cerrar overlay y navegar con delay
        skipTour?.();
        setTimeout(() => router.push(step.nextRoute!), 600);
      }
    } else {
      // Comportamiento normal
      nextStep?.();
    }
  };

  return (
    <div className="bg-card border-border w-full max-w-sm rounded-lg border p-6 shadow-lg">
      <div className="mb-4 flex items-start gap-4">
        <div className="text-3xl">{step.icon}</div>
        <div className="flex-1">
          <h3 className="text-foreground mb-2 text-lg font-semibold">{step.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{step.content}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-xs">
          Paso {currentStep + 1} de {totalSteps}
        </div>
        <div className="flex items-center gap-2">
          {step.showSkip && (
            <button
              onClick={skipTour}
              className="text-muted-foreground hover:text-foreground px-3 py-1.5 text-sm transition-colors"
            >
              Omitir
            </button>
          )}
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="bg-muted hover:bg-muted/80 text-foreground rounded-md px-4 py-1.5 text-sm transition-colors"
            >
              Anterior
            </button>
          )}
          <button
            onClick={handleNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-1.5 text-sm transition-colors"
          >
            {currentStep === totalSteps - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TourController({ user }: { user?: User }) {
  const {
    isCompleted,
    isRunning,
    isLoading,
    startTour,
    isTourCompleted,
    markTourCompleted,
    checkTourStatus,
  } = useTour();
  const { startNextStep, isNextStepVisible, currentTour } = useNextStep();
  const pathname = usePathname();
  const hasStartedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tourStartedRef = useRef<(typeof TOUR_IDS)[keyof typeof TOUR_IDS] | null>(null);
  const navigationInProgressRef = useRef(false);
  const hasCheckedStatusRef = useRef(false);

  useEffect(() => {
    // Limpiar timer si el componente se desmonta
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Verificar estado del tour cuando se recibe el usuario
  useEffect(() => {
    if (user && !hasCheckedStatusRef.current) {
      checkTourStatus(user);
      hasCheckedStatusRef.current = true;
    }
  }, [user, checkTourStatus]);

  useEffect(() => {
    // Iniciar el tour automáticamente solo una vez si no se ha completado
    // Solo iniciar en el dashboard y después de verificar el estado
    if (
      !isLoading &&
      !isCompleted &&
      !isRunning &&
      !isNextStepVisible &&
      !hasStartedRef.current &&
      currentTour === null &&
      pathname === '/dashboard' &&
      tourStartedRef.current !== TOUR_IDS.dashboard &&
      !isTourCompleted(TOUR_IDS.dashboard)
    ) {
      // Limpiar cualquier timer anterior
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Marcar como iniciado inmediatamente para evitar múltiples ejecuciones
      hasStartedRef.current = true;
      tourStartedRef.current = TOUR_IDS.dashboard;

      // Esperar un poco para que el DOM esté listo
      timerRef.current = setTimeout(() => {
        // Verificar nuevamente antes de iniciar (por si acaso)
        if (!isTourCompleted(TOUR_IDS.dashboard) && currentTour === null) {
          startTour();
          startNextStep(TOUR_IDS.dashboard);
        } else {
          // Si ya se completó o hay un tour activo, resetear flags
          hasStartedRef.current = false;
          tourStartedRef.current = null;
        }
      }, 1000);
    }
  }, [
    isLoading,
    isCompleted,
    isRunning,
    isNextStepVisible,
    currentTour,
    pathname,
    startTour,
    startNextStep,
    isTourCompleted,
  ]);

  useEffect(() => {
    // Detectar cuando el tour se completa (cuando se cierra y estaba corriendo)
    // Solo marcar como completado si no hay navegación en progreso
    if (
      isNextStepVisible === false &&
      isRunning &&
      currentTour === null &&
      hasStartedRef.current &&
      !navigationInProgressRef.current
    ) {
      // Si es el último tour (sat-search), marcar todo como completado en la API
      if (tourStartedRef.current === TOUR_IDS.satSearch) {
        // markTourCompleted ya llama a completeTour cuando se completan todos los tours
        markTourCompleted(tourStartedRef.current).catch((error) => {
          console.error('Error al marcar tour como completado:', error);
        });
      } else if (tourStartedRef.current) {
        // Para otros tours, solo marcar el tour individual como completado
        // (la navegación ya lo hizo en CustomTourCard cuando se hace clic en "Finalizar")
        // Pero si se cierra de otra forma (skip), también marcarlo aquí
        markTourCompleted(tourStartedRef.current).catch((error) => {
          console.error('Error al marcar tour como completado:', error);
        });
      }
      hasStartedRef.current = false;
      tourStartedRef.current = null;
    }
  }, [isNextStepVisible, isRunning, currentTour, markTourCompleted]);

  // La navegación se maneja en CustomTourCard cuando se hace clic en "Finalizar"

  // Detectar cambios de ruta para iniciar tours específicos
  useEffect(() => {
    // Si estamos en invoices y no hay tour activo y no se ha completado, iniciar el tour
    if (
      pathname === '/dashboard/invoices' &&
      !isNextStepVisible &&
      currentTour === null &&
      !hasStartedRef.current &&
      tourStartedRef.current !== TOUR_IDS.invoices &&
      !isTourCompleted(TOUR_IDS.invoices) &&
      !navigationInProgressRef.current
    ) {
      hasStartedRef.current = true;
      tourStartedRef.current = TOUR_IDS.invoices;
      timerRef.current = setTimeout(() => {
        startTour();
        startNextStep(TOUR_IDS.invoices);
      }, 1000);
    }

    // Si estamos en expenses y no hay tour activo y no se ha completado, iniciar el tour
    if (
      pathname === '/dashboard/expenses' &&
      !isNextStepVisible &&
      currentTour === null &&
      !hasStartedRef.current &&
      tourStartedRef.current !== TOUR_IDS.expenses &&
      !isTourCompleted(TOUR_IDS.expenses) &&
      !navigationInProgressRef.current
    ) {
      hasStartedRef.current = true;
      tourStartedRef.current = TOUR_IDS.expenses;
      timerRef.current = setTimeout(() => {
        startTour();
        startNextStep(TOUR_IDS.expenses);
      }, 1000);
    }

    // Si estamos en certification y no hay tour activo y no se ha completado, iniciar el tour
    if (
      pathname === '/dashboard/certification' &&
      !isNextStepVisible &&
      currentTour === null &&
      !hasStartedRef.current &&
      tourStartedRef.current !== TOUR_IDS.certification &&
      !isTourCompleted(TOUR_IDS.certification) &&
      !navigationInProgressRef.current
    ) {
      hasStartedRef.current = true;
      tourStartedRef.current = TOUR_IDS.certification;
      timerRef.current = setTimeout(() => {
        startTour();
        startNextStep(TOUR_IDS.certification);
      }, 1000);
    }

    // Si llegamos al buscador SAT, iniciamos el tour que muestra la IA y límites de plan
    if (
      pathname === '/dashboard/sat-search' &&
      !isNextStepVisible &&
      currentTour === null &&
      !hasStartedRef.current &&
      tourStartedRef.current !== TOUR_IDS.satSearch &&
      !isTourCompleted(TOUR_IDS.satSearch) &&
      !navigationInProgressRef.current
    ) {
      hasStartedRef.current = true;
      tourStartedRef.current = TOUR_IDS.satSearch;
      timerRef.current = setTimeout(() => {
        startTour();
        startNextStep(TOUR_IDS.satSearch);
      }, 1000);
    }
  }, [pathname, isNextStepVisible, currentTour, startTour, startNextStep, isTourCompleted]);

  useEffect(() => {
    // Si la ruta cambia y hay un tour activo, es una navegacion controlada por el tour.
    // Evita que el tour se "autocomplemente" y se reinicien flags al montar la nueva pagina.
    navigationInProgressRef.current = currentTour !== null;
  }, [currentTour]);

  return null;
}

export function DashboardTour({ children, user }: DashboardTourProps) {
  return (
    <NextStepProvider>
      <NextStepReact
        steps={tourSteps}
        cardComponent={CustomTourCard}
        shadowRgb="0, 0, 0"
        shadowOpacity="0.5"
        clickThroughOverlay={false}
      >
        <TourController user={user} />
        {children}
      </NextStepReact>
    </NextStepProvider>
  );
}
