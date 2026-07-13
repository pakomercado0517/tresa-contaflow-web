'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadInvoice } from '@/lib/api/invoices.client';
import { ApiError } from '@/lib/api/client';
import type { Profile } from '@/lib/types/profiles';
import type { ValidationState } from '@/lib/types/invoices';
import { isUploadComplementSavedResponse } from '@/lib/types/invoices';
import type { Subscription } from '@/lib/types/subscription';
import {
  canUploadInvoices,
  getRemainingInvoices,
  getInvoicesLimit,
  getRecommendedUpgradePlan,
} from '@/lib/utils/subscription';
import type { QueuedInvoiceFile } from './upload-invoices-types';
import { validateQueuedInvoiceXmlFile } from './upload-invoices-file-validation';

interface UseUploadInvoicesFlowOptions {
  profiles: Profile[];
  subscription: Subscription | null;
  invoicesUsed: number;
}

export function useUploadInvoicesFlow({
  profiles,
  subscription,
  invoicesUsed,
}: UseUploadInvoicesFlowOptions) {
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [queuedFiles, setQueuedFiles] = useState<QueuedInvoiceFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [limitDialog, setLimitDialog] = useState({
    open: false,
    title: '',
    message: '',
  });

  const plan = subscription?.plan || 'FREE';
  const invoicesLimit = getInvoicesLimit(plan, subscription);
  const canUpload = canUploadInvoices(invoicesUsed, plan, subscription);
  const remaining = getRemainingInvoices(invoicesUsed, plan, subscription);
  const recommendedPlan = getRecommendedUpgradePlan(plan);

  const usagePercentage = useMemo(() => {
    if (invoicesLimit === null) return 0;
    return Math.min(100, (invoicesUsed / invoicesLimit) * 100);
  }, [invoicesUsed, invoicesLimit]);

  const warningLevel = useMemo(() => {
    if (invoicesLimit === null) return null;
    const percentage = usagePercentage;
    if (percentage >= 100) return 'error' as const;
    if (percentage >= 90) return 'warning' as const;
    if (percentage >= 75) return 'info' as const;
    return null;
  }, [usagePercentage, invoicesLimit]);

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const showDialog = useCallback((title: string, message: string) => {
    setLimitDialog({ open: true, title, message });
  }, []);

  const setIsDialogOpen = useCallback((open: boolean) => {
    setLimitDialog((prev) => ({ ...prev, open }));
  }, []);

  const showLimitReachedMessage = useCallback(() => {
    showDialog(
      'Límite alcanzado',
      `Has alcanzado el límite de ${invoicesLimit} facturas por mes de tu plan actual. ${
        recommendedPlan
          ? 'Actualiza tu plan para subir más facturas.'
          : 'Contacta con soporte para aumentar tu límite.'
      }`
    );
  }, [showDialog, invoicesLimit, recommendedPlan]);

  const showLimitExceededMessage = useCallback(() => {
    const availableSlots = remaining !== null ? remaining : 0;
    showDialog(
      'Límite excedido',
      `Solo puedes subir ${availableSlots} factura${availableSlots !== 1 ? 's' : ''} más este mes. ${
        recommendedPlan
          ? 'Actualiza tu plan para aumentar tu límite.'
          : 'Contacta con soporte para aumentar tu límite.'
      }`
    );
  }, [showDialog, remaining, recommendedPlan]);

  const handleFilesSelected = (files: File[]) => {
    if (!canUpload) {
      showLimitReachedMessage();
      return;
    }

    const newFilesCount = files.length;
    if (invoicesLimit !== null && invoicesUsed + newFilesCount > invoicesLimit) {
      showLimitExceededMessage();
      return;
    }

    const newFiles: QueuedInvoiceFile[] = files.map((file) => {
      const id = `${Date.now()}-${Math.random()}`;
      const validation = validateQueuedInvoiceXmlFile(file);

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

  const handleProcess = async () => {
    if (!canUpload) {
      showLimitReachedMessage();
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

    if (invoicesLimit !== null && invoicesUsed + validFiles.length > invoicesLimit) {
      showLimitExceededMessage();
      return;
    }

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

    let successCount = 0;
    let errorCount = 0;

    for (const queuedFile of validFiles) {
      setQueuedFiles((prev) =>
        prev.map((f) => (f.id === queuedFile.id ? { ...f, status: 'uploading' } : f))
      );

      try {
        const result = await uploadInvoice(queuedFile.file, selectedProfileId);

        if (isUploadComplementSavedResponse(result)) {
          const complementHref = `/dashboard/invoices/complementos/${result.complementId}?profileId=${selectedProfileId}`;
          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === queuedFile.id
                ? {
                    ...f,
                    status: 'success',
                    validacion: result.validacion,
                    complementViewHref: complementHref,
                  }
                : f
            )
          );
          toast.success('Complemento de pago guardado', {
            description: 'El REP se registró y aplicó pagos a facturas PPD relacionadas.',
            action: {
              label: 'Ver complemento',
              onClick: () => {
                window.location.href = complementHref;
              },
            },
          });
        } else {
          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === queuedFile.id ? { ...f, status: 'success', validacion: result.validacion } : f
            )
          );
        }
        await queryClient.invalidateQueries({ queryKey: ['payment-complements'] });
        successCount++;
      } catch (error) {
        errorCount++;
        let errorMessage = 'Error al subir archivo';
        let duplicateListHref: string | undefined;

        if (error instanceof ApiError) {
          errorMessage = error.message;
          if (error.status === 409) {
            const payload = error.data as { uuid?: string } | undefined;
            if (payload?.uuid) {
              errorMessage = 'Este complemento ya está registrado.';
              const params = new URLSearchParams({
                profileId: selectedProfileId,
                search: payload.uuid,
                page: '1',
              });
              duplicateListHref = `/dashboard/invoices?${params.toString()}`;
            }
          }
          const validationData = (error.data as { validacion?: ValidationState })?.validacion;

          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === queuedFile.id
                ? {
                    ...f,
                    status: 'error',
                    errorMessage,
                    validacion: validationData,
                    duplicateListHref,
                  }
                : f
            )
          );
        } else {
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

  const isProcessDisabled =
    queuedFiles.length === 0 ||
    validCount === 0 ||
    !canUpload ||
    (invoicesLimit !== null && invoicesUsed + validCount > invoicesLimit);

  return {
    queuedFiles,
    isProcessing,
    isProcessDialogOpen,
    setIsProcessDialogOpen,
    isDialogOpen: limitDialog.open,
    setIsDialogOpen,
    dialogTitle: limitDialog.title,
    dialogMessage: limitDialog.message,
    invoicesLimit,
    invoicesUsed,
    usagePercentage,
    warningLevel,
    remaining,
    recommendedPlan,
    selectedProfileId,
    setSelectedProfileId,
    selectedProfile,
    handleFilesSelected,
    handleRemoveFile,
    handleClearAll,
    handleProcess,
    handleConfirmProcess,
    validCount,
    errorCount,
    isProcessDisabled,
  };
}
