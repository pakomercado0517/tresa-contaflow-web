"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { createDiscountCodeClient } from "@/lib/api/discounts.client";
import type { CreateDiscountCodeRequest } from "@/lib/types/discounts";
import { Loader2 } from "lucide-react";

interface CreateDiscountCodeFormProps {
  onSuccess: () => void;
}

export function CreateDiscountCodeForm({ onSuccess }: CreateDiscountCodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [duration, setDuration] = useState<"once" | "repeating" | "forever">("once");
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [percentOff, setPercentOff] = useState<string>("");
  const [amountOff, setAmountOff] = useState<string>("");
  const [currency, setCurrency] = useState<string>("MXN");
  const [durationInMonths, setDurationInMonths] = useState<string>("");
  const [maxRedemptions, setMaxRedemptions] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [active, setActive] = useState(true);
  const [trialDays, setTrialDays] = useState<string>("");
  const [metadataKey, setMetadataKey] = useState<string>("");
  const [metadataValue, setMetadataValue] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!code.trim()) {
        throw new Error("El código es requerido");
      }

      if (code.trim().length < 3 || code.trim().length > 50) {
        throw new Error("El código debe tener entre 3 y 50 caracteres");
      }

      if (discountType === "percent") {
        const percent = parseFloat(percentOff);
        if (isNaN(percent) || percent <= 0 || percent > 100) {
          throw new Error("El porcentaje debe ser mayor a 0 y menor o igual a 100");
        }
      } else {
        const amount = parseFloat(amountOff);
        if (isNaN(amount) || amount <= 0) {
          throw new Error("El monto debe ser mayor a 0");
        }
        if (!currency || currency.length !== 3) {
          throw new Error("La moneda es requerida y debe tener 3 caracteres (ej: MXN, USD)");
        }
      }

      if (duration === "repeating") {
        const months = parseInt(durationInMonths);
        if (isNaN(months) || months < 1) {
          throw new Error("La duración en meses debe ser un número entero mayor o igual a 1");
        }
      }

      if (maxRedemptions) {
        const max = parseInt(maxRedemptions);
        if (isNaN(max) || max < 1) {
          throw new Error("El máximo de redenciones debe ser un número entero mayor o igual a 1");
        }
      }

      if (trialDays.trim() !== "") {
        const trimmed = trialDays.trim();
        const days = parseInt(trimmed, 10);
        if (isNaN(days) || days < 0 || String(days) !== trimmed) {
          throw new Error("Los días de prueba deben ser un número entero mayor o igual a 0");
        }
      }

      // Construir el payload
      const payload: CreateDiscountCodeRequest = {
        code: code.trim().toUpperCase(),
        duration,
        active,
        ...(discountType === "percent"
          ? { percentOff: parseFloat(percentOff) }
          : { amountOff: parseFloat(amountOff), currency }),
        ...(duration === "repeating" && { durationInMonths: parseInt(durationInMonths) }),
        ...(maxRedemptions && { maxRedemptions: parseInt(maxRedemptions) }),
        ...(expiresAt && { expiresAt: new Date(expiresAt).toISOString() }),
        ...(trialDays.trim() !== "" && { trialDays: parseInt(trialDays.trim(), 10) }),
        ...(metadataKey && metadataValue && {
          metadata: { [metadataKey]: metadataValue },
        }),
      };

      await createDiscountCodeClient(payload);

      // Limpiar formulario
      setCode("");
      setPercentOff("");
      setAmountOff("");
      setDurationInMonths("");
      setMaxRedemptions("");
      setExpiresAt("");
      setTrialDays("");
      setMetadataKey("");
      setMetadataValue("");
      setSuccess(true);
      onSuccess();

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Error al crear el código de descuento");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Código */}
      <div className="space-y-2">
        <Label htmlFor="code">Código *</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="PROMO20"
          maxLength={50}
          required
        />
        <p className="text-xs text-muted-foreground">
          Se convertirá automáticamente a mayúsculas (3-50 caracteres)
        </p>
      </div>

      {/* Duración */}
      <div className="space-y-2">
        <Label>Duración *</Label>
        <Select value={duration} onValueChange={(value) => setDuration(value as typeof duration)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">Una vez</SelectItem>
            <SelectItem value="repeating">Repetitivo</SelectItem>
            <SelectItem value="forever">Permanente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Duración en meses (solo si es repeating) */}
      {duration === "repeating" && (
        <div className="space-y-2">
          <Label htmlFor="durationInMonths">Duración en meses *</Label>
          <Input
            id="durationInMonths"
            type="number"
            min="1"
            value={durationInMonths}
            onChange={(e) => setDurationInMonths(e.target.value)}
            placeholder="3"
            required
          />
        </div>
      )}

      {/* Tipo de descuento */}
      <div className="space-y-3">
        <Label>Tipo de descuento *</Label>
        <RadioGroup
          value={discountType}
          onValueChange={(value) => setDiscountType(value as typeof discountType)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="percent" id="percent" />
            <Label htmlFor="percent" className="font-normal cursor-pointer">
              Porcentaje (%)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="amount" id="amount" />
            <Label htmlFor="amount" className="font-normal cursor-pointer">
              Monto fijo
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Porcentaje o monto */}
      {discountType === "percent" ? (
        <div className="space-y-2">
          <Label htmlFor="percentOff">Porcentaje de descuento *</Label>
          <Input
            id="percentOff"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            placeholder="20"
            required
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amountOff">Monto de descuento *</Label>
            <Input
              id="amountOff"
              type="number"
              min="0.01"
              step="0.01"
              value={amountOff}
              onChange={(e) => setAmountOff(e.target.value)}
              placeholder="50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Moneda *</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">MXN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Máximo de redenciones */}
      <div className="space-y-2">
        <Label htmlFor="maxRedemptions">Máximo de redenciones (opcional)</Label>
        <Input
          id="maxRedemptions"
          type="number"
          min="1"
          value={maxRedemptions}
          onChange={(e) => setMaxRedemptions(e.target.value)}
          placeholder="100"
        />
        <p className="text-xs text-muted-foreground">
          Dejar vacío para ilimitado
        </p>
      </div>

      {/* Fecha de expiración */}
      <div className="space-y-2">
        <Label htmlFor="expiresAt">Fecha de expiración (opcional)</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>

      {/* Activo */}
      <div className="flex items-center justify-between">
        <Label htmlFor="active">Código activo</Label>
        <Switch id="active" checked={active} onCheckedChange={setActive} />
      </div>

      {/* Días de periodo de prueba (opcional) */}
      <div className="space-y-2">
        <Label htmlFor="trialDays">Días de periodo de prueba (opcional)</Label>
        <Input
          id="trialDays"
          type="number"
          min="0"
          value={trialDays}
          onChange={(e) => setTrialDays(e.target.value)}
          placeholder="0 = sin trial, vacío = default del plan (30 días)"
        />
        <p className="text-xs text-muted-foreground">
          Solo aplica si el usuario es elegible para trial. 0 = sin trial, vacío = usar default del plan (30 días para Basic y Pro).
        </p>
      </div>

      {/* Metadatos (opcional) */}
      <div className="space-y-2 border-t pt-4">
        <Label className="text-sm font-medium">Metadatos (opcional)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Clave (ej: campaign)"
            value={metadataKey}
            onChange={(e) => setMetadataKey(e.target.value)}
          />
          <Input
            placeholder="Valor (ej: navidad2026)"
            value={metadataValue}
            onChange={(e) => setMetadataValue(e.target.value)}
          />
        </div>
      </div>

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
          Código de descuento creado exitosamente
        </div>
      )}

      {/* Botón de envío */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando...
          </>
        ) : (
          "Crear Código"
        )}
      </Button>
    </form>
  );
}
