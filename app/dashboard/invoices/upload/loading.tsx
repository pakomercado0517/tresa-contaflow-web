export default function UploadInvoicesLoading() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="bg-muted h-9 w-72 animate-pulse rounded-md" />
          <div className="bg-muted h-5 w-[560px] max-w-full animate-pulse rounded-md" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="bg-card rounded-lg border p-6 lg:col-span-2">
            <div className="bg-muted h-40 w-full animate-pulse rounded-lg" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="bg-muted h-10 animate-pulse rounded-md" />
              <div className="bg-muted h-10 animate-pulse rounded-md" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="bg-muted h-4 w-full animate-pulse rounded-md" />
              ))}
            </div>
            <div className="bg-muted mt-6 h-10 w-full animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    </main>
  );
}
