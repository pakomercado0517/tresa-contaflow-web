import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Check, Lock, ArrowRight } from "lucide-react";

export function VerificationSuccessCard() {
  return (
    <Card className="w-full max-w-lg p-8 bg-card border-border shadow-lg">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-blue-600/20 flex items-center justify-center relative">
            <Shield className="h-14 w-14 text-blue-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="h-8 w-8 text-yellow-400" strokeWidth={3} />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center border-2 border-card">
              <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
            </div>
            <div className="absolute -top-2 -left-2 h-2 w-2 rounded-full bg-yellow-400 opacity-60"></div>
            <div className="absolute top-0 -right-3 h-2 w-2 rounded-full bg-yellow-400 opacity-60"></div>
            <div className="absolute -bottom-1 left-0 h-2 w-2 rounded-full bg-yellow-400 opacity-60"></div>
            <div className="absolute bottom-0 -left-2 h-2 w-2 rounded-full bg-yellow-400 opacity-60"></div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">¡Correo Verificado!</h1>
          <p className="text-base text-muted-foreground max-w-md">
            Gracias por confirmar tu dirección. Tu cuenta está activa y segura.
            Ya puedes gestionar tus facturas CFDI.
          </p>
        </div>

        <div className="w-full space-y-4">
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Link href="/dashboard">
              Ir a mi Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <div className="text-center">
            <Link
              href="/settings"
              className="text-sm text-foreground hover:underline"
            >
              Crear mi primer perfil de empresa
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Tu información está encriptada y segura.</span>
        </div>
      </div>
    </Card>
  );
}



