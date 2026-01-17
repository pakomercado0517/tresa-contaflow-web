"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, ArrowRight, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "../../../actions";
import type { Profile } from "@/lib/types/profiles";

interface EditProfileFormProps {
  profile: Profile;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter();
  const [tipoPersona, setTipoPersona] = useState<"FISICA" | "MORAL">(
    profile.tipo_persona
  );
  const [nombre, setNombre] = useState(profile.nombre);
  const [rfc, setRfc] = useState(profile.rfc.toUpperCase());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialNombre = profile.nombre;
  const initialRfc = profile.rfc.toUpperCase();
  const initialTipo = profile.tipo_persona;
  const normalizedRfc = rfc.toUpperCase();

  const hasChanges =
    nombre.trim() !== initialNombre ||
    normalizedRfc !== initialRfc ||
    tipoPersona !== initialTipo;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("rfc", normalizedRfc);
      formData.append("tipo_persona", tipoPersona);

      const result = await updateProfileAction(profile.id, formData);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      router.push("/dashboard/setup/profiles");
    } catch {
      setError("Error al actualizar el perfil. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Editar perfil RFC</h2>
        <p className="text-muted-foreground mb-3">
          Actualiza la información fiscal del perfil seleccionado.
        </p>
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre o Razón Social</Label>
        <Input
          id="nombre"
          type="text"
          placeholder="Ej. Juan Pérez o Empresa S. A. de C.V."
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          required
          minLength={2}
          maxLength={255}
        />
      </div>

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
          onChange={(event) => setRfc(event.target.value.toUpperCase())}
          required
          minLength={12}
          maxLength={13}
          pattern="[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}"
        />
        <p className="text-xs text-muted-foreground">
          Introduce los 12 o 13 caracteres de tu homoclave.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/setup/profiles")}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          size="lg"
          disabled={isLoading || !nombre || !rfc || !hasChanges}
        >
          {isLoading ? "Guardando cambios..." : "Guardar cambios"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
