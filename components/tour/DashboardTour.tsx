'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NextStep, NextStepProvider, useNextStep } from 'nextstepjs';
import { useTour } from '@/lib/hooks/useTour';
import { TOUR_IDS } from '@/lib/constants/tour';
import type { CardComponentProps, Tour, Step } from 'nextstepjs';
import type { User } from '@/lib/types/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DashboardTourProps {
  children: React.ReactNode;
  user?: User;
}

interface CustomStep extends Step {
  isLastTour?: boolean;
}

// Used to prevent re-starting the same tour between `skipTour()` and `router.push()`.
// This is module-scoped on purpose so `CustomTourCard` and `TourController` can share it.
const navigationPendingRef = { current: false };
const TOUR_COMPLETED_EVENT = 'contafy:tour-complete';
const TOUR_RESET_EVENT = 'contafy:tour-reset';

const tourSteps: Array<Omit<Tour, 'steps'> & { steps: CustomStep[] }> = [
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
        pointerPadding: 10,
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
        pointerPadding: 10,
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
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: '➕',
        title: 'Nueva Factura',
        content:
          'Haz clic aquí para subir una nueva factura XML. El sistema validará automáticamente el archivo antes de procesarlo.',
        selector: "[data-tour='new-invoice-button']",
        side: 'bottom-right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: '📊',
        title: 'Métricas Financieras',
        content:
          'Aquí puedes ver un resumen rápido de tus finanzas: ingresos totales, gastos, utilidad neta, diferencia y total de facturas.',
        selector: "[data-tour='metrics-cashflow']",
        side: 'bottom',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
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
        pointerPadding: 10,
        pointerRadius: 10,
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
        pointerPadding: 10,
        pointerRadius: 10,
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
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: '🧮',
        title: 'Estimación fiscal',
        content:
          'ISR e IVA netos del periodo según régimen. Es orientativo y no reemplaza tu declaración ante el SAT. Para más precisión, completa los datos fiscales del perfil.',
        selector: "[data-tour='tax-estimate-section']",
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
        nextRoute: '/dashboard/invoices',
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
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: '📤',
        title: 'Agregar Ingresos',
        content:
          'Desde este menú puedes agregar ingresos de dos formas: subir archivos XML de facturas (el sistema los valida automáticamente) o registrar un ingreso manual sin comprobante fiscal.',
        selector: "[data-tour='invoices-upload-button']",
        side: 'bottom-right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
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
        pointerPadding: 10,
        pointerRadius: 10,
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
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: '📤',
        title: 'Agregar Gastos',
        content:
          'Desde este menú puedes agregar gastos de dos formas: cargar archivos XML para que el sistema los valide automáticamente, o registrar un gasto manual para viáticos, gastos menores o pagos en efectivo sin comprobante fiscal.',
        selector: "[data-tour='expenses-upload-button']",
        side: 'bottom-right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
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
        pointerPadding: 10,
        pointerRadius: 10,
        nextRoute: '/dashboard/sat-search',
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
          'Utiliza las sugerencias para probar búsquedas populares, acelerar el descubrimiento y experimentar con nuevas descripciones. ¡Felicidades! Has completado el tour completo de Contafy.',
        selector: "[data-tour='sat-search-suggestions']",
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
        isLastTour: true,
      },
    ],
  },
];

function getCurrentStepConfig(tourName: string | null, stepIndex: number): CustomStep | null {
  if (!tourName || stepIndex < 0) return null;
  const activeTour = tourSteps.find((tour) => tour.tour === tourName);
  if (!activeTour) return null;
  return activeTour.steps[stepIndex] ?? null;
}

function isElementOutOfViewport(element: Element, margin = 96): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < margin || rect.bottom > viewportHeight - margin;
}

function shouldAutoScrollToElement(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportCenterY = viewportHeight / 2;
  const elementCenterY = rect.top + rect.height / 2;
  const centerDistance = Math.abs(elementCenterY - viewportCenterY);

  if (isElementOutOfViewport(element)) {
    return true;
  }

  // También forzamos ajuste cuando el objetivo queda muy alejado del centro visual.
  return centerDistance > viewportHeight * 0.18;
}

function syncSpotlightWithElement(step: CustomStep, element: Element): void {
  const rect = element.getBoundingClientRect();
  const pointerPadding = step.pointerPadding ?? 10;
  const pointerRadius = step.pointerRadius ?? 8;

  const holeX = rect.left - pointerPadding + window.scrollX;
  const holeY = rect.top - pointerPadding + window.scrollY;
  const holeWidth = rect.width + pointerPadding * 2;
  const holeHeight = rect.height + pointerPadding * 2;

  const pointer = document.querySelector<HTMLElement>("[data-name='nextstep-pointer']");
  if (pointer) {
    pointer.style.width = `${holeWidth}px`;
    pointer.style.height = `${holeHeight}px`;
    pointer.style.borderRadius = `${pointerRadius}px`;
    pointer.style.transform = `translateX(${holeX}px) translateY(${holeY}px)`;
  }

  const maskRect = document.querySelector<SVGRectElement>(
    '#smooth-spotlight-mask rect[fill="black"]'
  );
  if (maskRect) {
    maskRect.setAttribute('width', `${holeWidth}px`);
    maskRect.setAttribute('height', `${holeHeight}px`);
    maskRect.setAttribute('rx', `${pointerRadius}`);
    maskRect.setAttribute('ry', `${pointerRadius}`);
    maskRect.setAttribute(
      'style',
      `transform: translateX(${holeX}px) translateY(${holeY}px); transform-origin: 50% 50%; transform-box: fill-box;`
    );
  }

  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  );
  const documentWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);

  const clampedTop = Math.max(0, holeY);
  const clampedLeft = Math.max(0, holeX);
  const clampedRight = Math.min(documentWidth, holeX + holeWidth);
  const clampedBottom = Math.min(documentHeight, holeY + holeHeight);

  const overlay = document.querySelector<HTMLElement>("[data-name='nextstep-overlay']");
  const preventOverlay = document.querySelector<HTMLElement>(
    "[data-name='nextstep-prevent-click-overlay']"
  );
  const overlayTop = document.querySelector<HTMLElement>(
    "[data-name='nextstep-prevent-click-overlay-top']"
  );
  const overlayBottom = document.querySelector<HTMLElement>(
    "[data-name='nextstep-prevent-click-overlay-bottom']"
  );
  const overlayLeft = document.querySelector<HTMLElement>(
    "[data-name='nextstep-prevent-click-overlay-left']"
  );
  const overlayRight = document.querySelector<HTMLElement>(
    "[data-name='nextstep-prevent-click-overlay-right']"
  );

  if (overlay) {
    overlay.style.width = `${documentWidth}px`;
    overlay.style.height = `${documentHeight}px`;
  }
  if (preventOverlay) {
    preventOverlay.style.width = `${documentWidth}px`;
    preventOverlay.style.height = `${documentHeight}px`;
  }
  if (overlayTop) {
    overlayTop.style.height = `${clampedTop}px`;
  }
  if (overlayBottom) {
    overlayBottom.style.height = `${Math.max(0, documentHeight - clampedBottom)}px`;
  }
  if (overlayLeft) {
    overlayLeft.style.width = `${clampedLeft}px`;
    overlayLeft.style.height = `${documentHeight}px`;
  }
  if (overlayRight) {
    overlayRight.style.left = `${clampedRight}px`;
    overlayRight.style.height = `${documentHeight}px`;
  }
}

function CustomTourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
}: CardComponentProps & { step: CustomStep }) {
  const router = useRouter();
  const { markTourCompleted } = useTour();
  const { currentTour } = useNextStep();

  const handleNext = async () => {
    const isLastStep = currentStep === totalSteps - 1;

    if (isLastStep) {
      // Si es el último paso, marcar tour como completado
      if (currentTour) {
        try {
          console.debug('[Tour] 🎯 marking tour completed (card)', currentTour, {
            step,
            currentStep,
            totalSteps,
          });
          markTourCompleted(currentTour);
          console.debug('[Tour] ✅ markTourCompleted OK (card)', currentTour);
        } catch (error) {
          console.error('[Tour] ❌ Error al marcar tour como completado:', error);
          // Continuar con la navegación aunque falle la API
        }
      }

      // Si es el último tour completo (satSearchTour), mostrar mensaje de felicitaciones
      if (step.isLastTour) {
        console.debug('[Tour] 🎉 Last tour completed! All tours should be finished now.');
        // Cerrar el overlay y redirigir al dashboard con mensaje de finalización
        setTimeout(() => {
          navigationPendingRef.current = true;
          skipTour?.();
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event(TOUR_COMPLETED_EVENT));
            }
          }, 200);
        }, 1000);
        return;
      }

      // Si es el último paso y tiene nextRoute, navegar
      if (step.nextRoute) {
        try {
          console.debug(
            '[Tour] 📍 nextRoute detected, waiting for localStorage to sync...',
            step.nextRoute
          );
          // ⚠️ IMPORTANTE: Esperar un poco más para asegurar que localStorage se guardó
          // antes de cerrar el overlay y navegar
          setTimeout(() => {
            console.debug('[Tour] 🔄 Closing overlay and navigating...');
            navigationPendingRef.current = true;
            skipTour?.();
            setTimeout(() => {
              router.push(step.nextRoute!);
            }, 300);
          }, 200);
        } catch (e) {
          console.error('[Tour] router.push error:', e);
          // Fallback: cerrar overlay y navegar con delay mayor
          navigationPendingRef.current = true;
          skipTour?.();
          setTimeout(() => router.push(step.nextRoute!), 800);
        }
      } else {
        // Si no hay nextRoute, cerrar el overlay
        skipTour?.();
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
              type="button"
              onClick={skipTour}
              className="text-muted-foreground hover:text-foreground px-3 py-1.5 text-sm transition-colors"
            >
              Omitir
            </button>
          )}
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="bg-muted hover:bg-muted/80 text-foreground rounded-md px-4 py-1.5 text-sm transition-colors"
            >
              Anterior
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-1.5 text-sm transition-colors"
          >
            {currentStep === totalSteps - 1
              ? step.isLastTour
                ? '¡Completar!'
                : 'Finalizar'
              : 'Siguiente'}
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
  const { startNextStep, isNextStepVisible, currentTour, currentStep } = useNextStep();
  const pathname = usePathname();
  const isAuthenticated = Boolean(user);
  const hasStartedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tourStartedRef = useRef<(typeof TOUR_IDS)[keyof typeof TOUR_IDS] | null>(null);
  const lastCheckedUserId = useRef<string | null>(null);
  const lastPathnameRef = useRef(pathname);
  const hasFinishedAllToursRef = useRef(false);
  const isManualRunRef = useRef(false);
  const latestIsCompletedRef = useRef(isCompleted);
  const latestIsTourCompletedRef = useRef(isTourCompleted);

  useEffect(() => {
    if (!user || user.id === lastCheckedUserId.current) {
      return;
    }
    lastCheckedUserId.current = user.id;
    checkTourStatus(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, checkTourStatus]);

  useEffect(() => {
    latestIsCompletedRef.current = isCompleted;
    latestIsTourCompletedRef.current = isTourCompleted;
  }, [isCompleted, isTourCompleted]);

  useEffect(() => {
    if (!isCompleted) return;
    if (!isManualRunRef.current) {
      hasFinishedAllToursRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      hasStartedRef.current = false;
      tourStartedRef.current = null;
    }
  }, [isCompleted]);

  useEffect(() => {
    const handleReset = () => {
      lastCheckedUserId.current = null;
      isManualRunRef.current = true;
      hasFinishedAllToursRef.current = false;
      hasStartedRef.current = false;
      tourStartedRef.current = null;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleCompleted = () => {
      hasFinishedAllToursRef.current = true;
      isManualRunRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      hasStartedRef.current = false;
      tourStartedRef.current = null;
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(TOUR_RESET_EVENT, handleReset);
      window.addEventListener(TOUR_COMPLETED_EVENT, handleCompleted);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(TOUR_RESET_EVENT, handleReset);
        window.removeEventListener(TOUR_COMPLETED_EVENT, handleCompleted);
      }
    };
  }, []);

  // Debug: mostrar estado de todos los tours cada 5 segundos
  useEffect(() => {
    const debugInterval = setInterval(() => {
      const allTours = Object.values(TOUR_IDS);
      const completedStatus = allTours.map((tour) => ({
        tour,
        completed: isTourCompleted(tour),
      }));
      console.debug('[Tour Debug] Current tour status:', {
        currentPath: pathname,
        currentTour,
        isNextStepVisible,
        completedStatus,
        allCompleted: allTours.every((t) => isTourCompleted(t)),
        isCompleted,
        isRunning,
      });
    }, 5000);

    return () => clearInterval(debugInterval);
  }, [pathname, currentTour, isNextStepVisible, isTourCompleted, isCompleted, isRunning]);

  useEffect(() => {
    // Limpiar timer si el componente se desmonta
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Iniciar el tour automáticamente solo una vez si no se ha completado
    // Solo iniciar en el dashboard y después de verificar el estado
    const canStartDashboardTour =
      isAuthenticated &&
      !isLoading &&
      (!isCompleted || isManualRunRef.current) &&
      !isRunning &&
      !isNextStepVisible &&
      !hasStartedRef.current &&
      currentTour === null &&
      pathname === '/dashboard' &&
      tourStartedRef.current !== TOUR_IDS.dashboard &&
      !isManualRunRef.current &&
      !isTourCompleted(TOUR_IDS.dashboard);

    if (
      canStartDashboardTour ||
      (isManualRunRef.current &&
        isAuthenticated &&
        !isLoading &&
        !isRunning &&
        !isNextStepVisible &&
        !hasStartedRef.current &&
        currentTour === null &&
        pathname === '/dashboard' &&
        tourStartedRef.current !== TOUR_IDS.dashboard)
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
        // Verificar que los elementos necesarios estén en el DOM
        const sidebarElement = document.querySelector("[data-tour='sidebar']");
        if (!sidebarElement) {
          console.warn('[Tour] Sidebar element not found, retrying...');
          // Reintentar después de un breve delay
          setTimeout(() => {
            if (!isTourCompleted(TOUR_IDS.dashboard) && currentTour === null) {
              startTour();
              startNextStep(TOUR_IDS.dashboard);
            }
          }, 500);
          return;
        }

        // Verificar nuevamente antes de iniciar (por si acaso)
        if (
          !hasFinishedAllToursRef.current &&
          (!latestIsCompletedRef.current || isManualRunRef.current) &&
          !isManualRunRef.current &&
          !latestIsTourCompletedRef.current(TOUR_IDS.dashboard) &&
          currentTour === null
        ) {
          console.debug('[Tour] Starting dashboard tour with DOM ready');
          startTour();
          startNextStep(TOUR_IDS.dashboard);
        } else {
          // Si ya se completó o hay un tour activo, resetear flags
          hasStartedRef.current = false;
          tourStartedRef.current = null;
        }
      }, 1500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    isAuthenticated,
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

  // Detectar cuando el tour se completa (cuando se cierra y estaba corriendo)
  // Nota: esto cubre casos donde el usuario cierra/omite el tour (no solo "Finalizar").
  useEffect(() => {
    if (isNextStepVisible === false && isRunning && currentTour === null && hasStartedRef.current) {
      if (tourStartedRef.current) {
        console.debug(
          '[TourController] detected tour closed, marking completed:',
          tourStartedRef.current,
          { pathname }
        );
        console.log(
          '[TourController] Marcando tour como completado (cierre detectado):',
          tourStartedRef.current
        );

        // Marcar el tour individual como completado
        markTourCompleted(tourStartedRef.current);
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Si estamos en medio de una navegación disparada por el tour (nextRoute),
      // NO reseteamos todavía: eso podría re-iniciar el tour en la ruta actual.
      if (!navigationPendingRef.current) {
        hasStartedRef.current = false;
        tourStartedRef.current = null;
      }
    }
  }, [isNextStepVisible, isRunning, currentTour, markTourCompleted, pathname]);

  useEffect(() => {
    if (!isNextStepVisible || !currentTour) return;

    const stepConfig = getCurrentStepConfig(currentTour, currentStep);
    const selector = stepConfig?.selector;
    if (!selector) return;

    const scrollToCurrentStep = () => {
      const targetElement = document.querySelector(selector);
      if (!targetElement) return;

      const shouldForceDashboardEndScroll =
        pathname === '/dashboard' &&
        (selector === "[data-tour='tax-estimate-section']" ||
          selector === "[data-tour='recent-invoices']" ||
          selector === "[data-tour='recent-expenses']");

      if (shouldForceDashboardEndScroll || shouldAutoScrollToElement(targetElement)) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    };

    const timer = window.setTimeout(scrollToCurrentStep, 120);
    return () => window.clearTimeout(timer);
  }, [isNextStepVisible, currentTour, currentStep, pathname]);

  useEffect(() => {
    if (!isNextStepVisible || !currentTour) return;

    let rafId: number | null = null;

    const syncCurrentStep = () => {
      const stepConfig = getCurrentStepConfig(currentTour, currentStep);
      const selector = stepConfig?.selector;
      if (!stepConfig || !selector) return;

      const targetElement = document.querySelector(selector);
      if (!targetElement) return;

      syncSpotlightWithElement(stepConfig, targetElement);
    };

    const onViewportChange = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(syncCurrentStep);
    };

    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange);
    syncCurrentStep();

    return () => {
      window.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('resize', onViewportChange);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [isNextStepVisible, currentTour, currentStep, pathname]);

  // La navegación se maneja en CustomTourCard cuando se hace clic en "Finalizar"

  // Detectar cambios de ruta para iniciar tours específicos
  useEffect(() => {
    // Si acabamos de cambiar de ruta por un nextRoute, ahora sí podemos resetear
    // los flags para permitir el inicio del siguiente tour.
    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname;
      if (navigationPendingRef.current) {
        navigationPendingRef.current = false;
        hasStartedRef.current = false;
        tourStartedRef.current = null;
      }
    }

    if (
      !isAuthenticated ||
      isLoading ||
      (isCompleted && !isManualRunRef.current) ||
      hasFinishedAllToursRef.current
    ) {
      return;
    }

    // Si estamos en invoices y no hay tour activo y no se ha completado, iniciar el tour
    if (
      pathname === '/dashboard/invoices' &&
      !isNextStepVisible &&
      (currentTour === null || isManualRunRef.current) &&
      !hasStartedRef.current &&
      tourStartedRef.current !== TOUR_IDS.invoices &&
      !isTourCompleted(TOUR_IDS.invoices)
    ) {
      hasStartedRef.current = true;
      tourStartedRef.current = TOUR_IDS.invoices;
      timerRef.current = setTimeout(() => {
        if (
          !hasFinishedAllToursRef.current &&
          (!latestIsCompletedRef.current || isManualRunRef.current) &&
          (isManualRunRef.current || !latestIsTourCompletedRef.current(TOUR_IDS.invoices)) &&
          (currentTour === null || isManualRunRef.current)
        ) {
          console.debug('[Tour] Starting invoices tour');
          startTour();
          startNextStep(TOUR_IDS.invoices);
        }
      }, 1500);
    }

    // Si estamos en expenses y no hay tour activo y no se ha completado, iniciar el tour
    if (
      pathname === '/dashboard/expenses' &&
      !isNextStepVisible &&
      (currentTour === null || isManualRunRef.current) &&
      !hasStartedRef.current &&
      tourStartedRef.current !== TOUR_IDS.expenses &&
      !isTourCompleted(TOUR_IDS.expenses)
    ) {
      hasStartedRef.current = true;
      tourStartedRef.current = TOUR_IDS.expenses;
      timerRef.current = setTimeout(() => {
        if (
          !hasFinishedAllToursRef.current &&
          (!latestIsCompletedRef.current || isManualRunRef.current) &&
          (isManualRunRef.current || !latestIsTourCompletedRef.current(TOUR_IDS.expenses)) &&
          (currentTour === null || isManualRunRef.current)
        ) {
          console.debug('[Tour] Starting expenses tour');
          startTour();
          startNextStep(TOUR_IDS.expenses);
        }
      }, 1500);
    }

    // Si estamos en certification y no hay tour activo y no se ha completado, iniciar el tour
    if (
      pathname === '/dashboard/sat-search' &&
      !isNextStepVisible &&
      (currentTour === null || isManualRunRef.current) &&
      !hasStartedRef.current &&
      tourStartedRef.current !== TOUR_IDS.satSearch &&
      !isTourCompleted(TOUR_IDS.satSearch)
    ) {
      hasStartedRef.current = true;
      tourStartedRef.current = TOUR_IDS.satSearch;
      timerRef.current = setTimeout(() => {
        if (
          !hasFinishedAllToursRef.current &&
          (!latestIsCompletedRef.current || isManualRunRef.current) &&
          (isManualRunRef.current || !latestIsTourCompletedRef.current(TOUR_IDS.satSearch)) &&
          (currentTour === null || isManualRunRef.current)
        ) {
          console.debug('[Tour] Starting SAT search tour');
          startTour();
          startNextStep(TOUR_IDS.satSearch);
        }
      }, 1500);
    }

    if (
      pathname === '/dashboard/certification' &&
      !isNextStepVisible &&
      (currentTour === null || isManualRunRef.current) &&
      !hasStartedRef.current &&
      tourStartedRef.current !== TOUR_IDS.certification &&
      !isTourCompleted(TOUR_IDS.certification)
    ) {
      hasStartedRef.current = true;
      tourStartedRef.current = TOUR_IDS.certification;
      timerRef.current = setTimeout(() => {
        if (
          !hasFinishedAllToursRef.current &&
          (!latestIsCompletedRef.current || isManualRunRef.current) &&
          (isManualRunRef.current || !latestIsTourCompletedRef.current(TOUR_IDS.certification)) &&
          (currentTour === null || isManualRunRef.current)
        ) {
          console.debug('[Tour] Starting certification tour');
          startTour();
          startNextStep(TOUR_IDS.certification);
        }
      }, 1500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    isAuthenticated,
    isLoading,
    isCompleted,
    pathname,
    isNextStepVisible,
    currentTour,
    startTour,
    startNextStep,
    isTourCompleted,
  ]);

  return null;
}

export function DashboardTour({ children, user }: DashboardTourProps) {
  const router = useRouter();
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const shouldRedirectRef = useRef(false);

  useEffect(() => {
    const handleCompleted = () => {
      shouldRedirectRef.current = true;
      setIsCompletionDialogOpen(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(TOUR_COMPLETED_EVENT, handleCompleted);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(TOUR_COMPLETED_EVENT, handleCompleted);
      }
    };
  }, []);

  const handleDialogChange = (open: boolean) => {
    setIsCompletionDialogOpen(open);
    if (!open && shouldRedirectRef.current) {
      shouldRedirectRef.current = false;
      router.push('/dashboard');
    }
  };

  const handleGoToDashboard = () => {
    shouldRedirectRef.current = false;
    setIsCompletionDialogOpen(false);
    router.push('/dashboard');
  };

  return (
    <NextStepProvider>
      <NextStep
        steps={tourSteps}
        cardComponent={CustomTourCard}
        shadowRgb="0, 0, 0"
        shadowOpacity="0.85"
        clickThroughOverlay={false}
      >
        <TourController user={user} />
        {children}
      </NextStep>
      <Dialog open={isCompletionDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Terminaste el tour!</DialogTitle>
            <DialogDescription>
              Bienvenido a Contafy. Ya conoces los pasos esenciales para empezar a usar la
              plataforma.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleGoToDashboard}>Ir al dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NextStepProvider>
  );
}
