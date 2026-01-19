"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import { useTour } from "@/lib/hooks/useTour";
import { useNextStep } from "nextstepjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TOUR_IDS } from "@/lib/constants/tour";

export function TourResetButton() {
  const { resetTour, startTour } = useTour();
  const { startNextStep } = useNextStep();
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetTour = () => {
    setIsResetting(true);
    resetTour();
    startTour();

    // Redirigir al dashboard y luego iniciar el tour
    router.push("/dashboard");
    
    // Esperar un momento para que la página cargue antes de iniciar el tour
    setTimeout(() => {
      startNextStep(TOUR_IDS.dashboard);
      setIsResetting(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour de Bienvenida</CardTitle>
        <CardDescription>
          Reinicia el tour guiado para aprender cómo usar la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleResetTour}
          disabled={isResetting}
          variant="outline"
          className="w-full"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          {isResetting ? "Iniciando..." : "Iniciar Tour"}
        </Button>
      </CardContent>
    </Card>
  );
}
