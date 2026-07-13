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
    try {
      await completeTour({
        tour_version: CURRENT_TOUR_VERSION,
      });

      if (typeof window !== 'undefined') {
        const tourData = {
          version: CURRENT_TOUR_VERSION,
          completed: true,
          completedAt: new Date().toISOString(),
        };
        localStorage.setItem(TOUR_LOCALSTORAGE_KEY, JSON.stringify(tourData));
      }

      setIsRunning(false);
      setIsCompleted(true);
      setCompletedTours(Object.values(TOUR_IDS));
    } catch (error) {
      console.error('[useTour] Error al completar tour en la API:', error);

      if (typeof window !== 'undefined') {
        const tourData = {
          version: CURRENT_TOUR_VERSION,
          completed: true,
          completedAt: new Date().toISOString(),
          pendingSync: true,
        };
        localStorage.setItem(TOUR_LOCALSTORAGE_KEY, JSON.stringify(tourData));
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
      if (completedTours.includes(tourName)) {
        return;
      }

      const newCompletedTours = [...completedTours, tourName];
      const allTours = Object.values(TOUR_IDS);
      const completedSet = new Set(newCompletedTours);
      const allCompleted = allTours.every((tour) => completedSet.has(tour));

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          TOUR_LOCALSTORAGE_KEY,
          JSON.stringify(
            allCompleted
              ? {
                  version: CURRENT_TOUR_VERSION,
                  completedTours: newCompletedTours,
                  completed: true,
                  completedAt: new Date().toISOString(),
                }
              : {
                  version: CURRENT_TOUR_VERSION,
                  completedTours: newCompletedTours,
                  completed: false,
                  updatedAt: new Date().toISOString(),
                }
          )
        );
      }

      setCompletedTours(newCompletedTours);

      if (allCompleted) {
        setIsCompleted(true);
        void completeTourAsync().catch((error) => {
          console.error('[useTour] Error al sincronizar tour completado:', error);
        });
      }
    },
    [completedTours, completeTourAsync]
  );

  const checkTourStatus = useCallback((user: User | null) => {
    let resolvedFromCache = false;

    try {
      const stored =
        typeof window !== 'undefined' ? localStorage.getItem(TOUR_LOCALSTORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);

        if (parsed.completedTours && Array.isArray(parsed.completedTours)) {
          setCompletedTours(parsed.completedTours);
        }

        if (parsed.version === CURRENT_TOUR_VERSION && parsed.completed) {
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
