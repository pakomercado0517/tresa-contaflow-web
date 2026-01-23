"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SATAIExplanation() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Lightbulb className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold">
              ¿Cómo funciona la IA?
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nuestro modelo de procesamiento de lenguaje natural ha sido
              entrenado con todo el catálogo de productos y servicios del SAT
              (Anexo 20). Analizamos semánticamente tu descripción para
              emparejarla con la jerarquía técnica oficial, asegurando que tu
              facturación cumpla con las normativas fiscales vigentes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
