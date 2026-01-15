"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PromotionCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PromotionCodeInput({
  value,
  onChange,
  disabled = false,
}: PromotionCodeInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClear = () => {
    onChange("");
    setIsExpanded(false);
  };

  // Si hay un código aplicado, mostrar badge
  if (value && !isExpanded) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          Código aplicado: <Badge variant="outline">{value}</Badge>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className="ml-auto h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Si no está expandido, mostrar botón para expandir
  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsExpanded(true)}
        disabled={disabled}
        className="w-full"
      >
        <Tag className="mr-2 h-4 w-4" />
        ¿Tienes un código de descuento?
      </Button>
    );
  }

  // Input expandido
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Ingresa tu código (ej: PROMO2026)"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          disabled={disabled}
          maxLength={50}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => setIsExpanded(false)}
          disabled={disabled}
        >
          Cancelar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        El código se validará al proceder con el pago
      </p>
    </div>
  );
}
