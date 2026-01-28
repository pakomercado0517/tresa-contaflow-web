interface TableRowsSkeletonProps {
  rows?: number;
  columnWidths?: string[];
}

const DEFAULT_COLUMN_WIDTHS = ['w-44', 'w-24', 'w-40', 'w-40', 'w-32', 'w-24', 'w-28', 'w-24'];

export function TableRowsSkeleton({
  rows = 8,
  columnWidths = DEFAULT_COLUMN_WIDTHS,
}: TableRowsSkeletonProps) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="border-border flex items-center gap-4 border-b px-4 py-3">
          {columnWidths.map((widthClass, colIndex) => (
            <div
              key={colIndex}
              className={`bg-muted-foreground/20 h-4 ${widthClass} max-w-full rounded-md`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
