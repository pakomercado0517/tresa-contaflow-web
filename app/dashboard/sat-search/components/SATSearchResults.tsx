"use client";

import { Copy, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SATProductServiceAttributes } from "@/lib/types/sat";

interface SATSearchResultsProps {
  results: SATProductServiceAttributes[];
}

export function SATSearchResults({ results }: SATSearchResultsProps) {
  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      // Podrías agregar un toast aquí
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {results.map((product) => {
        return (
          <Card
            key={product.id}
            className="border-primary/20 bg-primary/5 transition-shadow hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Información principal */}
                <div className="flex flex-1 flex-col gap-3">
                  {/* Clave SAT */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Sparkles className="size-3" />
                      CLAVE SAT
                    </Badge>
                    <span className="text-2xl font-bold text-primary">
                      {product.id}
                    </span>
                  </div>

                  {/* Descripción */}
                  <h3 className="text-lg font-semibold leading-tight">
                    {product.descripcion}
                  </h3>

                  {/* Categorización */}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="text-primary">▲</span>
                      <span>
                        Clase:{" "}
                        {product.descripcion.split(" ").slice(0, 3).join(" ")}
                      </span>
                    </div>
                    <div>
                      Segmento:{" "}
                      {product.palabras_similares
                        ? product.palabras_similares.split(",")[0].trim()
                        : "General"}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-2 md:min-w-[140px]">
                  <Button
                    onClick={() => handleCopyKey(product.id)}
                    className="w-full gap-2"
                    size="sm"
                  >
                    <Copy className="size-4" />
                    Copiar Clave
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    size="sm"
                    onClick={() => {
                      // Aquí podrías abrir un modal con más detalles
                      console.log("Ver detalles de:", product.id);
                    }}
                  >
                    <Info className="size-4" />
                    Detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
