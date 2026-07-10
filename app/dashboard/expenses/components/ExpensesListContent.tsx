'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExpensesSummaryCards } from './ExpensesSummaryCards';
import { ExpensesHeader } from './ExpensesHeader';
import { ManualExpenseDialog } from './ManualExpenseDialog';
import { PaymentComplementsSection } from '@/components/payment-complements/PaymentComplementsSection';
import { DashboardListPagination } from '@/app/dashboard/components/DashboardListPagination';
import { ExpensesManualExpensesSection } from './ExpensesManualExpensesSection';
import { ExpensesXmlTableSection } from './ExpensesXmlTableSection';
import { EditManualExpenseDialog } from './EditManualExpenseDialog';
import { DeleteExpenseDialog } from './DeleteExpenseDialog';
import {
  useExpensesListViewModel,
  type ExpensesListViewModelInput,
} from './use-expenses-list-view-model';

export type ExpensesListContentProps = ExpensesListViewModelInput;

export function ExpensesListContent(props: ExpensesListContentProps) {
  const {
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
    setIsManualExpenseDialogOpen,
    canAddManualExpense,
    manualExpenseDisabledReason,
    totalExpensesAmount,
    totalTaxesAndWithholdings,
    xmlExpenses,
    validXmlExpenses,
    manualExpensesForSection,
    manualExpensesState,
    handleOpenEditManual,
    handleDeleteClick,
    expenses,
    tableState,
    pagination,
    handlePageChange,
    paymentComplements,
    paymentComplementsPagination,
    complementPage,
    handleComplementPageChange,
    paymentComplementsState,
    paymentComplementsError,
    showComplementProfileColumn,
    periodId,
    isManualExpenseDialogOpen,
    invalidateAfterManualExpense,
    subscription,
    expensesUsed,
    editingManualExpense,
    editConcept,
    setEditConcept,
    editSubtotal,
    setEditSubtotal,
    editIva,
    setEditIva,
    editIsPaid,
    setEditIsPaid,
    editPaymentDate,
    setEditPaymentDate,
    editCategoria,
    setEditCategoria,
    editError,
    isUpdatingManual,
    handleCloseEditManual,
    handleSubmitEditManual,
    showProfileWarning,
    setShowProfileWarning,
    expenseToDelete,
    deleteConfirmation,
    setDeleteConfirmation,
    deleteError,
    isDeleting,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useExpensesListViewModel(props);

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <ExpensesHeader
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onProfileChange={handleProfileChange}
        selectedMes={selectedMes}
        onMesChange={setSelectedMes}
        selectedAño={selectedAño}
        onAñoChange={setSelectedAño}
        search={search}
        onSearchChange={setSearch}
        onClearFilters={handleClearFilters}
        regimenFilter={{
          selected: selectedRegimenFiscal,
          onChange: setSelectedRegimenFiscal,
          options: regimenOptions,
          disabled: !selectedProfile?.regimenes_fiscales?.length,
        }}
        exportConfig={{
          pdf: {
            allowed: canExportPDF,
            previewHref: exportPdfHref,
            onExport: handleExportPDF,
          },
          excel: {
            allowed: canExportExcel,
            onExport: handleExportExcel,
          },
        }}
        manualEntry={{
          onAdd: () => setIsManualExpenseDialogOpen(true),
          blockReason: canAddManualExpense ? null : manualExpenseDisabledReason,
        }}
      />

      <div className="w-full min-w-0 space-y-6 p-4 pt-120 md:p-6 md:pt-56 lg:p-8 lg:pt-40">
        <ExpensesSummaryCards
          totalExpenses={totalExpensesAmount}
          totalTaxesAndWithholdings={totalTaxesAndWithholdings}
          xmlProcessed={xmlExpenses.length}
          validXmlPercentage={
            xmlExpenses.length > 0
              ? (validXmlExpenses.length / xmlExpenses.length) * 100
              : 0
          }
          manualExpenses={manualExpensesForSection.length}
          selectedMonth={selectedMes}
        />

        <ExpensesManualExpensesSection
          canAddManualExpense={canAddManualExpense}
          manualExpenseDisabledReason={manualExpenseDisabledReason}
          manualExpensesState={manualExpensesState}
          manualExpenses={manualExpensesForSection}
          onAddManualExpense={() => setIsManualExpenseDialogOpen(true)}
          onEditManual={handleOpenEditManual}
          onDelete={handleDeleteClick}
        />

        <ExpensesXmlTableSection
          expenses={expenses}
          search={search}
          tableState={tableState}
          onDelete={handleDeleteClick}
        />

        <DashboardListPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          itemLabel="resultados"
          navStyle="text"
        />

        <PaymentComplementsSection
          title="Complementos de pago (REP recibidos)"
          complementRole="EGRESO"
          items={paymentComplements}
          pagination={paymentComplementsPagination}
          complementPage={complementPage}
          onComplementPageChange={handleComplementPageChange}
          listState={paymentComplementsState}
          errorMessage={paymentComplementsError}
          showProfileColumn={showComplementProfileColumn}
          detailBasePath="/dashboard/expenses/complementos"
          mes={selectedMes}
          año={selectedAño}
        />

        {selectedProfileId && periodId && (
          <ManualExpenseDialog
            isOpen={isManualExpenseDialogOpen}
            onClose={() => setIsManualExpenseDialogOpen(false)}
            onSuccess={invalidateAfterManualExpense}
            profileId={selectedProfileId}
            periodId={periodId}
            profiles={profiles}
            subscription={subscription}
            expensesUsed={expensesUsed}
          />
        )}

        <EditManualExpenseDialog
          open={!!editingManualExpense}
          editConcept={editConcept}
          onEditConceptChange={setEditConcept}
          editSubtotal={editSubtotal}
          onEditSubtotalChange={setEditSubtotal}
          editIva={editIva}
          onEditIvaChange={setEditIva}
          editIsPaid={editIsPaid}
          onEditIsPaidChange={setEditIsPaid}
          editPaymentDate={editPaymentDate}
          onEditPaymentDateChange={setEditPaymentDate}
          editCategoria={editCategoria}
          onEditCategoriaChange={setEditCategoria}
          editError={editError}
          isUpdatingManual={isUpdatingManual}
          onClose={handleCloseEditManual}
          onSubmit={handleSubmitEditManual}
        />

        <Dialog open={showProfileWarning} onOpenChange={setShowProfileWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Empresa no seleccionada</DialogTitle>
              <DialogDescription>
                Por favor selecciona una empresa antes de agregar un gasto manual.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowProfileWarning(false)}>Entendido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DeleteExpenseDialog
          expense={expenseToDelete}
          deleteConfirmation={deleteConfirmation}
          onDeleteConfirmationChange={setDeleteConfirmation}
          deleteError={deleteError}
          isDeleting={isDeleting}
          onOpenChange={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}
