export default function SetupLoading() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 space-y-3">
          <div className="bg-muted h-9 w-56 animate-pulse rounded-md" />
          <div className="bg-muted h-5 w-[460px] max-w-full animate-pulse rounded-md" />
        </div>

        <div className="bg-card rounded-lg border">
          <div className="bg-muted/40 h-12 animate-pulse border-b" />
          <div className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="bg-muted h-28 animate-pulse rounded-lg" />
              ))}
            </div>
            <div className="bg-muted h-96 w-full animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
