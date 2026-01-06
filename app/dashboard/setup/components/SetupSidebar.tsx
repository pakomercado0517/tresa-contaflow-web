import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export function SetupSidebar() {
  return (
    <div className="w-full h-full p-8 flex flex-col gap-6 justify-center">
      {/* Card Superior - Novedades */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <Badge variant="outline" className="w-fit mb-2 text-primary border-primary">
            NOVEDADES
          </Badge>
          <h3 className="text-xl font-semibold">
            Gestión multi-empresa simplificada
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Administra todos tus RFCs y clientes desde un solo panel de control
            unificado y seguro.
          </p>
          {/* Ilustración decorativa */}
          <div className="mt-6 flex items-end gap-2 h-24">
            <div className="flex-1 bg-primary/10 rounded-lg p-3 flex flex-col gap-1">
              <div className="h-2 bg-primary/30 rounded w-full"></div>
              <div className="h-2 bg-primary/30 rounded w-3/4"></div>
              <div className="h-2 bg-primary/30 rounded w-1/2"></div>
            </div>
            <div className="flex-1 bg-primary/20 rounded-lg p-3 flex items-end">
              <div className="w-full h-16 bg-primary/30 rounded"></div>
            </div>
            <div className="flex-1 bg-primary/10 rounded-lg p-3 flex flex-col gap-1 justify-end">
              <div className="h-4 bg-primary/40 rounded w-full"></div>
              <div className="h-4 bg-primary/40 rounded w-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Inferior - Testimonial */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarFallback className="bg-primary/20 text-primary">
                S
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">
                &quot;Configurar mis perfiles fiscales nunca había sido tan
                rápido. La validación automática ahorra horas de errores.&quot;
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

