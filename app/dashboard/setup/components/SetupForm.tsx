"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Building2, ArrowRight, HelpCircle, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createProfileAction } from "../actions";
import {
  canCreateProfile,
  getRemainingProfiles,
  getProfileLimitMessage,
  getRecommendedUpgradePlan,
  getProfileLimit,
} from "@/lib/utils/subscription";
import type { Plan } from "@/lib/types/subscription";

interface SetupFormProps {
  currentProfileCount: number;
  plan: Plan;
}

export function SetupForm({ currentProfileCount, plan }: SetupFormProps) {
  const router = useRouter();
  const [tipoPersona, setTipoPersona] = useState<"FISICA" | "MORAL">("FISICA");
  const [nombre, setNombre] = useState("");
  const [rfc, setRfc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = canCreateProfile(currentProfileCount, plan);
  const remainingProfiles = getRemainingProfiles(currentProfileCount, plan);
  const limit = getProfileLimit(plan);
  const recommendedPlan = getRecommendedUpgradePlan(plan);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("rfc", rfc.toUpperCase());
      formData.append("tipo_persona", tipoPersona);

      const result = await createProfileAction(formData);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Redirigir al dashboard después de crear el perfil
      router.push("/dashboard");
    } catch (err) {
      setError("Error al crear el perfil. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {currentProfileCount === 0
            ? "Da de alta tu primer RFC"
            : "Crear nuevo perfil RFC"}
        </h1>
        <p className="text-muted-foreground mb-3">
          {currentProfileCount === 0
            ? "Ingresa los datos fiscales para comenzar a administrar tus facturas y clientes de forma eficiente."
            : "Agrega un nuevo perfil fiscal para gestionar múltiples empresas."}
        </p>

        {/* Información del plan y límites */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            {getProfileLimitMessage(plan)}
          </Badge>
          {limit !== Infinity && (
            <span className="text-xs text-muted-foreground">
              {currentProfileCount} / {limit} perfiles
            </span>
          )}
        </div>

        {/* Alerta si alcanzó el límite */}
        {!canCreate && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-1">
                  Límite de perfiles alcanzado
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Has alcanzado el límite de {limit} perfil
                  {limit > 1 ? "es" : ""} de tu plan actual.{" "}
                  {recommendedPlan &&
                    "Actualiza tu plan para crear más perfiles."}
                </p>
                {recommendedPlan && (
                  <Link href="/dashboard/subscription">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Actualizar a {recommendedPlan}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje informativo si tiene perfiles restantes */}
        {canCreate && remainingProfiles !== Infinity && remainingProfiles > 0 && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
            <p className="text-sm text-muted-foreground">
              Te quedan{" "}
              <span className="font-medium text-foreground">
                {remainingProfiles} perfil{remainingProfiles > 1 ? "es" : ""}
              </span>{" "}
              disponible{remainingProfiles > 1 ? "s" : ""} en tu plan actual.
            </p>
          </div>
        )}
      </div>

      {/* Tipo de Persona */}
      <div className="space-y-3">
        <Label>Tipo de Persona</Label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTipoPersona("FISICA")}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              tipoPersona === "FISICA"
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <User className="h-6 w-6" />
              <span className="text-sm font-medium">Persona Física</span>
            </div>
            {tipoPersona === "FISICA" && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"></div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTipoPersona("MORAL")}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              tipoPersona === "MORAL"
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="text-sm font-medium">Persona Moral</span>
            </div>
            {tipoPersona === "MORAL" && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"></div>
            )}
          </button>
        </div>
      </div>

      {/* Nombre o Razón Social */}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre o Razón Social</Label>
        <Input
          id="nombre"
          type="text"
          placeholder="Ej. Juan Pérez o Empresa S. A. de C.V."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          minLength={2}
          maxLength={255}
        />
      </div>

      {/* RFC */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="rfc">RFC</Label>
          <a
            href="https://www.sat.gob.mx/aplicacion/operacion/31274/consulta-tu-clave-de-rfc-con-la-curp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <HelpCircle className="h-4 w-4" />
            ¿No sabes tu RFC?
          </a>
        </div>
        <Input
          id="rfc"
          type="text"
          placeholder="ABCD123456XYZ"
          value={rfc}
          onChange={(e) => setRfc(e.target.value.toUpperCase())}
          required
          minLength={12}
          maxLength={13}
          pattern="[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}"
        />
        <p className="text-xs text-muted-foreground">
          Introduce los 12 o 13 caracteres de tu homoclave.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || !nombre || !rfc || !canCreate}
      >
        {isLoading ? "Creando perfil..." : "Crear Perfil"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

