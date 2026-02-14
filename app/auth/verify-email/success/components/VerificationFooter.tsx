import Link from 'next/link';

export function VerificationFooter() {
  return (
    <footer className="border-border bg-background w-full border-t">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="text-muted-foreground flex flex-wrap items-center gap-6 text-sm">
          <Link href="#soporte" className="hover:text-foreground transition-colors">
            Soporte
          </Link>
          <Link href="#terminos" className="hover:text-foreground transition-colors">
            Términos y Condiciones
          </Link>
          <Link href="#privacidad" className="hover:text-foreground transition-colors">
            Política de Privacidad
          </Link>
        </div>
        <div className="text-muted-foreground text-sm">
          © 2024 Contafy. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
