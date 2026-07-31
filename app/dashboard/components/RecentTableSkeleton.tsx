import { Card } from '@/components/ui/card';

interface RecentTableSkeletonProps {
  title: string;
}

export function RecentTableSkeleton({ title }: RecentTableSkeletonProps) {
  return (
    <Card className="border-border bg-card min-w-0 overflow-hidden p-4 md:p-6" aria-busy>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="bg-muted h-4 w-16 animate-pulse rounded-md" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="bg-muted/60 h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    </Card>
  );
}
