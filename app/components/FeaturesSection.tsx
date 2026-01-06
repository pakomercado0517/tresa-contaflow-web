"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, Download, CheckCircle2, Users } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const empresarioFeatures: Feature[] = [
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Dashboard en Tiempo Real",
    description:
      "Visualiza todas tus métricas financieras en un solo lugar. Control total de tus ingresos y gastos.",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Descarga Masiva SAT",
    description:
      "Importa todas tus facturas del SAT de forma automática. Sin procesos manuales complicados.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Validación Automática",
    description:
      "Sistema de validación CFDI 4.0 integrado. Detecta errores y problemas fiscales antes que sea tarde.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Gestión Multi-RFC",
    description:
      "Administra múltiples empresas desde una sola cuenta. Ideal para emprendedores con varios negocios.",
  },
];

const contadorFeatures: Feature[] = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Gestión Multi-Cliente",
    description:
      "Administra todos tus clientes desde una sola plataforma. Cambia entre RFCs de forma instantánea.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Reportes Consolidados",
    description:
      "Genera reportes profesionales combinando datos de múltiples clientes. Exporta a PDF y Excel.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Validaciones Fiscales",
    description:
      "Sistema avanzado de validación CFDI 4.0. Detecta discrepancias y problemas fiscales automáticamente.",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Integración SAT",
    description:
      "Conecta con el SAT para descargar facturas de todos tus clientes de forma masiva y automática.",
  },
];

export function FeaturesSection() {
  const [selectedRole, setSelectedRole] = useState<"empresario" | "contador">(
    "empresario"
  );

  const features =
    selectedRole === "empresario" ? empresarioFeatures : contadorFeatures;

  return (
    <section id="beneficios" className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8">
      <div className="flex flex-col gap-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Herramientas diseñadas para tu rol
          </h2>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setSelectedRole("empresario")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedRole === "empresario"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Soy Empresario
            </button>
            <button
              onClick={() => setSelectedRole("contador")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedRole === "contador"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Soy Contador
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-card border-border">
              <div className="flex flex-col gap-4">
                <div className="text-primary">{feature.icon}</div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

