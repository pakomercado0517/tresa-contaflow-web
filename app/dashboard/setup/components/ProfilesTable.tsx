'use client';

import type { Profile } from '@/lib/types/profiles';
import type { Plan, Subscription, SubscriptionStatus } from '@/lib/types/subscription';
import { ProfilesTableEmptyState } from './ProfilesTableEmptyState';
import { ProfilesTableToolbar } from './ProfilesTableToolbar';
import { ProfilesTableDataGrid } from './ProfilesTableDataGrid';
import { ProfilesTablePagination } from './ProfilesTablePagination';
import { DeleteProfileDialog } from './DeleteProfileDialog';
import { useProfilesTable } from './use-profiles-table';

interface ProfilesTableProps {
  profiles: Profile[];
  canCreate: boolean;
  remaining: number;
  plan: Plan;
  currentCount: number;
  subscriptionStatus: SubscriptionStatus;
  subscription?: Subscription | null;
}

export function ProfilesTable({ profiles, subscription }: ProfilesTableProps) {
  const table = useProfilesTable({ profiles, subscription });

  if (profiles.length === 0) {
    return <ProfilesTableEmptyState />;
  }

  return (
    <div className="space-y-4">
      <ProfilesTableToolbar
        searchQuery={table.searchQuery}
        onSearchChange={table.handleSearchChange}
        pdfExport={{
          enabled: table.canExportPDF,
          isLoading: table.isExporting,
          onExport: table.handleExportPdf,
          label: 'Exportar PDF',
          disabledTitle: 'Disponible en plan Básico o superior',
        }}
        excelExport={{
          enabled: table.canExportExcel,
          isLoading: table.isExportingExcel,
          onExport: table.handleExportExcel,
          label: 'Exportar Excel',
          disabledTitle: 'Disponible en plan Pro',
        }}
      />

      <ProfilesTableDataGrid
        profiles={table.paginatedProfiles}
        descripcionMap={table.descripcionMap}
        isDeleting={table.isDeleting}
        onEdit={table.handleEditClick}
        onDelete={table.handleDeleteClick}
      />

      <ProfilesTablePagination
        startIndex={table.startIndex}
        endIndex={table.endIndex}
        totalCount={table.filteredProfilesCount}
        currentPage={table.currentPage}
        totalPages={table.totalPages}
        onPageChange={table.setCurrentPage}
      />

      <DeleteProfileDialog
        profile={table.profileToDelete}
        deleteConfirmation={table.deleteConfirmation}
        onDeleteConfirmationChange={table.setDeleteConfirmation}
        deleteError={table.deleteError}
        isDeleting={table.isDeleting}
        onOpenChange={table.handleCloseDialog}
        onConfirm={table.handleConfirmDelete}
      />
    </div>
  );
}
