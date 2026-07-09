'use client';

import { useState, useCallback } from 'react';
import { CURRENT_TOUR_VERSION, TOUR_LOCALSTORAGE_KEY, TOUR_IDS } from '@/lib/constants/tour';
import { completeTour } from '@/lib/api/auth';
import type { User } from '@/lib/types/auth';

interface CachedTour {
  version: string;
  completed: boolean;
  completedAt: string;
}

interface UseTourReturn {
  isCompleted: boolean;
  isRunning: boolean;
  isLoading: boolean;
  startTour: () => void;
  completeTour: () => Promise<void>;
  resetTour: () => void;
  isTourCompleted: (tourName: string) => boolean;
  markTourCompleted: (tourName: string) => void;
  checkTourStatus: (user: User | null) => void;
}

function getCachedTour(): CachedTour | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(TOUR_LOCALSTORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function getInitialCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  const cached = getCachedTour();
  if (cached && cached.version === CURRENT_TOUR_VERSION && cached.completed) {
    return true;
  }
  return false;
}

function getInitialIsLoading(): boolean {
  if (typeof window === 'undefined') return false;
  if (getInitialCompleted()) return false;
  const completedTours = getCompletedTours();
  if (completedTours.length > 0) return false;
  return true;
}

function getCompletedTours(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(TOUR_LOCALSTORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (parsed.completedTours && Array.isArray(parsed.completedTours)) {
      return parsed.completedTours;
    }
    if (parsed.version === CURRENT_TOUR_VERSION && parsed.completed) {
      return Object.values(TOUR_IDS);
    }
    return [];
  } catch {
    return [];
  }
}

export function useTour(): UseTourReturn {
  const [isCompleted, setIsCompleted] = useState<boolean>(getInitialCompleted);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(getInitialIsLoading);
  const [completedTours, setCompletedTours] = useState<string[]>(getCompletedTours);

  const startTour = useCallback(() => {
    setIsRunning(true);
    setIsCompleted(false);
  }, []);

  const completeTourAsync = useCallback(async (): Promise<void> => {
    console.debug('[useTour] 🚀 completeTourAsync called');
    console.log('[useTour] INICIANDO GUARDADO DEL TOUR EN BD...');

    try {
      console.debug('[useTour] 📡 Calling API completeTour with version:', CURRENT_TOUR_VERSION);
      console.log(
        '[useTour] Enviando request a /api/auth/tour-complete con version:',
        CURRENT_TOUR_VERSION
      );

      const result = await completeTour({
        tour_version: CURRENT_TOUR_VERSION,
      });

      console.debug('[useTour] 🎯 API call successful, result:', result);
      console.log('[useTour] ✅ RESPUESTA DE API:', JSON.stringify(result, null, 2));

      if (typeof window !== 'undefined') {
        const tourData = {
          version: CURRENT_TOUR_VERSION,
          completed: true,
          completedAt: new Date().toISOString(),
        };
        localStorage.setItem(TOUR_LOCALSTORAGE_KEY, JSON.stringify(tourData));
        console.debug('[useTour] 💾 LocalStorage updated:', tourData);
        console.log('[useTour] 💾 LocalStorage guardado exitosamente');
      }

      setIsRunning(false);
      setIsCompleted(true);
      setCompletedTours(Object.values(TOUR_IDS));
      console.debug('[useTour] ✅ State updated - tour completed successfully!');
      console.log('[useTour] 🎉 TOUR GUARDADO EXITOSAMENTE EN BD!');
    } catch (error) {
      console.error('[useTour] 💥 Error al completar tour en la API:', error);
      console.log('[useTour] ❌ ERROR AL GUARDAR EN BD:', error);

      const errorInstance = error instanceof Error ? error : new Error(String(error));
      console.error('[useTour] 💥 Error details:', {
        name: errorInstance.name,
        message: errorInstance.message,
        stack: errorInstance.stack,
      });
      console.log('[useTour] ❌ DETALLES DEL ERROR:', {
        name: errorInstance.name,
        message: errorInstance.message,
        stack: errorInstance.stack,
      });

      if (typeof window !== 'undefined') {
        const tourData = {
          version: CURRENT_TOUR_VERSION,
          completed: true,
          completedAt: new Date().toISOString(),
          pendingSync: true,
        };
        localStorage.setItem(TOUR_LOCALSTORAGE_KEY, JSON.stringify(tourData));
        console.debug('[useTour] 💾 LocalStorage updated with pendingSync:', tourData);
        console.log('[useTour] 💾 LocalStorage guardado con pendingSync (BD falló)');
      }
      setIsRunning(false);
      setIsCompleted(true);
      setCompletedTours(Object.values(TOUR_IDS));
      throw error;
    }
  }, []);

  const resetTour = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(false);
    setCompletedTours([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOUR_LOCALSTORAGE_KEY);
    }
  }, []);

  const isTourCompleted = useCallback(
    (tourName: string): boolean => {
      return completedTours.includes(tourName);
    },
    [completedTours]
  );

  const markTourCompleted = useCallback(
    (tourName: string): void => {
      console.debug('[useTour] markTourCompleted called for:', tourName);
      console.log(`[useTour] ⬜ Marcando tour como completado: ${tourName}`);

      setCompletedTours((prevCompletedTours) => {
        if (prevCompletedTours.includes(tourName)) {
          console.debug('[useTour] Tour already completed:', tourName);
          console.log(`[useTour] ⚪ Tour ya completado: ${tourName}`);
          return prevCompletedTours;
        }

        const newCompletedTours = [...prevCompletedTours, tourName];
        console.debug('[useTour] Updated completed tours:', newCompletedTours);
        console.log(`[useTour] ✅ Tours completados hasta ahora:`, newCompletedTours);

        if (typeof window !== 'undefined') {
          const tourData = {
            version: CURRENT_TOUR_VERSION,
            completedTours: newCompletedTours,
            completed: false,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(TOUR_LOCALSTORAGE_KEY, JSON.stringify(tourData));
          console.log(`[useTour] 💾 Guardado en localStorage:`, newCompletedTours);
        }

        const allTours = Object.values(TOUR_IDS);
        const completedSet = new Set(newCompletedTours);
        const allCompleted = allTours.every((tour) => completedSet.has(tour));
        const missingTours = allTours.filter((tour) => !completedSet.has(tour));

        console.debug('[useTour] All tours completed check:', {
          allTours,
          newCompletedTours,
          allCompleted,
          missingTours,
        });
        console.log(
          `[useTour] Tours pendientes:`,
          missingTours.length > 0 ? missingTours : '✅ NINGUNO'
        );
        console.log(`[useTour] ¿Todos completados?`, allCompleted);

        if (allCompleted) {
          console.debug('[useTour] 🎉 ALL TOURS COMPLETED! Saving to localStorage immediately...');
          console.log(
            '[useTour] 🎉🎉🎉 ¡¡¡TODOS LOS TOURS COMPLETADOS!!! Guardando en localStorage...'
          );

          if (typeof window !== 'undefined') {
            const tourData = {
              version: CURRENT_TOUR_VERSION,
              completedTours: newCompletedTours,
              completed: true,
              completedAt: new Date().toISOString(),
            };
            localStorage.setItem(TOUR_LOCALSTORAGE_KEY, JSON.stringify(tourData));
            console.log('[useTour] 💾 LocalStorage guardado con completed: true');
          }

          setIsCompleted(true);

          (async () => {
            try {
              await completeTourAsync();
              console.debug(
                '[useTour] ✅ completeTourAsync successful - tour version saved to database'
              );
            } catch (error) {
              console.error('[useTour] ❌ Error in completeTourAsync:', error);
              console.log('[useTour] ❌ Error al guardar en completeTourAsync:', error);
            }
          })();
        } else {
          console.debug('[useTour] Not all tours completed yet. Missing:', missingTours);
          console.log(`[useTour] Faltan ${missingTours.length} tour(s) por completar:`, missingTours);
        }

        return newCompletedTours;
      });
    },
    [completeTourAsync]
  );

  const checkTourStatus = useCallback((user: User | null) => {
    let resolvedFromCache = false;

    try {
      const stored =
        typeof window !== 'undefined' ? localStorage.getItem(TOUR_LOCALSTORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);

        if (parsed.completedTours && Array.isArray(parsed.completedTours)) {
          console.log(
            '[useTour] Restaurando tours completados del localStorage:',
            parsed.completedTours
          );
          setCompletedTours(parsed.completedTours);
        }

        if (parsed.version === CURRENT_TOUR_VERSION && parsed.completed) {
          console.log('[useTour] Tour completado en localStorage, estableciendo como completado');
          setIsCompleted(true);
          setCompletedTours(Object.values(TOUR_IDS));
          setIsLoading(false);
          return;
        }

        if (parsed.completedTours && Array.isArray(parsed.completedTours)) {
          resolvedFromCache = true;
        }
      }

      if (user) {
        const needsServerReconciliation = !resolvedFromCache && !getInitialCompleted();

        if (needsServerReconciliation) {
          setIsLoading(true);
        }

        const shouldShow = !user.tour_version || user.tour_version !== CURRENT_TOUR_VERSION;

        setIsCompleted(!shouldShow);

        if (user.tour_version === CURRENT_TOUR_VERSION && user.tour_completed_at) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              TOUR_LOCALSTORAGE_KEY,
              JSON.stringify({
                version: CURRENT_TOUR_VERSION,
                completed: true,
                completedAt: user.tour_completed_at,
              })
            );
          }
          setCompletedTours(Object.values(TOUR_IDS));
        }
      } else {
        setIsCompleted(false);
      }
    } catch (error) {
      console.error('Error al verificar estado del tour:', error);
      setIsCompleted(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isCompleted,
    isRunning,
    isLoading,
    startTour,
    completeTour: completeTourAsync,
    resetTour,
    isTourCompleted,
    markTourCompleted,
    checkTourStatus,
  };
}
