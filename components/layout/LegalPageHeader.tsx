import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getOptionalCurrentUser } from '@/lib/api/auth.server';

/**
 * Cabecera para páginas legales públicas (/privacidad, futuro /terminos).
 * Si hay sesión válida, enlaza al panel en lugar de mostrar CTA de registro.
 */
export async function LegalPageHeader() {
  const session = await getOptionalCurrentUser();
  const isLoggedIn = session !== null;

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href={isLoggedIn ? '/dashboard' : '/'}
          className="flex items-center gap-2"
        >
          <Image
            src="/logotipo-contafy.svg"
            alt="Contafy"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-semibold">Contafy</span>
        </Link>

        {!isLoggedIn ? (
          <>
            <nav className="hidden items-center gap-6 md:flex" aria-label="Secciones de la página de inicio">
              <Link
                href="/#beneficios"
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                Beneficios
              </Link>
              <Link
                href="/#demo"
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/#precios"
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                Precios
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/dashboard">Ir al panel</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
