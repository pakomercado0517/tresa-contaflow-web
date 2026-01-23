'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { UploadZone } from './UploadZone';
import { FilesQueue } from './FilesQueue';
import { UploadSummary } from './UploadSummary';
import { DidYouKnowCard } from './DidYouKnowCard';
import { ProfileSelector } from './ProfileSelector';
import { uploadExpense } from '@/lib/api/expenses.client';
import { ApiError } from '@/lib/api/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Sparkles } from 'lucide-react';
import type { Profile } from '@/lib/types/profiles';
import type { ValidationState } from '@/lib/types/expenses';
import type { Subscription } from '@/lib/types/subscription';
import {
  canUploadExpenses,
  getRemainingExpenses,
  getExpensesLimit,
  getRecommendedUpgradePlan,
} from '@/lib/utils/subscription';

interface UploadExpensesContentProps {
  profiles: Profile[];
  subscription: Subscription | null;
  expensesUsed: number;
}

export interface QueuedFile {
  id: string;
  file: File;
  status: 'pending' | 'valid' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  size: number;
  type?: string; // CFDI 3.3, CFDI 4.0, Nómina 1.2, etc.
  validacion?: ValidationState; // Guardar validación de la API
}

export function UploadExpensesContent({
  profiles,
  subscription,
  expensesUsed,
}: UploadExpensesContentProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para el dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  // Calcular límites y uso
  const plan = subscription?.plan || 'FREE';
  const expensesLimit = getExpensesLimit(plan, subscription);
  const canUpload = canUploadExpenses(expensesUsed, plan, subscription);
  const remaining = getRemainingExpenses(expensesUsed, plan, subscription);
  const recommendedPlan = getRecommendedUpgradePlan(plan);

  // Calcular porcentaje de uso
  const usagePercentage = useMemo(() => {
    if (expensesLimit === null) return 0; // Ilimitado
    return Math.min(100, (expensesUsed / expensesLimit) * 100);
  }, [expensesUsed, expensesLimit]);

  // Determinar nivel de advertencia
  const warningLevel = useMemo(() => {
    if (expensesLimit === null) return null; // Ilimitado
    const percentage = usagePercentage;
    if (percentage >= 100) return 'error'; // Límite alcanzado
    if (percentage >= 90) return 'warning'; // Cerca del límite
    if (percentage >= 75) return 'info'; // Advertencia temprana
    return null;
  }, [usagePercentage, expensesLimit]);

  // Obtener perfil seleccionado
  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const handleFilesSelected = (files: File[]) => {
    // Verificar si el perfil está congelado
    if (selectedProfile?.frozen) {
      showDialog(
        'Perfil Congelado',
        'Este perfil está congelado y no puedes subir gastos. Por favor selecciona un perfil activo o actualiza tu plan para descongelar este perfil.'
      );
      return;
    }

    // Verificar límite antes de agregar archivos
    if (!canUpload) {
      showDialog(
        'Límite alcanzado',
        `Has alcanzado el límite de ${expensesLimit} gastos por mes de tu plan actual. ${
          recommendedPlan
            ? 'Actualiza tu plan para subir más gastos.'
            : 'Contacta con soporte para aumentar tu límite.'
        }`
      );
      return;
    }

    // Validar que no exceda el límite con los nuevos archivos
    const newFilesCount = files.length;
    if (expensesLimit !== null && expensesUsed + newFilesCount > expensesLimit) {
      const availableSlots = remaining !== null ? remaining : 0;
      showDialog(
        'Límite excedido',
        `Solo puedes subir ${availableSlots} gasto${availableSlots !== 1 ? 's' : ''} más este mes. ${
          recommendedPlan
            ? 'Actualiza tu plan para aumentar tu límite.'
            : 'Contacta con soporte para aumentar tu límite.'
        }`
      );
      return;
    }

    const newFiles: QueuedFile[] = files.map((file) => {
      const id = `${Date.now()}-${Math.random()}`;
      const validation = validateFile(file);

      return {
        id,
        file,
        status: validation.valid ? 'valid' : 'error',
        errorMessage: validation.error,
        size: file.size,
        type: validation.type,
      };
    });

    setQueuedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleClearAll = () => {
    setQueuedFiles([]);
  };

  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setIsDialogOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedProfileId) {
      showDialog(
        'Empresa no seleccionada',
        'Por favor selecciona una empresa antes de procesar los archivos.'
      );
      return;
    }

    // Verificar límite antes de procesar
    if (!canUpload) {
      showDialog(
        'Límite alcanzado',
        `Has alcanzado el límite de ${expensesLimit} gastos por mes de tu plan actual. ${
          recommendedPlan
            ? 'Actualiza tu plan para subir más gastos.'
            : 'Contacta con soporte para aumentar tu límite.'
        }`
      );
      return;
    }

    const validFiles = queuedFiles.filter((f) => f.status === 'valid');
    if (validFiles.length === 0) {
      showDialog(
        'Sin archivos válidos',
        'No hay archivos válidos para procesar. Por favor, agrega archivos XML válidos.'
      );
      return;
    }

    // Verificar que no exceda el límite con los archivos a procesar
    if (expensesLimit !== null && expensesUsed + validFiles.length > expensesLimit) {
      const availableSlots = remaining !== null ? remaining : 0;
      showDialog(
        'Límite excedido',
        `Solo puedes subir ${availableSlots} gasto${availableSlots !== 1 ? 's' : ''} más este mes. ${
          recommendedPlan
            ? 'Actualiza tu plan para aumentar tu límite.'
            : 'Contacta con soporte para aumentar tu límite.'
        }`
      );
      return;
    }

    setIsProcessing(true);

    // Procesar cada archivo individualmente
    let successCount = 0;
    let errorCount = 0;

    for (const queuedFile of validFiles) {
      // Marcar como uploading
      setQueuedFiles((prev) =>
        prev.map((f) => (f.id === queuedFile.id ? { ...f, status: 'uploading' } : f))
      );

      try {
        const result = await uploadExpense(queuedFile.file, selectedProfileId);

        // Marcar como success
        setQueuedFiles((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id ? { ...f, status: 'success', validacion: result.validacion } : f
          )
        );
        successCount++;
      } catch (error) {
        errorCount++;
        let errorMessage = 'Error al subir archivo';

        if (error instanceof ApiError) {
          errorMessage = error.message;
          // Si hay datos de validación en el error, guardarlos
          const validationData = (error.data as { validacion?: ValidationState })?.validacion;

          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === queuedFile.id
                ? {
                    ...f,
                    status: 'error',
                    errorMessage,
                    validacion: validationData,
                  }
                : f
            )
          );
        } else {
          // Marcar como error
          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === queuedFile.id
                ? {
                    ...f,
                    status: 'error',
                    errorMessage: error instanceof Error ? error.message : errorMessage,
                  }
                : f
            )
          );
        }
      }
    }

    setIsProcessing(false);

    // Mostrar resumen
    if (errorCount === 0) {
      showDialog(
        '¡Procesamiento exitoso!',
        `Se procesaron ${successCount} archivo(s) correctamente.`
      );
    } else {
      showDialog(
        'Procesamiento completado',
        `✓ ${successCount} archivo(s) exitoso(s)\n✗ ${errorCount} archivo(s) con error(es)\n\nRevisa los detalles de cada archivo en la lista.`
      );
    }
  };

  const validCount = queuedFiles.filter((f) => f.status === 'valid').length;
  const errorCount = queuedFiles.filter((f) => f.status === 'error').length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Gastos XML</h1>
          <p className="text-muted-foreground mt-2">
            Sube tus archivos CFDI de gastos para validación y procesamiento automático. Detectamos
            errores antes de que lleguen al SAT.
          </p>
        </div>
        <ProfileSelector
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onProfileChange={setSelectedProfileId}
        />
      </div>

      {/* Banner de límite de uso */}
      {expensesLimit !== null && (
        <Alert
          className={
            warningLevel === 'error'
              ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
              : warningLevel === 'warning'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                : warningLevel === 'info'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-border'
          }
        >
          <AlertCircle
            className={`h-4 w-4 ${
              warningLevel === 'error'
                ? 'text-red-600'
                : warningLevel === 'warning'
                  ? 'text-orange-600'
                  : warningLevel === 'info'
                    ? 'text-blue-600'
                    : 'text-muted-foreground'
            }`}
          />
          <AlertTitle>Uso de Gastos del Mes</AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {expensesUsed} / {expensesLimit} gastos utilizados
              </span>
              <span className="font-medium">{Math.round(usagePercentage)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            {warningLevel === 'error' && (
              <p className="text-sm font-medium">
                Has alcanzado el límite de tu plan.{' '}
                {recommendedPlan && (
                  <Link
                    href="/dashboard/setup?tab=subscription"
                    className="text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    Actualiza a {recommendedPlan} <Sparkles className="h-4 w-4" />
                  </Link>
                )}
              </p>
            )}
            {warningLevel === 'warning' && remaining !== null && remaining > 0 && (
              <p className="text-sm">
                Te quedan {remaining} gasto{remaining !== 1 ? 's' : ''} disponibles este mes.
                {recommendedPlan && (
                  <Link
                    href="/dashboard/setup?tab=subscription"
                    className="text-primary ml-1 inline-flex items-center gap-1 hover:underline"
                  >
                    Considera actualizar tu plan <Sparkles className="h-4 w-4" />
                  </Link>
                )}
              </p>
            )}
            {warningLevel === 'info' && remaining !== null && (
              <p className="text-muted-foreground text-sm">
                Te quedan {remaining} gastos disponibles este mes.
              </p>
            )}
            {!warningLevel && remaining !== null && remaining > 0 && (
              <p className="text-muted-foreground text-sm">
                Te quedan {remaining} gastos disponibles este mes.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Upload Zone */}
        <div className="lg:col-span-1">
          <UploadZone onFilesSelected={handleFilesSelected} />
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <UploadSummary
            totalFiles={queuedFiles.length}
            validCount={validCount}
            errorCount={errorCount}
            onProcess={handleProcess}
            isProcessing={isProcessing}
            disabled={
              queuedFiles.length === 0 ||
              validCount === 0 ||
              !canUpload ||
              (expensesLimit !== null && expensesUsed + validCount > expensesLimit)
            }
          />
        </div>
      </div>

      {/* Files Queue */}
      {queuedFiles.length > 0 && (
        <FilesQueue
          files={queuedFiles}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAll}
        />
      )}

      {/* Did You Know Card */}
      <DidYouKnowCard />

      {/* Dialog para mensajes */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Función de validación de archivos
function validateFile(file: File): { valid: boolean; error?: string; type?: string } {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split('.').pop();

  // Validar extensión - solo XML
  if (fileExtension !== 'xml') {
    return {
      valid: false,
      error: 'Formato inválido. Solo se permiten archivos .xml',
    };
  }

  // Para XML, validación básica (el tipo se detectará al leer el contenido)
  return { valid: true, type: 'XML' };
}
