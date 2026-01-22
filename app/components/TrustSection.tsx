export function TrustSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8">
      <div className="flex flex-col items-center gap-8">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          UTILIZADO POR NEGOCIOS Y CONTADORES EN MÉXICO
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-12 w-32 bg-muted rounded-lg flex items-center justify-center"
            >
              <span className="text-xs text-muted-foreground">Logo {item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
