export function DashboardPreview() {
  return (
    <section id="demo" className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Todo tu control financiero, claro y ordenado
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Visualiza ingresos, gastos y facturas en un solo lugar. 
            Sin hojas de cálculo, sin buscar XML uno por uno y sin depender de terceros 
            para entender cómo va tu negocio o el de tus clientes.
          </p>
          <p className="text-sm text-muted-foreground italic">
            <span className="font-bold">Menos tiempo administrando facturas. Más tiempo tomando decisiones.</span>
          </p>

        </div>

        <div className="flex-1">
          <div className="relative w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/30">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="p-8 bg-background">
              <div className="space-y-6">
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="w-full space-y-4">
                    <div className="h-8 bg-muted/50 rounded w-1/3"></div>
                    <div className="h-32 bg-primary/10 rounded flex items-end justify-center gap-2 p-4">
                      <div className="h-20 w-12 bg-primary rounded"></div>
                      <div className="h-28 w-12 bg-primary rounded"></div>
                      <div className="h-16 w-12 bg-primary rounded"></div>
                      <div className="h-24 w-12 bg-primary rounded"></div>
                      <div className="h-32 w-12 bg-primary rounded"></div>
                      <div className="h-18 w-12 bg-primary rounded"></div>
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
