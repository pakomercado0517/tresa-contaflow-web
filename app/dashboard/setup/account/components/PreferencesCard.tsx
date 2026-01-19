"use client";

import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TourResetButton } from "@/components/tour/TourResetButton";

export function PreferencesCard() {
  return (
    <>
      <Card className={cn("relative opacity-50")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Próximamente
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidad estará disponible pronto
            </p>
          </div>
        </CardContent>
      </Card>
      <TourResetButton />
    </>
  );
}

