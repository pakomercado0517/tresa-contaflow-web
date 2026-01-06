"use client";

import { Rocket, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UploadSummaryProps {
  totalFiles: number;
  validCount: number;
  errorCount: number;
  onProcess: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export function UploadSummary({
  totalFiles,
  validCount,
  errorCount,
  onProcess,
  isProcessing,
  disabled,
}: UploadSummaryProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-6">
        {/* Security Message */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <div className="rounded-full bg-primary/10 p-3">
            <Cloud className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Tus facturas están seguras en la nube.
          </p>
        </div>

        {/* Statistics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Archivos</span>
            <span className="text-lg font-semibold">{totalFiles}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Válidos</span>
            <span className="text-lg font-semibold text-green-500">
              {validCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Errores</span>
            <span className="text-lg font-semibold text-red-500">
              {errorCount}
            </span>
          </div>
        </div>

        {/* Process Button */}
        <Button
          onClick={onProcess}
          disabled={disabled || isProcessing}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Rocket className="mr-2 h-4 w-4 animate-pulse" />
              Procesando...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Procesar Facturas
            </>
          )}
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground">
          Al procesar, las facturas se validarán ante el SAT automáticamente.
        </p>
      </CardContent>
    </Card>
  );
}

