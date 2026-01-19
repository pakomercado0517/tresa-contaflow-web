"use client";

import { useState } from "react";
import { CURRENT_TOUR_VERSION, TOUR_LOCALSTORAGE_KEY, TOUR_IDS } from "@/lib/constants/tour";
import { completeTour } from "@/lib/api/auth";
import type { User } from "@/lib/types/auth";

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
  markTourCompleted: (tourName: string) => Promise<void>;
  checkTourStatus: (user: User | null) => void;
}

// Función helper para obtener el tour cacheado
function getCachedTour(): CachedTour | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(TOUR_LOCALSTORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function useTour(): UseTourReturn {
  // Inicializar basado en localStorage si está disponible
  const getInitialCompleted = (): boolean => {
    if (typeof window === "undefined") return true;
    const cached = getCachedTour();
    if (cached && cached.version === CURRENT_TOUR_VERSION && cached.completed) {
      return true;
    }
    return false;
  };

  const getCompletedTours = (): string[] => {
    if (typeof window === "undefined") return [];
    const cached = getCachedTour();
    // Si el cache está actualizado, confiar en él
    if (cached && cached.version === CURRENT_TOUR_VERSION && cached.completed) {
      // Todos los tours están completados si el tour general está completado
      return Object.values(TOUR_IDS);
    }
    return [];
  };

  const [isCompleted, setIsCompleted] = useState<boolean>(getInitialCompleted);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [completedTours, setCompletedTours] = useState<string[]>(getCompletedTours);

  const startTour = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const completeTourAsync = async (): Promise<void> => {
    try {
      // Llamar a la API para marcar el tour como completado
      await completeTour({
        tour_version: CURRENT_TOUR_VERSION,
      });

      // Actualizar localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          TOUR_LOCALSTORAGE_KEY,
          JSON.stringify({
            version: CURRENT_TOUR_VERSION,
            completed: true,
            completedAt: new Date().toISOString(),
          })
        );
      }

      setIsRunning(false);
      setIsCompleted(true);
      setCompletedTours(Object.values(TOUR_IDS));
    } catch (error) {
      console.error("Error al completar tour en la API:", error);
      // Aún así, guardar en localStorage para mejor UX
      if (typeof window !== "undefined") {
        localStorage.setItem(
          TOUR_LOCALSTORAGE_KEY,
          JSON.stringify({
            version: CURRENT_TOUR_VERSION,
            completed: true,
            completedAt: new Date().toISOString(),
            pendingSync: true, // Marcar para sincronizar después
          })
        );
      }
      setIsRunning(false);
      setIsCompleted(true);
      setCompletedTours(Object.values(TOUR_IDS));
      throw error;
    }
  };

  const resetTour = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setCompletedTours([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOUR_LOCALSTORAGE_KEY);
    }
  };

  const isTourCompleted = (tourName: string): boolean => {
    return completedTours.includes(tourName);
  };

  const markTourCompleted = async (tourName: string): Promise<void> => {
    if (!completedTours.includes(tourName)) {
      const newCompletedTours = [...completedTours, tourName];
      setCompletedTours(newCompletedTours);

      // Si se completaron todos los tours, marcar el tour general como completado
      const allTours = Object.values(TOUR_IDS);
      if (allTours.every((tour) => newCompletedTours.includes(tour))) {
        await completeTourAsync();
      }
    }
  };

  const checkTourStatus = (user: User | null) => {
    setIsLoading(true);

    try {
      // 1. Verificar localStorage primero (cache)
      const cached = getCachedTour();
      if (cached && cached.version === CURRENT_TOUR_VERSION && cached.completed) {
        setIsCompleted(true);
        setCompletedTours(Object.values(TOUR_IDS));
        setIsLoading(false);
        return;
      }

      // 2. Si no hay cache o versión diferente, verificar API (usuario)
      if (user) {
        const shouldShow =
          !user.tour_version || user.tour_version !== CURRENT_TOUR_VERSION;

        setIsCompleted(!shouldShow);

        // Si el usuario tiene la versión actual, actualizar cache
        if (user.tour_version === CURRENT_TOUR_VERSION && user.tour_completed_at) {
          if (typeof window !== "undefined") {
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
        // Si no hay usuario, asumir que no está completado
        setIsCompleted(false);
      }
    } catch (error) {
      console.error("Error al verificar estado del tour:", error);
      setIsCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

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
