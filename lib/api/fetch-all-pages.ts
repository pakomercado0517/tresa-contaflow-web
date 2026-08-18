/**
 * Tope de `limit` en los listados del API (default 50, min 1, max 100).
 * Los reportes/exportaciones recorren páginas de este tamaño en lugar de pedir 1000+.
 */
const API_LIST_PAGE_SIZE_MAX = 100;

export interface PaginatedListResponse<TItem> {
  data: TItem[];
  pagination: {
    totalPages: number;
  };
}

export async function fetchAllPages<TItem>(
  fetchPage: (page: number, limit: number) => Promise<PaginatedListResponse<TItem>>
): Promise<TItem[]> {
  const firstPage = await fetchPage(1, API_LIST_PAGE_SIZE_MAX);
  const firstItems = firstPage.data ?? [];
  const totalPages = firstPage.pagination.totalPages;

  if (!Number.isFinite(totalPages) || totalPages <= 1) {
    return firstItems;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage(index + 2, API_LIST_PAGE_SIZE_MAX)
    )
  );

  return firstItems.concat(
    remainingPages.flatMap((response) => response.data ?? [])
  );
}
