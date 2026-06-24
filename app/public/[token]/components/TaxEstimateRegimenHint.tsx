import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TaxEstimateRegimenHint() {
  return (
    <Card className="border-border bg-muted/20 border-dashed">
      <CardContent className="flex items-start gap-3 p-4">
        <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="space-y-1">
          <p className="text-foreground text-sm font-medium">Estimación fiscal por actividad</p>
          <p className="text-muted-foreground text-sm">
            En el resumen general no se muestran totales de ISR o IVA entre actividades. Selecciona
            una actividad en las opciones de arriba para ver la estimación fiscal de ese régimen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
