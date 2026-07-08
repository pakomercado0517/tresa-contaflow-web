'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAccruedExpenseClient } from '@/lib/api/accrued-expenses.client';
import { ApiError } from '@/lib/api/client';
import type { Subscription } from '@/lib/types/subscription';
import type { Profile } from '@/lib/types/profiles';
import {
  canUploadExpenses,
  getExpensesLimit,
  getRecommendedUpgradePlan,
} from '@/lib/utils/subscription';

interface ManualExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  profileId: string;
  periodId: string;
  profiles: Profile[];
  subscription?: Subscription | null;
  expensesUsed?: number;
}

const CATEGORIES = ['Viáticos', 'Oficina', 'Servicios', 'Transporte', 'Alimentación', 'Otro'];

export function ManualExpenseDialog({
  isOpen,
  onClose,
  onSuccess,
  profileId,
  periodId,
  profiles,
  subscription,
  expensesUsed = 0,
}: ManualExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profileId);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [total, setTotal] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [iva, setIva] = useState('');
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState('');

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedProfileId(profileId);
      setError('');
    }
  }

  // Calcular límites
  const plan = subscription?.plan || 'FREE';
  const expensesLimit = getExpensesLimit(plan, subscription);
  const canUpload = canUploadExpenses(expensesUsed, plan, subscription);
  const recommendedPlan = getRecommendedUpgradePlan(plan);

  // Obtener perfil seleccionado
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const isFrozen = selectedProfile?.frozen || false;

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
      setSubtotal('');
      setIva('');
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
      setIva('');
      setTotal('');
    }
  };

  // Todos los perfiles (incluyendo congelados, para mostrar en el selector)
  const allProfiles = profiles;
  // Perfiles disponibles para seleccionar (solo no congelados)
  const availableProfiles = profiles.filter((p) => !p.frozen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar límite antes de crear gasto manual
    if (!canUpload) {
      setError(
        `Has alcanzado el límite de ${expensesLimit} gastos por mes de tu plan actual. ${
          recommendedPlan
            ? 'Actualiza tu plan para crear más gastos.'
            : 'Contacta con soporte para aumentar tu límite.'
        }`
      );
      return;
    }

    // Validaciones
    if (!fecha) {
      setError('La fecha es requerida');
      return;
    }

    if (!selectedProfileId) {
      setError('Debes seleccionar un perfil');
      return;
    }

    // Validar que el perfil seleccionado no esté congelado
    if (isFrozen) {
      setError('No se pueden agregar gastos a un perfil congelado. Selecciona otro perfil.');
      return;
    }

    const subtotalNum = parseFloat(subtotal);
    const ivaNum = parseFloat(iva) || 0;

    if (!Number.isFinite(subtotalNum) || subtotalNum < 0) {
      setError('El subtotal debe ser un número mayor o igual a 0');
      return;
    }
    if (!Number.isFinite(ivaNum) || ivaNum < 0) {
      setError('El IVA debe ser un número mayor o igual a 0');
      return;
    }

    const concept = concepto.trim();
    if (!concept) {
      setError('El concepto es obligatorio');
      return;
    }

    setIsSubmitting(true);

    try {
      const fechaStr = fecha; // YYYY-MM-DD

      await createAccruedExpenseClient({
        profile_id: selectedProfileId,
        period_id: periodId,
        concept,
        subtotal: subtotalNum,
        iva_amount: ivaNum,
        fecha: fechaStr,
        type: 'manual',
        categoria: categoria || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al crear el gasto. Intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSelectedProfileId(profileId);
      setError('');
      return;
    }

    if (!isSubmitting) {
      setFecha(new Date().toISOString().split('T')[0]);
      setTotal('');
      setSubtotal('');
      setIva('');
      setConcepto('');
      setCategoria('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar Gasto Manual</DialogTitle>
            <DialogDescription>Registra un gasto que no proviene de un CFDI XML.</DialogDescription>
          </DialogHeader>

          {/* Mostrar advertencia si está cerca del límite o lo alcanzó */}
          {expensesLimit !== null && !canUpload && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Has alcanzado el límite de {expensesLimit} gastos por mes de tu plan actual.
                {recommendedPlan && (
                  <>
                    {' '}
                    <Link
                      href="/dashboard/setup?tab=subscription"
                      className="text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      Actualiza a {recommendedPlan} <Sparkles className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Mostrar advertencia si el perfil está congelado */}
          {isFrozen && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este perfil está congelado 🔒. No se pueden agregar gastos a un perfil congelado.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            {/* Selector de RFC/Empresa */}
            <div className="grid gap-2">
              <Label htmlFor="profile">
                RFC/Empresa <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedProfileId}
                onValueChange={setSelectedProfileId}
                disabled={isSubmitting}
              >
                <SelectTrigger id="profile">
                  <SelectValue placeholder="Selecciona un RFC/Empresa" />
                </SelectTrigger>
                <SelectContent>
                  {allProfiles.map((profile) => {
                    const isFrozenProfile = profile.frozen || false;
                    return (
                      <SelectItem key={profile.id} value={profile.id} disabled={isFrozenProfile}>
                        <div
                          className={`flex items-center gap-2 ${isFrozenProfile ? 'opacity-60' : ''}`}
                        >
                          <span className="font-mono text-sm">{profile.rfc}</span>
                          {isFrozenProfile && <span>🔒</span>}
                          <span>{profile.nombre}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {availableProfiles.length === 0 && (
                <p className="text-destructive mt-2 text-xs">
                  ⚠️ Todos tus perfiles están congelados 🔒. Actualiza tu plan para descongelarlos.
                </p>
              )}
            </div>

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
                  max={new Date().toISOString().split('T')[0]}
                  required
                  disabled={isSubmitting}
                  className="pl-3"
                />
                <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
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
              <p className="text-muted-foreground text-xs">
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
              <Select value={categoria} onValueChange={setCategoria} disabled={isSubmitting}>
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
              <div className="text-destructive bg-destructive/10 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !canUpload}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
