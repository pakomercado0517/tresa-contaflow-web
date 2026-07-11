import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 md:gap-4 md:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logotipo-contafy.svg"
            alt="Contafy"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-semibold">Contafy</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#beneficios"
            className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
          >
            Beneficios
          </Link>
          <Link
            href="#demo"
            className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="#precios"
            className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
          >
            Precios
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary px-2.5 text-xs text-primary hover:bg-primary/10 md:h-9 md:px-4 md:text-sm"
          >
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-primary px-2.5 text-xs hover:bg-primary/90 md:h-9 md:px-4 md:text-sm"
          >
            <Link href="/auth/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
