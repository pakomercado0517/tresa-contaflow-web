"use client";

import { HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DidYouKnowCard() {
  return (
    <Card className="bg-muted/30 border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">¿Sabías qué?</h3>
            <p className="text-sm text-muted-foreground">
              Puedes subir archivos .ZIP que contengan múltiples XMLs. El
              sistema los descomprimirá automáticamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

