"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Loader2, AlertCircle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createManualExpense } from "@/lib/api/expenses.client";
import { ApiError } from "@/lib/api/client";
import type { Subscription } from "@/lib/types/subscription";
import {
  canUploadExpenses,
  getExpensesLimit,
  getRecommendedUpgradePlan,
} from "@/lib/utils/subscription";

interface ManualExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  subscription?: Subscription | null;
  expensesUsed?: number;
}

const CATEGORIES = [
  "Viáticos",
  "Oficina",
  "Servicios",
  "Transporte",
  "Alimentación",
  "Otro",
];

export function ManualExpenseDialog({
  isOpen,
  onClose,
  profileId,
  subscription,
  expensesUsed = 0,
}: ManualExpenseDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Calcular límites
  const plan = subscription?.plan || "FREE";
  const expensesLimit = getExpensesLimit(plan, subscription);
  const canUpload = canUploadExpenses(expensesUsed, plan, subscription);
  const recommendedPlan = getRecommendedUpgradePlan(plan);

  // Form fields
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [total, setTotal] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [iva, setIva] = useState("");
  const [concepto, setConcepto] = useState("");
  const [categoria, setCategoria] = useState("");
  // Cálculo automático de IVA cuando cambia el total
  const handleTotalChange = (value: string) => {
    setTotal(value);
    if (value && !isNaN(parseFloat(value))) {
      const totalNum = parseFloat(value);
      const subtotalNum = totalNum / 1.16;
      const ivaNum = totalNum - subtotalNum;
      setSubtotal(subtotalNum.toFixed(2));
      setIva(ivaNum.toFixed(2));
    } else {
      setSubtotal("");
      setIva("");
    }
  };

  // Cálculo automático de IVA cuando cambia el subtotal
  const handleSubtotalChange = (value: string) => {
    setSubtotal(value);
    if (value && !isNaN(parseFloat(value))) {
      const subtotalNum = parseFloat(value);
      const ivaNum = subtotalNum * 0.16;
      const totalNum = subtotalNum + ivaNum;
      setIva(ivaNum.toFixed(2));
      setTotal(totalNum.toFixed(2));
    } else {
      setIva("");
      setTotal("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar límite antes de crear gasto manual
    if (!canUpload) {
      setError(
        `Has alcanzado el límite de ${expensesLimit} gastos por mes de tu plan actual. ${
          recommendedPlan
            ? "Actualiza tu plan para crear más gastos."
            : "Contacta con soporte para aumentar tu límite."
        }`
      );
      return;
    }

    // Validaciones
    if (!fecha) {
      setError("La fecha es requerida");
      return;
    }

    if (!total || !subtotal || !iva) {
      setError("El total, subtotal e IVA son requeridos");
      return;
    }

    const totalNum = parseFloat(total);
    const subtotalNum = parseFloat(subtotal);
    const ivaNum = parseFloat(iva);

    if (totalNum <= 0 || subtotalNum <= 0 || ivaNum < 0) {
      setError("Los montos deben ser válidos");
      return;
    }

    // Validar coherencia
    const calculatedTotal = subtotalNum + ivaNum;
    if (Math.abs(calculatedTotal - totalNum) > 0.01) {
      setError("Los montos no son coherentes (Total ≠ Subtotal + IVA)");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertir fecha a ISO 8601
      const fechaISO = new Date(fecha + "T00:00:00.000Z").toISOString();

      await createManualExpense({
        profileId,
        fecha: fechaISO,
        total: totalNum,
        subtotal: subtotalNum,
        iva: ivaNum,
        concepto: concepto || undefined,
        categoria: categoria || undefined,
      });

      // Éxito: cerrar modal y recargar página
      onClose();
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error al crear el gasto. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form
      setFecha(new Date().toISOString().split("T")[0]);
      setTotal("");
      setSubtotal("");
      setIva("");
      setConcepto("");
      setCategoria("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar Gasto Manual</DialogTitle>
            <DialogDescription>
              Registra un gasto que no proviene de un CFDI XML.
            </DialogDescription>
          </DialogHeader>

          {/* Mostrar advertencia si está cerca del límite o lo alcanzó */}
          {expensesLimit !== null && !canUpload && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Has alcanzado el límite de {expensesLimit} gastos por mes de tu plan actual.
                {recommendedPlan && (
                  <>
                    {" "}
                    <Link
                      href="/dashboard/setup?tab=subscription"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Actualiza a {recommendedPlan} <Sparkles className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            {/* Fecha */}
            <div className="grid gap-2">
              <Label htmlFor="fecha">
                Fecha <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                  disabled={isSubmitting}
                  className="pl-3"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Total */}
            <div className="grid gap-2">
              <Label htmlFor="total">
                Total (con IVA) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1,160.00"
                value={total}
                onChange={(e) => handleTotalChange(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                El subtotal e IVA se calcularán automáticamente
              </p>
            </div>

            {/* Subtotal (calculado automáticamente) */}
            <div className="grid gap-2">
              <Label htmlFor="subtotal">
                Subtotal <span className="text-muted-foreground">(sin IVA)</span>
              </Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1,000.00"
                value={subtotal}
                onChange={(e) => handleSubtotalChange(e.target.value)}
                disabled={isSubmitting}
                className="bg-muted/50"
              />
            </div>

            {/* IVA (calculado automáticamente) */}
            <div className="grid gap-2">
              <Label htmlFor="iva">
                IVA <span className="text-muted-foreground">(16%)</span>
              </Label>
              <Input
                id="iva"
                type="number"
                step="0.01"
                min="0"
                placeholder="160.00"
                value={iva}
                disabled
                className="bg-muted/50"
              />
            </div>

            {/* Concepto */}
            <div className="grid gap-2">
              <Label htmlFor="concepto">Concepto / Descripción</Label>
              <Input
                id="concepto"
                type="text"
                placeholder="Ej: Compra de materiales de oficina"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                disabled={isSubmitting}
                maxLength={200}
              />
            </div>

            {/* Categoría */}
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={categoria}
                onValueChange={setCategoria}
                disabled={isSubmitting}
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !canUpload}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Guardando..." : "Guardar Gasto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
