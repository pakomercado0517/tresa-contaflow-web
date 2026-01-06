import Link from "next/link";

export function VerificationFooter() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <Link
            href="#soporte"
            className="hover:text-foreground transition-colors"
          >
            Soporte
          </Link>
          <Link
            href="#terminos"
            className="hover:text-foreground transition-colors"
          >
            Términos y Condiciones
          </Link>
          <Link
            href="#privacidad"
            className="hover:text-foreground transition-colors"
          >
            Política de Privacidad
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          © 2024 Conta Flow. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}



