"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  return (
    <Card className="w-full max-w-md p-8 bg-card border-border shadow-lg">
      <div className="flex flex-col items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Recuperar Contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña
          </p>
        </div>

        <div className="w-full space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
            Enviar enlace de recuperación
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="w-full">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-card px-3">
                <div className="h-2 w-2 rounded-full bg-foreground/40"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </Card>
  );
}



