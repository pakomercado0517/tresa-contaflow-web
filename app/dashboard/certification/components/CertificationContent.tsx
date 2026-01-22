import React from "react";
import { StepCard } from "./StepCard";
import { CTASection } from "./CTASection";
import { SecurityTip } from "./SecurityTip";
import { BookOpen, ArrowRight, FileText } from "lucide-react";

export function CertificationContent() {
  const steps = [
    {
      number: 1,
      icon: <BookOpen className="h-8 w-8" />,
      title: "Prepara tus credenciales",
      description:
        "Ten a la mano tu RFC y tu e.firma (archivos .cer y .key) o tu contraseña del SAT vigente. Sin ellos no podrás acceder al portal privado.",
    },
    {
      number: 2,
      icon: <ArrowRight className="h-8 w-8" />,
      title: "Navega a Trámites",
      description:
        'Selecciona la pestaña "Obtén la Constancia" y busca la opción de: "1. Ingresa al servicio", da click en "servicio"; te abrira una nueva pestaña con la pantalla de autenticación (ingresa tus credenciales).',
    },
    {
      number: 3,
      icon: <FileText className="h-8 w-8" />,
      title: "Genera el PDF",
      description:
        'Desliza hacia la derecha y haz clic en el botón "Generar Constancia". Se abrirá una ventana emergente con tu documento listo para guardar.',
    },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4" data-tour="certification-hero">
          <div className="inline-block">
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              PROCESO DE CERTIFICACIÓN
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Obtén tu Constancia de Situación Fiscal
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hemos diseñado esta guía para ayudarte a navegar el portal del SAT
            sin complicaciones. Sigue estos 3 pasos visuales para descargar tu
            PDF.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour="certification-steps">
          {steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>

        {/* CTA Section */}
        <CTASection />

        {/* Security Tip */}
        <SecurityTip />
      </div>
    </div>
  );
}
