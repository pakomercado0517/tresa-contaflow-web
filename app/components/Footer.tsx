import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="h-4 w-1 bg-primary rounded-full"></div>
              <div className="h-6 w-1 bg-primary rounded-full"></div>
              <div className="h-8 w-1 bg-primary rounded-full"></div>
            </div>
            <span className="text-xl font-semibold">Conta Flow</span>
          </Link>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="#privacidad"
              className="hover:text-foreground transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="#terminos"
              className="hover:text-foreground transition-colors"
            >
              Términos
            </Link>
            <Link
              href="#soporte"
              className="hover:text-foreground transition-colors"
            >
              Soporte
            </Link>
            <span className="text-muted-foreground">
              © 2024 Conta Flow Inc. Todos los derechos reservados.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

