export function DashboardPreview() {
  return (
    <section id="demo" className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Todo tu control financiero, claro y ordenado
          </h2>
          <p className="text-muted-foreground max-w-xl text-lg">
            Visualiza ingresos, gastos y facturas en un solo lugar. Sin hojas de cálculo, sin buscar
            XML uno por uno y sin depender de terceros para entender cómo va tu negocio o el de tus
            clientes.
          </p>
          <p className="text-muted-foreground text-sm italic">
            <span className="font-bold">
              Menos tiempo administrando facturas. Más tiempo tomando decisiones.
            </span>
          </p>
        </div>

        <div className="flex-1">
          <div className="border-border bg-card relative w-full overflow-hidden rounded-lg border shadow-lg">
            <div className="border-border bg-muted/30 flex items-center gap-2 border-b p-4">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="bg-background p-8">
              <div className="space-y-6">
                <div className="bg-muted/30 flex h-64 items-center justify-center rounded-lg">
                  <div className="w-full space-y-4">
                    <div className="bg-muted/50 h-8 w-1/3 rounded"></div>
                    <div className="bg-primary/10 flex h-32 items-end justify-center gap-2 rounded p-4">
                      <div className="bg-primary h-20 w-12 rounded"></div>
                      <div className="bg-primary h-28 w-12 rounded"></div>
                      <div className="bg-primary h-16 w-12 rounded"></div>
                      <div className="bg-primary h-24 w-12 rounded"></div>
                      <div className="bg-primary h-32 w-12 rounded"></div>
                      <div className="bg-primary h-18 w-12 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
