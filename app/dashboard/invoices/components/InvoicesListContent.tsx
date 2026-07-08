'use client';

import { InvoicesHeader } from './InvoicesHeader';
import { SummaryCards } from './SummaryCards';
import { PaymentComplementsSection } from '@/components/payment-complements/PaymentComplementsSection';
import { DashboardListPagination } from '@/app/dashboard/components/DashboardListPagination';
import { ManualIncomesSection } from './ManualIncomesSection';
import { InvoicesXmlTableSection } from './InvoicesXmlTableSection';
import { DeleteInvoiceDialog } from './DeleteInvoiceDialog';
import { DeleteManualIncomeDialog } from './DeleteManualIncomeDialog';
import { ManualIncomeFormDialog } from './ManualIncomeFormDialog';
import {
  useInvoicesListViewModel,
  type InvoicesListViewModelInput,
} from './use-invoices-list-view-model';

export type InvoicesListContentProps = InvoicesListViewModelInput;

export function InvoicesListContent(props: InvoicesListContentProps) {
  const {
    storedProfileUrlRestoreRef,
    profiles,
    selectedProfileId,
    handleProfileChange,
    selectedMes,
    setSelectedMes,
    selectedAño,
    setSelectedAño,
    selectedRegimenFiscal,
    setSelectedRegimenFiscal,
    regimenOptions,
    selectedProfile,
    search,
    setSearch,
    handleClearFilters,
    exportPdfHref,
    handleExportPDF,
    canExportPDF,
    handleExportExcel,
    canExportExcel,
    handleOpenAddManualIncome,
    canAddManualIncome,
    manualIncomeDisabledReason,
    metrics,
    manualIncomes,
    manualIncomesState,
    handleOpenEditManualIncome,
    handleDeleteManualIncomeClick,
    invoices,
    tableState,
    handleDeleteClick,
    pagination,
    handlePageChange,
    paymentComplements,
    paymentComplementsPagination,
    complementPage,
    handleComplementPageChange,
    paymentComplementsState,
    paymentComplementsError,
    showComplementProfileColumn,
    invoiceToDelete,
    deleteConfirmation,
    setDeleteConfirmation,
    deleteError,
    isDeleting,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    manualIncomeToDelete,
    manualIncomeDeleteConfirmation,
    setManualIncomeDeleteConfirmation,
    manualIncomeDeleteError,
    isDeletingManualIncome,
    handleCloseManualIncomeDeleteDialog,
    handleConfirmDeleteManualIncome,
    addManualIncomeOpen,
    editingManualIncome,
    manualIncomeConcept,
    setManualIncomeConcept,
    manualIncomeSubtotal,
    setManualIncomeSubtotal,
    manualIncomeIva,
    setManualIncomeIva,
    manualIncomeFecha,
    setManualIncomeFecha,
    manualIncomeNotes,
    setManualIncomeNotes,
    manualIncomeIsPaid,
    setManualIncomeIsPaid,
    manualIncomePaymentDate,
    setManualIncomePaymentDate,
    manualIncomeFormError,
    isManualIncomeSubmitting,
    handleCloseManualIncomeDialog,
    handleSubmitManualIncome,
  } = useInvoicesListViewModel(props);

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div ref={storedProfileUrlRestoreRef} className="hidden" aria-hidden />
      <InvoicesHeader
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onProfileChange={handleProfileChange}
        selectedMes={selectedMes}
        onMesChange={setSelectedMes}
        selectedAño={selectedAño}
        onAñoChange={setSelectedAño}
        selectedRegimenFiscal={selectedRegimenFiscal}
        onRegimenFiscalChange={setSelectedRegimenFiscal}
        regimenOptions={regimenOptions}
        isRegimenDisabled={!selectedProfile?.regimenes_fiscales?.length}
        search={search}
        onSearchChange={setSearch}
        onClearFilters={handleClearFilters}
        exportPdfHref={exportPdfHref}
        onExportPDF={handleExportPDF}
        canExportPDF={canExportPDF}
        onExportExcel={handleExportExcel}
        canExportExcel={canExportExcel}
        onAddManualIncome={handleOpenAddManualIncome}
        canAddManualIncome={canAddManualIncome}
        manualIncomeDisabledReason={manualIncomeDisabledReason}
      />

      <div className="w-full min-w-0 space-y-6 p-4 pt-120 md:p-6 md:pt-56 lg:p-8 lg:pt-40">
        <SummaryCards
          totalCount={metrics.totalFacturas}
          pendingPaymentCount={metrics.facturasPendientesPago}
          totalIncome={metrics.totalFacturado}
        />

        <ManualIncomesSection
          canAddManualIncome={canAddManualIncome}
          manualIncomeDisabledReason={manualIncomeDisabledReason}
          manualIncomesState={manualIncomesState}
          manualIncomes={manualIncomes}
          onAddManualIncome={handleOpenAddManualIncome}
          onEditManualIncome={handleOpenEditManualIncome}
          onDeleteManualIncome={handleDeleteManualIncomeClick}
        />

        <InvoicesXmlTableSection
          invoices={invoices}
          search={search}
          tableState={tableState}
          onDelete={handleDeleteClick}
        />

        <DashboardListPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          itemLabel="facturas"
          navStyle="arrows"
        />

        <PaymentComplementsSection
          title="Complementos de cobro (REP emitidos)"
          complementRole="INGRESO"
          items={paymentComplements}
          pagination={paymentComplementsPagination}
          complementPage={complementPage}
          onComplementPageChange={handleComplementPageChange}
          listState={paymentComplementsState}
          errorMessage={paymentComplementsError}
          showProfileColumn={showComplementProfileColumn}
          detailBasePath="/dashboard/invoices/complementos"
          mes={selectedMes}
          año={selectedAño}
        />
      </div>

      <DeleteInvoiceDialog
        invoice={invoiceToDelete}
        deleteConfirmation={deleteConfirmation}
        onDeleteConfirmationChange={setDeleteConfirmation}
        deleteError={deleteError}
        isDeleting={isDeleting}
        onOpenChange={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      <DeleteManualIncomeDialog
        income={manualIncomeToDelete}
        deleteConfirmation={manualIncomeDeleteConfirmation}
        onDeleteConfirmationChange={setManualIncomeDeleteConfirmation}
        deleteError={manualIncomeDeleteError}
        isDeleting={isDeletingManualIncome}
        onOpenChange={handleCloseManualIncomeDeleteDialog}
        onConfirm={handleConfirmDeleteManualIncome}
      />

      <ManualIncomeFormDialog
        open={addManualIncomeOpen}
        editingManualIncome={editingManualIncome}
        concept={manualIncomeConcept}
        onConceptChange={setManualIncomeConcept}
        subtotal={manualIncomeSubtotal}
        onSubtotalChange={setManualIncomeSubtotal}
        iva={manualIncomeIva}
        onIvaChange={setManualIncomeIva}
        fecha={manualIncomeFecha}
        onFechaChange={setManualIncomeFecha}
        notes={manualIncomeNotes}
        onNotesChange={setManualIncomeNotes}
        isPaid={manualIncomeIsPaid}
        onIsPaidChange={setManualIncomeIsPaid}
        paymentDate={manualIncomePaymentDate}
        onPaymentDateChange={setManualIncomePaymentDate}
        formError={manualIncomeFormError}
        isSubmitting={isManualIncomeSubmitting}
        onOpenChange={handleCloseManualIncomeDialog}
        onSubmit={handleSubmitManualIncome}
      />
    </div>
  );
}
