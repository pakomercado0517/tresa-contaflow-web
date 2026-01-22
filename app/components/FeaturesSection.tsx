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
    title: "Visibilidad financiera en tiempo real",
    description:
      "Entiende cómo va tu negocio hoy. Visualiza ingresos, gastos y flujo de efectivo sin depender de hojas de Excel.",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Facturas siempre sincronizadas con el SAT",
    description:
      "Descarga automáticamente tus CFDI directamente del SAT y evita omisiones o información incompleta.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Detección temprana de errores fiscales",
    description:
      "Identifica facturas incorrectas, inconsistencias y riesgos fiscales antes de que se conviertan en problemas.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Todos tus RFCs en un solo lugar",
    description:
      "Administra varios negocios desde una sola cuenta, con información separada, clara y organizada.",
  },
];

const contadorFeatures: Feature[] = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Control total de todos tus clientes",
    description:
      "Gestiona múltiples RFCs desde una sola plataforma y cambia entre clientes sin fricción ni duplicar trabajo.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Reportes profesionales listos para entregar",
    description:
      "Genera reportes claros y consolidados por cliente o periodo. Exporta a PDF y Excel en segundos.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Validación fiscal automatizada",
    description:
      "Detecta discrepancias, errores CFDI 4.0 y posibles riesgos fiscales sin revisar XML uno por uno.",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Descarga masiva directa desde el SAT",
    description:
      "Centraliza las facturas de todos tus clientes con integración directa al SAT, sin procesos manuales.",
  },
];

export function FeaturesSection() {
  const [selectedRole, setSelectedRole] = useState<"empresario" | "contador">(
    "empresario"
  );

  const features =
    selectedRole === "empresario" ? empresarioFeatures : contadorFeatures;

  return (
    <section
      id="beneficios"
      className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8"
    >
      <div className="flex flex-col gap-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Beneficios claros según cómo trabajas
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
