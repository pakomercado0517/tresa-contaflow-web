'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { UploadZone } from './UploadZone';
import { FilesQueue } from './FilesQueue';
import { UploadSummary } from './UploadSummary';
import { DidYouKnowCard } from './DidYouKnowCard';
import { ProfileSelector } from './ProfileSelector';
import { uploadInvoice } from '@/lib/api/invoices.client';
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
import { AlertSourceBadge } from '@/components/common/AlertSourceBadge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Sparkles } from 'lucide-react';
import type { Profile } from '@/lib/types/profiles';
import type { ValidationState } from '@/lib/types/invoices';
import type { Subscription } from '@/lib/types/subscription';
import {
  canUploadInvoices,
  getRemainingInvoices,
  getInvoicesLimit,
  getRecommendedUpgradePlan,
} from '@/lib/utils/subscription';

interface UploadInvoicesContentProps {
  profiles: Profile[];
  subscription: Subscription | null;
  invoicesUsed: number;
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

export function UploadInvoicesContent({
  profiles,
  subscription,
  invoicesUsed,
}: UploadInvoicesContentProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);

  // Estados para el dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  // Calcular límites y uso
  const plan = subscription?.plan || 'FREE';
  const invoicesLimit = getInvoicesLimit(plan, subscription);
  const canUpload = canUploadInvoices(invoicesUsed, plan, subscription);
  const remaining = getRemainingInvoices(invoicesUsed, plan, subscription);
  const recommendedPlan = getRecommendedUpgradePlan(plan);

  // Calcular porcentaje de uso
  const usagePercentage = useMemo(() => {
    if (invoicesLimit === null) return 0; // Ilimitado
    return Math.min(100, (invoicesUsed / invoicesLimit) * 100);
  }, [invoicesUsed, invoicesLimit]);

  // Determinar nivel de advertencia
  const warningLevel = useMemo(() => {
    if (invoicesLimit === null) return null; // Ilimitado
    const percentage = usagePercentage;
    if (percentage >= 100) return 'error'; // Límite alcanzado
    if (percentage >= 90) return 'warning'; // Cerca del límite
    if (percentage >= 75) return 'info'; // Advertencia temprana
    return null;
  }, [usagePercentage, invoicesLimit]);

  // Obtener perfil seleccionado
  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const handleFilesSelected = (files: File[]) => {
    // Verificar límite antes de agregar archivos
    if (!canUpload) {
      showDialog(
        'Límite alcanzado',
        `Has alcanzado el límite de ${invoicesLimit} facturas por mes de tu plan actual. ${
          recommendedPlan
            ? 'Actualiza tu plan para subir más facturas.'
            : 'Contacta con soporte para aumentar tu límite.'
        }`
      );
      return;
    }

    // Validar que no exceda el límite con los nuevos archivos
    const newFilesCount = files.length;
    if (invoicesLimit !== null && invoicesUsed + newFilesCount > invoicesLimit) {
      const availableSlots = remaining !== null ? remaining : 0;
      showDialog(
        'Límite excedido',
        `Solo puedes subir ${availableSlots} factura${availableSlots !== 1 ? 's' : ''} más este mes. ${
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
    // Verificar límite antes de procesar
    if (!canUpload) {
      showDialog(
        'Límite alcanzado',
        `Has alcanzado el límite de ${invoicesLimit} facturas por mes de tu plan actual. ${
          recommendedPlan
            ? 'Actualiza tu plan para subir más facturas.'
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
    if (invoicesLimit !== null && invoicesUsed + validFiles.length > invoicesLimit) {
      const availableSlots = remaining !== null ? remaining : 0;
      showDialog(
        'Límite excedido',
        `Solo puedes subir ${availableSlots} factura${availableSlots !== 1 ? 's' : ''} más este mes. ${
          recommendedPlan
            ? 'Actualiza tu plan para aumentar tu límite.'
            : 'Contacta con soporte para aumentar tu límite.'
        }`
      );
      return;
    }

    // Reiniciar selección para forzar confirmación explícita de perfil antes de procesar
    setSelectedProfileId('');
    setIsProcessDialogOpen(true);
  };

  const handleConfirmProcess = async () => {
    if (!selectedProfileId) {
      showDialog(
        'Empresa no seleccionada',
        'Selecciona una empresa para procesar las facturas cargadas.'
      );
      return;
    }

    if (selectedProfile?.frozen) {
      showDialog(
        'Perfil Congelado',
        'Este perfil está congelado y no puedes subir facturas. Selecciona un perfil activo o actualiza tu plan para descongelarlo.'
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

    setIsProcessDialogOpen(false);
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
        const result = await uploadInvoice(queuedFile.file, selectedProfileId);

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
          <h1 className="text-3xl font-bold">Carga de Facturas XML</h1>
          <p className="text-muted-foreground mt-2">
            Sube tus archivos CFDI para validación y procesamiento automático. Detectamos errores
            antes de que lleguen al SAT. El perfil se selecciona al confirmar el procesamiento.
          </p>
        </div>
      </div>

      {/* Banner de límite de uso */}
      {invoicesLimit !== null && (
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
          <AlertTitle className="flex flex-wrap items-center gap-2">
            <span>Uso de Facturas del Mes</span>
            <AlertSourceBadge source="planLimit" />
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {invoicesUsed} / {invoicesLimit} facturas utilizadas
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
                Te quedan {remaining} factura{remaining !== 1 ? 's' : ''} disponibles este mes.
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
                Te quedan {remaining} facturas disponibles este mes.
              </p>
            )}
            {!warningLevel && remaining !== null && remaining > 0 && (
              <p className="text-muted-foreground text-sm">
                Te quedan {remaining} facturas disponibles este mes.
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
              (invoicesLimit !== null && invoicesUsed + validCount > invoicesLimit)
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

      {/* Dialog de confirmación de procesamiento con selección de perfil */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecciona la empresa para procesar</DialogTitle>
            <DialogDescription>
              Se procesarán {validCount} archivo{validCount !== 1 ? 's' : ''} válido
              {validCount !== 1 ? 's' : ''}. Elige el perfil correcto para evitar sobreprocesar
              facturas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <ProfileSelector
              profiles={profiles}
              selectedProfileId={selectedProfileId}
              onProfileChange={setSelectedProfileId}
            />
            {selectedProfile && (
              <p className="text-muted-foreground text-sm">
                Se procesarán {validCount} archivo{validCount !== 1 ? 's' : ''} para{' '}
                <span className="text-foreground font-medium">
                  {selectedProfile.nombre} ({selectedProfile.rfc})
                </span>
                .
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProcessDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmProcess} disabled={!selectedProfileId || isProcessing}>
              Confirmar y procesar
            </Button>
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
