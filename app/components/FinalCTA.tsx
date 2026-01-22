"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function FinalCTA() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Empieza hoy a trabajar con orden y claridad
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Una plataforma creada para negocios y contadores que necesitan
            controlar facturas, ingresos y gastos sin procesos complicados.
            Empieza gratis y decide después.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-foreground">No requiere instalación</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-foreground">
                Sin compromisos ni cargos ocultos
              </span>
            </div>
          </div>
        </div>

        <Card className="flex-1 p-8 bg-card border-border">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Prueba la plataforma gratis
              </h3>
            </div>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
              <Input
                type="password"
                placeholder="Contraseña segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
              />
              <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                Probar gratis
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Al registrarte aceptas nuestros Términos y Condiciones.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
