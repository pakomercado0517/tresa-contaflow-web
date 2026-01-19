import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary/5 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2">
        <Image
          src="/logotipo-contaFlow.svg"
          alt="Conta Flow"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <span className="text-xl font-semibold">Conta Flow</span>
      </Link>

      {/* Error Content */}
      <Card className="w-full max-w-md p-8 bg-card border-border shadow-lg">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Icon */}
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <FileQuestion className="h-10 w-10 text-primary" />
          </div>

          {/* Error Code */}
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold">Página no encontrada</h2>
            <p className="text-sm text-muted-foreground">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <Button
              asChild
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al dashboard
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t border-border w-full">
            <p className="text-xs text-muted-foreground">
              Si crees que esto es un error, por favor{" "}
              <Link href="/dashboard/setup?tab=account" className="text-primary hover:underline">
                contacta con soporte
              </Link>
              .
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
