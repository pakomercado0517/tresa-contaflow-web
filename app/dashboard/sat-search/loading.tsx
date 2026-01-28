export default function SatSearchLoading() {
  return (
    <div className="from-background to-muted/20 flex min-h-screen flex-col bg-gradient-to-b">
      <div className="container mx-auto flex flex-1 flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-muted h-10 w-[520px] max-w-full animate-pulse rounded-md" />
          <div className="bg-muted h-5 w-[680px] max-w-full animate-pulse rounded-md" />
        </div>

        <div className="bg-card rounded-2xl border p-4">
          <div className="bg-muted h-12 w-full animate-pulse rounded-xl" />
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
            <div className="bg-muted h-6 w-32 animate-pulse rounded-full" />
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-4">
          <div className="bg-muted h-4 w-44 animate-pulse rounded-md" />
          <div className="bg-muted mt-3 h-4 w-80 animate-pulse rounded-md" />
        </div>

        <div className="space-y-3">
          <div className="bg-muted h-6 w-32 animate-pulse rounded-md" />
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
