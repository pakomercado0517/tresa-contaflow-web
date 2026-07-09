'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { logger } from '@/lib/utils/logger';
import { ApiError } from '@/lib/api/client';
import { deleteProfile } from '@/lib/api/profiles.client';
import { getRegimenesFiscalesClient } from '@/lib/api/sat.client';
import { exportProfilesToPDF } from '@/lib/utils/pdf-export';
import { exportProfilesToExcel } from '@/lib/excel';
import { hasFeatureAccess } from '@/lib/hooks/useSubscription';
import type { Profile } from '@/lib/types/profiles';
import type { Subscription } from '@/lib/types/subscription';
import { getProfileDeleteErrorMessage } from './profiles-table-utils';
import { fetchProfilesExportPayload } from './profiles-table-export';

const ITEMS_PER_PAGE = 4;

interface UseProfilesTableOptions {
  profiles: Profile[];
  subscription?: Subscription | null;
}

export function useProfilesTable({ profiles, subscription }: UseProfilesTableOptions) {
  const router = useRouter();
  const canExportPDF = hasFeatureAccess(subscription ?? null, 'pdf_export');
  const canExportExcel = hasFeatureAccess(subscription ?? null, 'excel_export');

  const { data: regimenesData } = useQuery({
    queryKey: ['regimenes-fiscales'],
    queryFn: () => getRegimenesFiscalesClient(),
  });

  const descripcionMap = useMemo(() => {
    const items = regimenesData?.data ?? [];
    return Object.fromEntries(items.map((r) => [r.clave, r.descripcion]));
  }, [regimenesData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;

    const query = searchQuery.toLowerCase();
    return profiles.filter(
      (profile) =>
        profile.nombre.toLowerCase().includes(query) || profile.rfc.toLowerCase().includes(query)
    );
  }, [profiles, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const { profilesStats } = await fetchProfilesExportPayload(profiles);
      await exportProfilesToPDF({ profiles, profilesStats });
    } catch (error) {
      logger.error('Error al exportar perfiles', error);
      if (error instanceof ApiError) {
        alert(`Error al generar el PDF: ${error.message}`);
      } else {
        alert('Error al generar el PDF. Por favor intenta nuevamente.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const { profilesStats } = await fetchProfilesExportPayload(profiles);
      await exportProfilesToExcel({ profiles, profilesStats });
    } catch (error) {
      logger.error('Error al exportar perfiles a Excel', error);
      if (error instanceof ApiError) {
        alert(`Error al generar el Excel: ${error.message}`);
      } else {
        alert('Error al generar el Excel. Por favor intenta nuevamente.');
      }
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleDeleteClick = (profile: Profile) => {
    setProfileToDelete(profile);
    setDeleteError(null);
    setDeleteConfirmation('');
  };

  const handleEditClick = (profileId: string) => {
    router.push(`/dashboard/setup/profiles/${profileId}`);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open && !isDeleting) {
      setProfileToDelete(null);
      setDeleteError(null);
      setDeleteConfirmation('');
    }
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteProfile(profileToDelete.id);
      setProfileToDelete(null);
      router.refresh();
    } catch (error) {
      setDeleteError(getProfileDeleteErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    descripcionMap,
    searchQuery,
    handleSearchChange,
    paginatedProfiles,
    filteredProfilesCount: filteredProfiles.length,
    startIndex,
    endIndex,
    currentPage,
    totalPages,
    setCurrentPage,
    canExportPDF,
    canExportExcel,
    isExporting,
    isExportingExcel,
    handleExportPdf,
    handleExportExcel,
    handleEditClick,
    handleDeleteClick,
    profileToDelete,
    deleteConfirmation,
    setDeleteConfirmation,
    deleteError,
    isDeleting,
    handleCloseDialog,
    handleConfirmDelete,
  };
}
