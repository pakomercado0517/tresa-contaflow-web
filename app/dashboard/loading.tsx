export default function DashboardLoading() {
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="space-y-3">
        <div className="bg-muted h-9 w-64 animate-pulse rounded-md" />
        <div className="bg-muted h-5 w-[520px] max-w-full animate-pulse rounded-md" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-7 w-56 animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-72 animate-pulse rounded-md" />
        </div>
        <div className="bg-muted h-10 w-32 animate-pulse rounded-md" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-card rounded-lg border p-4">
            <div className="space-y-3">
              <div className="bg-muted h-4 w-24 animate-pulse rounded-md" />
              <div className="bg-muted h-7 w-28 animate-pulse rounded-md" />
              <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg border">
        <div className="bg-muted/50 h-12 animate-pulse border-b" />
        <div className="p-4">
          <div className="bg-muted h-96 w-full animate-pulse rounded-lg" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="bg-card rounded-lg border p-4">
            <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }, (_, row) => (
                <div key={row} className="flex items-center justify-between gap-4">
                  <div className="bg-muted h-4 w-44 animate-pulse rounded-md" />
                  <div className="bg-muted h-4 w-16 animate-pulse rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
