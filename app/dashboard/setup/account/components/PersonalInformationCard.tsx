"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "@/lib/api/auth";
import type { User as UserType } from "@/lib/types/auth";

interface PersonalInformationCardProps {
  user?: UserType | null;
}

export function PersonalInformationCard({ user }: PersonalInformationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Preparar el body del request con solo los campos que han cambiado
      const updateData: {
        nombre?: string;
        apellido?: string;
        telefono?: string;
      } = {};

      // Solo incluir campos que tienen valor
      if (formData.nombre.trim()) {
        updateData.nombre = formData.nombre.trim();
      }
      if (formData.apellido.trim()) {
        updateData.apellido = formData.apellido.trim();
      }
      if (formData.telefono.trim()) {
        updateData.telefono = formData.telefono.trim();
      }

      // Verificar que al menos un campo tenga valor
      if (Object.keys(updateData).length === 0) {
        setError("Debes proporcionar al menos un campo para actualizar");
        setIsLoading(false);
        return;
      }

      const response = await updateProfile(updateData);

      // Actualizar el estado con los datos devueltos
      if (response.user) {
        setFormData({
          nombre: response.user.nombre || "",
          apellido: response.user.apellido || "",
          email: response.user.email,
          telefono: response.user.telefono || "",
        });
      }

      setIsEditing(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Error al actualizar el perfil");
      } else {
        setError("Error al actualizar el perfil. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar valores originales
    setFormData({
      nombre: user?.nombre || "",
      apellido: user?.apellido || "",
      email: user?.email || "",
      telefono: user?.telefono || "",
    });
    setError(null);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre(s)</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                disabled={!isEditing || isLoading}
                placeholder="Juan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellidos</Label>
              <Input
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
                disabled={!isEditing || isLoading}
                placeholder="Pérez"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo Electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              El correo electrónico no se puede modificar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              disabled={!isEditing || isLoading}
              placeholder="+52 55 1234 5678"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Contraseña</p>
                <p className="text-xs text-muted-foreground">
                  Modificado hace 3 meses
                </p>
              </div>
            </div>
            <Button type="button" variant="link" className="text-primary">
              Cambiar
            </Button>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          )}

          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              Editar Información
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

