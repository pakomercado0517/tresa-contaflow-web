import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function CTASection() {
  return (
    <Card className="bg-card border-border" data-tour="certification-cta">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              ¿Todo listo para continuar?
            </h3>
            <p className="text-muted-foreground">
              Te redirigiremos al portal oficial del SAT en una pestaña nueva
              para que puedas realizar el trámite siguiendo esta guía.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0"
          >
            <a
              href="https://www.sat.gob.mx/portal/public/tramites/constancia-de-situacion-fiscal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Ir al portal del SAT
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
