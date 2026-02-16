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
    title: "Ingresos y egresos mes a mes",
    description:
      "Visualiza resultados por periodo desde tus XML. Sin Excel manual ni hojas dispersas: todo en un solo panel.",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Reportes en PDF y Excel",
    description:
      "Exporta reportes listos para descargar según tu plan. Información contable clara, sin armar cuadros a mano.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Organización automática desde XML",
    description:
      "Sube tus CFDI y deja que la plataforma organice ingresos, egresos y complementos de pago por ti.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Varios RFCs en una sola cuenta",
    description:
      "Administra múltiples negocios o razones sociales desde un solo lugar, con información separada y ordenada.",
  },
];

const contadorFeatures: Feature[] = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Múltiples RFCs en un solo panel",
    description:
      "Gestiona todos tus clientes desde una cuenta. Cambia entre RFCs sin duplicar trabajo ni perder claridad.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Reportes listos para entregar",
    description:
      "Genera reportes por cliente o periodo. Exporta a PDF y Excel desde el mismo panel, según tu plan.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Ingresos y egresos devengables",
    description:
      "Identifica y organiza ingresos y egresos devengables a partir de tus XML, sin revisar CFDI uno por uno.",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Búsqueda de claves SAT con IA",
    description:
      "En planes compatibles: encuentra claves SAT más rápido con búsqueda asistida por IA y ahorra tiempo.",
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
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Deja atrás el caos de XML sueltos y Excel manual. Organiza tu contabilidad desde tus CFDI
            y obtén claridad financiera sin procesos complicados.
          </p>
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
