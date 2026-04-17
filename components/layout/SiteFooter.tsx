import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SiteFooterProps {
  /**
   * `muted`: fondo semitransparente para páginas de autenticación sobre fondos con gradiente.
   * `default`: fondo sólido (landing, páginas legales públicas).
   */
  variant?: 'default' | 'muted';
  /**
   * Enlaces legales (Privacidad, Términos, Ayuda). En dashboard suele ocultarse para un pie más compacto.
   */
  showLegalNav?: boolean;
  className?: string;
}

const linkClass = 'text-muted-foreground hover:text-foreground text-sm transition-colors';

export function SiteFooter({
  variant = 'default',
  showLegalNav = true,
  className,
}: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'border-border w-full border-t',
        variant === 'muted' ? 'bg-background/50 backdrop-blur-sm' : 'bg-background',
        className
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8 lg:px-8">
        <div
          className={cn(
            'flex flex-col gap-6',
            showLegalNav
              ? 'md:flex-row md:items-center md:justify-between md:gap-8'
              : 'md:flex-row md:items-center md:justify-between'
          )}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1 md:gap-4">
            <span className="text-sm font-semibold">Contafy</span>
            <span className="text-muted-foreground text-xs">
              © {currentYear} Todos los derechos reservados.
            </span>
          </div>

          {showLegalNav ? (
            <nav
              aria-label="Enlaces legales y ayuda"
              className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm md:flex-1 md:justify-center"
            >
              <Link href="/privacidad" className={linkClass}>
                Privacidad
              </Link>
              <Link href="#terminos" className={linkClass}>
                Términos
              </Link>
              <a href="mailto:admin@contafy.com.mx" className={linkClass}>
                Ayuda
              </a>
            </nav>
          ) : null}

          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm md:shrink-0">
            <span>Elaborado por</span>
            <Image
              src="/logotipo-tresa-design.svg"
              alt="Tresa Design"
              width={120}
              height={24}
              className="h-14 w-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
